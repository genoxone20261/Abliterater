#!/usr/bin/env python3
"""Create a sorted, deduplicated public ecosystem index from harvester outputs."""
from __future__ import annotations
import argparse, hashlib, json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", nargs="+", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    args = ap.parse_args()
    merged: dict[str, dict] = {}
    sources: list[dict] = []
    failures: list[dict] = []
    observed: list[str] = []
    for path in args.input:
        payload = json.loads(path.read_text(encoding="utf-8"))
        observed.append(str(payload.get("observedAt", "")))
        sources.extend(payload.get("sources", []))
        failures.extend(payload.get("failures", []))
        for item in payload.get("items", []):
            key = f"{item.get('kind')}:{item.get('source')}:{item.get('id')}"
            previous = merged.get(key, {})
            merged[key] = {**previous, **item}
    items = sorted(merged.values(), key=lambda x: (x.get("kind", ""), x.get("source", ""), x.get("id", "")))
    output = {
        "schemaVersion": 2,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "observations": sorted({x for x in observed if x}),
        "scope": "public metadata only",
        "licenseWarning": "Metadata is not permission to download, train, redistribute, or use commercially.",
        "sourceCount": len(sources),
        "itemCount": len(items),
        "countsByKind": dict(sorted(Counter(x.get("kind", "unknown") for x in items).items())),
        "countsBySource": dict(sorted(Counter(x.get("source", "unknown") for x in items).items())),
        "unknownLicenseCount": sum(x.get("license") in (None, "", "unknown", "미확인 — 원본 약관 확인") for x in items),
        "failures": failures,
        "items": items,
    }
    raw = json.dumps(output, ensure_ascii=False, indent=2).encode("utf-8")
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_bytes(raw)
    digest = hashlib.sha256(raw).hexdigest()
    args.out.with_name(args.out.name + ".sha256").write_text(f"{digest}  {args.out.name}\n", encoding="ascii")
    print(json.dumps({"output": str(args.out), "items": len(items), "sha256": digest, "failures": len(failures)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
