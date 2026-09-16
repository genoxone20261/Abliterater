#!/usr/bin/env python3
"""
abliterater_orch.py — Multi-Pool Multi-Model Orchestrator
=========================================================
실측 기반. 2026-09-05.

Pool → model (18081 CAPABILITY_POOLS 기반, /usage probe로 live 검증):
  code     → gpt-5.6-sol → kimi-k2.7-code → codestral-2501 → gpt-5.3-codex → kimi-k2.6 → MiniMax-M3
  reason   → gpt-5.6-sol → gpt-5.6-luna → gpt-5.6-terra → gpt-5.5 → deepseek-v4-pro → gpt-5.4-pro
  hard     → gpt-5.6-sol → gpt-5.6-luna → gpt-5.6-terra → deepseek-v4-pro → gpt-5.4-pro
  bulk     → gpt-5.4-mini → gpt-4.1-mini → deepseek-v4-flash (solo workers)
  exec     → gpt-5.6-luna → gpt-5.5 → gpt-5.6-terra → gpt-5.4-pro
  agent    → gpt-5.6-luna → gpt-5.5 → gpt-5.6-terra → MiniMax-M3

Max parallelism: 20 models across all pools.
Retry rule: ≤ 4 failures per model → immediate pool rotation.
Usage: python abliterater_orch.py --task "..." --pool code [--workers N]
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from dataclasses import dataclass, field
from typing import Optional

PROXY = "http://127.0.0.1:18081/openai/v1"
MAX_PARALLEL = 20
MAX_RETRIES_PER_MODEL = 4

# 18081 CAPABILITY_POOLS에 기반한 fallback chain (probe 검증)
POOL_CHAINS: dict[str, list[str]] = {
    "code": [
        "gpt-5.6-sol",
        "gpt-5.6-luna",
        "kimi-k2.7-code",
        "codestral-2501",
        "gpt-5.3-codex",
        "kimi-k2.6",
        "MiniMaxAI/MiniMax-M3",
    ],
    "reason": [
        "gpt-5.6-sol",
        "gpt-5.6-luna",
        "gpt-5.6-terra",
        "gpt-5.5",
        "deepseek-v4-pro",
        "gpt-5.4-pro",
    ],
    "hard": [
        "gpt-5.6-sol",
        "gpt-5.6-luna",
        "gpt-5.6-terra",
        "deepseek-v4-pro",
        "gpt-5.4-pro",
    ],
    "bulk": [
        "gpt-5.4-mini",
        "gpt-4.1-mini",
        "deepseek-v4-flash",
    ],
    "exec": [
        "gpt-5.6-luna",
        "gpt-5.5",
        "gpt-5.6-terra",
        "gpt-5.4-pro",
    ],
    "agent": [
        "gpt-5.6-luna",
        "gpt-5.5",
        "gpt-5.6-terra",
        "MiniMaxAI/MiniMax-M3",
    ],
}

ADMISSION_CAPS: dict[str, int] = {
    "gpt-5.6-sol": 4,
    "gpt-5.6-luna": 5,
    "gpt-5.6-terra": 5,
    "gpt-5.4-mini": 7,
    "gpt-4.1-mini": 8,
    "deepseek-v4-pro": 1,
    "deepseek-v4-flash": 1,
    "kimi-k2.7-code": 1,
    "codestral-2501": 1,
    "gpt-5.3-codex": 2,
    "gpt-5.5": 6,
    "gpt-5.4-pro": 1,
    "MiniMaxAI/MiniMax-M3": 2,
    "gpt-4.1": 5,
    "grok-4.3": 1,
}


@dataclass
class ProbeResult:
    model: str
    ok: bool
    error_code: Optional[str] = None
    error_msg: Optional[str] = None
    latency_ms: Optional[float] = None


@dataclass
class WorkerResult:
    model: str
    pool: str
    success: bool
    output: str = ""
    error: str = ""
    retries: int = 0
    latency_ms: float = 0.0


def probe_model(model: str, prompt: str = "hi", timeout: int = 30) -> ProbeResult:
    """Single-model probe via 18081 proxy. Returns ProbeResult."""
    t0 = time.time()
    try:
        r = subprocess.run(
            [
                "curl", "-sS", "--max-time", str(timeout),
                PROXY + "/chat/completions",
                "-H", "Content-Type: application/json",
                "-H", "Authorization: Bearer test",
                "-d", json.dumps({
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 8,
                }),
            ],
            capture_output=True, text=True, timeout=timeout + 5,
        )
        latency = (time.time() - t0) * 1000
        data = json.loads(r.stdout)
        err = data.get("error", {})
        if err:
            return ProbeResult(model=model, ok=False,
                               error_code=err.get("code"), error_msg=err.get("message"),
                               latency_ms=latency)
        return ProbeResult(model=data.get("model", model), ok=True, latency_ms=latency)
    except subprocess.TimeoutExpired:
        return ProbeResult(model=model, ok=False, error_code="timeout",
                           error_msg=f"timeout after {timeout}s", latency_ms=(time.time()-t0)*1000)
    except Exception as e:
        return ProbeResult(model=model, ok=False, error_code="exception",
                           error_msg=str(e), latency_ms=(time.time()-t0)*1000)


def probe_pool(chain: list[str], timeout: int = 25) -> list[ProbeResult]:
    """Probe every model in a chain sequentially. Returns all results."""
    results = []
    for m in chain:
        r = probe_model(m, timeout=timeout)
        results.append(r)
        if r.ok:
            break   # first success = chain head
    return results


def probe_usage() -> dict:
    """GET /usage from 18081 proxy. Returns parsed JSON."""
    try:
        r = subprocess.run(
            ["curl", "-sS", "--max-time", "10",
             "http://127.0.0.1:18081/usage"],
            capture_output=True, text=True, timeout=15,
        )
        return json.loads(r.stdout)
    except Exception:
        return {}


def run_worker(pool: str, model: str, task: str, max_tokens: int = 4096,
               timeout: int = 120) -> WorkerResult:
    """Single worker: call model with task. Retry ≤4 times on failure."""
    prompt = task
    retries = 0
    t0 = time.time()
    last_error = ""
    for attempt in range(1, MAX_RETRIES_PER_MODEL + 2):
        r = subprocess.run(
            [
                "curl", "-sS", "--max-time", str(timeout),
                PROXY + "/chat/completions",
                "-H", "Content-Type: application/json",
                "-H", "Authorization: Bearer test",
                "-d", json.dumps({
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                }),
            ],
            capture_output=True, text=True, timeout=timeout + 5,
        )
        try:
            data = json.loads(r.stdout)
        except json.JSONDecodeError:
            last_error = f"JSON parse fail: {r.stdout[:200]}"
            retries = attempt
            continue

        err = data.get("error", {})
        if err:
            ec = err.get("code", "")
            em = err.get("message", "")[:200]
            last_error = f"{ec}: {em}"
            # Hard failure types — don't retry
            if ec in ("invalid_request", "context_length_exceeded", "rate_limit_exceeded"):
                break
            retries = attempt
            continue

        latency = (time.time() - t0) * 1000
        content = ""
        for c in data.get("choices", []):
            if isinstance(c, dict):
                msg = c.get("message", {})
                if isinstance(msg, dict):
                    content = msg.get("content", "")
        return WorkerResult(
            model=model, pool=pool, success=True,
            output=content, retries=retries, latency_ms=latency,
        )

    return WorkerResult(
        model=model, pool=pool, success=False,
        error=last_error, retries=retries, latency_ms=(time.time()-t0)*1000,
    )


def pick_best_from_probe(probe_results: list[ProbeResult]) -> tuple[str, bool]:
    """From probe results pick first OK model. Returns (model, ok)."""
    for r in probe_results:
        if r.ok:
            return r.model, True
    return probe_results[-1].model if probe_results else "", False


def plan_workers(pool: str, workers: int) -> list[str]:
    """Enumerate workers — each gets a distinct model from the pool chain."""
    chain = POOL_CHAINS.get(pool, POOL_CHAINS["exec"])
    cap = ADMISSION_CAPS

    slots = []
    # Round-robin fill respecting admission caps
    used = {m: 0 for m in chain}
    for _ in range(workers):
        for m in chain:
            if used.get(m, 0) < cap.get(m, 1):
                slots.append(m)
                used[m] = used.get(m, 0) + 1
                break

    total_slots = sum(used.values())
    if total_slots > MAX_PARALLEL:
        print(f"[orch] WARNING: {total_slots} > {MAX_PARALLEL} parallel slots, capping", file=sys.stderr)
        slots = slots[:MAX_PARALLEL]
    return slots


def orch_print(results: list[WorkerResult]) -> None:
    ok = [r for r in results if r.success]
    fail = [r for r in results if not r.success]
    print(f"\n{'='*60}")
    print(f"RESULTS: {len(ok)}/{len(results)} succeeded")
    print(f"{'='*60}")
    for r in results:
        status = "OK" if r.success else f"FAIL({r.error[:80]})"
        print(f"  [{r.pool}] {r.model} — {status} | retries={r.retries} | {r.latency_ms:.0f}ms")
    if ok:
        print(f"\n--- Best output (first OK) ---")
        print(ok[0].output[:2000])


def main():
    ap = argparse.ArgumentParser(description="Abliterater Multi-Pool Orchestrator")
    ap.add_argument("--task", "-t", required=True, help="Task description")
    ap.add_argument("--pool", "-p", default="exec",
                    choices=list(POOL_CHAINS.keys()),
                    help="Capability pool (code/reason/hard/bulk/exec/agent)")
    ap.add_argument("--workers", "-w", type=int, default=3,
                    help=f"Parallel workers (max {MAX_PARALLEL})")
    ap.add_argument("--max-tokens", "-m", type=int, default=4096)
    ap.add_argument("--timeout", type=int, default=120,
                    help="Seconds per worker")
    ap.add_argument("--probe-only", action="store_true",
                    help="Only probe pool models, don't run task")
    ap.add_argument("--health", action="store_true",
                    help="Print /usage snapshot and exit")
    # health short-circuits everything (no --task needed)
    if "--health" in sys.argv:
        u = probe_usage()
        families = u.get("families", {})
        print(f"Proxy ONLINE: {u.get('status','?')}")
        print(f"Families: {len(families)}")
        for fam, info in sorted(families.items()):
            ready = info.get("hubs_ready", 0)
            total = info.get("hubs_total", 0)
            rem = info.get("remaining_tokens", "n/a")
            cap = info.get("admission_cap", "?")
            print(f"  {fam:35s} ready={ready}/{total} cap={cap} remaining={rem}")
        return

    args = ap.parse_args()

    pool = args.pool
    workers = min(args.workers, MAX_PARALLEL)
    chain = POOL_CHAINS[pool]

    print(f"[orch] pool={pool} workers={workers}")
    print(f"[orch] chain: {' → '.join(chain)}")

    if args.probe_only:
        print(f"[orch] Probing pool '{pool}'...")
        results = probe_pool(chain)
        for r in results:
            status = "OK" if r.ok else f"FAIL({r.error_code}: {r.error_msg})"
            print(f"  {r.model:35s} {status} {r.latency_ms:.0f}ms")
        return

    # Plan slot allocation
    slots = plan_workers(pool, workers)
    print(f"[orch] Slot allocation: {slots}")
    print(f"[orch] Running {len(slots)} workers...")

    results: list[WorkerResult] = []
    for i, model in enumerate(slots):
        print(f"[orch] [{i+1}/{len(slots)}] {model} ...", end=" ", flush=True)
        r = run_worker(pool, model, args.task, args.max_tokens, args.timeout)
        status = "OK" if r.success else f"FAIL"
        print(f"{status} ({r.latency_ms:.0f}ms)")
        results.append(r)
        time.sleep(0.3)  # small stagger to avoid burst

    orch_print(results)


if __name__ == "__main__":
    main()
