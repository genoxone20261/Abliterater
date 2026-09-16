#!/usr/bin/env python3
"""Bounded public-metadata harvester for ML ecosystem discovery.

No login bypass, robots bypass, model weights, dataset payloads, or secrets.
GitHub tool revisions are full HEAD SHAs (not branch names). When runners.ts
pins are present, matching github ids get pinnedSha + drift flags.
"""
from __future__ import annotations
import argparse, hashlib, json, re, subprocess, time, urllib.parse, urllib.request, xml.etree.ElementTree as ET
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

UA = "AbliteraterMetadataHarvester/1.0 (+research metadata only)"
MAX_BODY = 5_000_000


def get_json(url: str):
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as res:
        body = res.read(MAX_BODY + 1)
        if len(body) > MAX_BODY:
            raise ValueError("response exceeds 5MB")
        return json.loads(body), dict(res.headers), res.status


def get_xml(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as res:
        body = res.read(MAX_BODY + 1)
        if len(body) > MAX_BODY:
            raise ValueError("response exceeds 5MB")
        return ET.fromstring(body), dict(res.headers), res.status


def safe(v, n=1000):
    return str(v or "").replace("\x00", "")[:n]


def github_head_sha(full_name: str) -> str:
    url = f"https://github.com/{full_name}.git"
    out = subprocess.check_output(["git", "ls-remote", url, "HEAD"], text=True, timeout=60).strip()
    if not out:
        raise RuntimeError(f"empty ls-remote for {full_name}")
    sha = out.split()[0].strip()
    if len(sha) < 40:
        raise RuntimeError(f"unexpected sha for {full_name}: {sha!r}")
    return sha[:40]


def parse_runners_pins(runners_path: Path) -> dict[str, str]:
    text = runners_path.read_text(encoding="utf-8")
    pins: dict[str, str] = {}
    for m in re.finditer(
        r"github\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+?)(?:\.git)?@([0-9a-f]{7,40})",
        text,
    ):
        pins[f"{m.group(1)}/{m.group(2)}"] = m.group(3)
    for m in re.finditer(
        r'const\s+\w+_GIT\s*=\s*"https://github\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+?)(?:\.git)?";\s*\nconst\s+\w+_SHA\s*=\s*"([0-9a-f]{40})";',
        text,
    ):
        pins[f"{m.group(1)}/{m.group(2)}"] = m.group(3)
    return pins


def attach_runner_drift(items: list, pins: dict[str, str]) -> None:
    for item in items:
        if item.get("source") != "github":
            continue
        rid = item.get("id") or ""
        pin = pins.get(rid)
        if not pin:
            continue
        rev = str(item.get("revision") or "")
        item["pinnedSha"] = pin
        item["drift"] = not (rev == pin or rev.startswith(pin) or pin.startswith(rev))


def hf(kind: str, query: str, limit: int):
    url = "https://huggingface.co/api/" + ("models" if kind == "model" else "datasets") + "?" + urllib.parse.urlencode({"search": query, "limit": limit, "sort": "downloads", "direction": "-1"})
    rows, headers, status = get_json(url)
    items = []
    for r in rows if isinstance(rows, list) else []:
        tags = r.get("tags") if isinstance(r.get("tags"), list) else []
        license_tag = next((t[8:] for t in tags if isinstance(t, str) and t.startswith("license:")), "")
        rid = safe(r.get("id") or r.get("modelId"), 240)
        items.append({"kind": kind, "source": "huggingface", "id": rid, "url": f"https://huggingface.co/{'datasets/' if kind == 'dataset' else ''}{rid}", "revision": safe(r.get("sha"), 100), "license": license_tag or "unknown", "downloads": r.get("downloads"), "likes": r.get("likes"), "updated": safe(r.get("lastModified"), 40), "summary": safe(r.get("description"), 500)})
    return url, status, headers, items


def github(query: str, limit: int):
    url = "https://api.github.com/search/repositories?" + urllib.parse.urlencode({"q": query, "per_page": limit, "sort": "stars", "order": "desc"})
    data, headers, status = get_json(url)
    items = []
    for r in data.get("items", []) if isinstance(data, dict) else []:
        lic = r.get("license") if isinstance(r.get("license"), dict) else {}
        full = safe(r.get("full_name"), 240)
        branch = safe(r.get("default_branch"), 100)
        try:
            sha = github_head_sha(full)
        except Exception as exc:
            items.append({"kind": "tool", "source": "github", "id": full, "url": safe(r.get("html_url"), 500), "revision": branch, "default_branch": branch, "license": safe(lic.get("spdx_id"), 80) or "unknown", "stars": r.get("stargazers_count"), "updated": safe(r.get("pushed_at"), 40), "summary": safe(r.get("description"), 500), "shaError": safe(exc, 300)})
            continue
        items.append({"kind": "tool", "source": "github", "id": full, "url": safe(r.get("html_url"), 500), "revision": sha, "default_branch": branch, "license": safe(lic.get("spdx_id"), 80) or "unknown", "stars": r.get("stargazers_count"), "updated": safe(r.get("pushed_at"), 40), "summary": safe(r.get("description"), 500)})
    return url, status, headers, items


def arxiv(query: str, limit: int):
    url = "https://export.arxiv.org/api/query?" + urllib.parse.urlencode({"search_query": "all:" + query, "max_results": limit, "sortBy": "submittedDate", "sortOrder": "descending"})
    root, headers, status = get_xml(url)
    ns = {"a": "http://www.w3.org/2005/Atom"}
    items = []
    for e in root.findall("a:entry", ns):
        link = safe(e.findtext("a:id", "", ns), 500)
        items.append({"kind": "paper", "source": "arxiv", "id": link.rsplit("/", 1)[-1], "url": link.replace("http://", "https://"), "revision": link.rsplit("/", 1)[-1], "license": "paper-specific", "updated": safe(e.findtext("a:updated", "", ns), 40), "title": safe(e.findtext("a:title", "", ns).strip(), 500), "summary": safe(e.findtext("a:summary", "", ns).strip(), 1000), "authors": [safe(a.findtext("a:name", "", ns), 200) for a in e.findall("a:author", ns)]})
    return url, status, headers, items


def with_retry(fn, attempts=3):
    for attempt in range(attempts):
        try:
            return fn()
        except urllib.error.HTTPError as exc:
            if exc.code != 429 or attempt + 1 == attempts:
                raise
            time.sleep(10 * (attempt + 1))


def collect(out: Path, limit: int, runners: Path | None):
    queries = {
        "model": ["reinforcement learning", "code", "biology", "quantized", "multimodal"],
        "dataset": ["reinforcement learning", "instruction tuning", "preference", "code", "science"],
        "tool": ["LLM evaluation", "reinforcement learning", "fine tuning LLM", "distributed training", "ML observability"],
        "paper": ["LLM evaluation", "agentic reinforcement learning", "preference optimization", "LLM quantization", "distributed LLM training"],
    }
    observed = datetime.now(timezone.utc).isoformat()
    items, sources, failures = [], [], []
    for kind, qs in queries.items():
        for q in qs:
            try:
                if kind in ("model", "dataset"):
                    url, status, headers, rows = hf(kind, q, limit)
                elif kind == "tool":
                    url, status, headers, rows = github(q, limit)
                else:
                    url, status, headers, rows = with_retry(lambda: arxiv(q, limit))
                items.extend(rows)
                sources.append({"kind": kind, "query": q, "url": url, "status": status, "etag": safe(headers.get("ETag"), 300), "lastModified": safe(headers.get("Last-Modified"), 100), "count": len(rows)})
            except Exception as exc:
                failures.append({"kind": kind, "query": q, "error": safe(exc, 500)})
            time.sleep(4 if kind == "paper" else 7 if kind == "tool" else 0.5)
    dedup = {}
    for item in items:
        dedup[f"{item['kind']}:{item['source']}:{item['id']}"] = item
    merged = sorted(dedup.values(), key=lambda x: (x["kind"], x["source"], x["id"]))
    pins = {}
    if runners and runners.is_file():
        pins = parse_runners_pins(runners)
        attach_runner_drift(merged, pins)
    payload = {"schemaVersion": 1, "observedAt": observed, "scope": "public metadata only", "licenseWarning": "source metadata is not permission to download, train, redistribute, or use commercially", "runnersPins": pins, "sources": sources, "failures": failures, "items": merged}
    raw = json.dumps(payload, ensure_ascii=False, indent=2).encode()
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(raw)
    digest = hashlib.sha256(raw).hexdigest()
    (out.parent / (out.name + ".sha256")).write_text(f"{digest}  {out.name}\n", encoding="ascii")
    drift_n = sum(1 for i in merged if i.get("drift") is True)
    print(json.dumps({"output": str(out), "items": len(payload["items"]), "sources": len(sources), "failures": failures, "sha256": digest, "runnersPins": len(pins), "drift": drift_n}, ensure_ascii=False, indent=2))
    if failures:
        raise SystemExit(2)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, default=Path("artifacts/ecosystem/public-metadata.json"))
    ap.add_argument("--limit", type=int, default=20)
    ap.add_argument("--runners", type=Path, default=Path("src/lib/runners.ts"), help="runners.ts for pin drift compare; missing path skips")
    a = ap.parse_args()
    if not 1 <= a.limit <= 50:
        ap.error("--limit must be 1..50")
    runners = a.runners if a.runners.is_file() else None
    collect(a.out, a.limit, runners)
