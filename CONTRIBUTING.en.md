# Abliterater contributing guide

Patches, measurements, and reviews are welcome — **please contribute with us.** Completeness is not high yet. Do not upload keys, research dumps, or KDP PDFs. Third-party commercial use, illegal use, and abuse are **not licensed** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md). Use **outside our grant** is unauthorized. **Illegal acts you commit with this software or with models or outputs you produce using it are your responsibility.** A PR is a grant on AGPL-3.0-or-later **and** those additional terms.

This repository is **educational**. It asks for **worldwide attention** to counter illegal misuse. analog `npm test` is not a native / GPU close. Do not flip ledger OPEN cells without the close evidence named in [USER-GUIDE.en.md](./USER-GUIDE.en.md#still-open-per-ledger-never-sum).

Korean: [CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md). Usage: [USER-GUIDE.en.md](./USER-GUIDE.en.md). Gift or collaboration: [SUPPORT.en.md](./SUPPORT.en.md).

---

## Before you start

1. Read and accept [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md).
2. Contribute under AGPL-3.0-or-later **and** those additional terms. No separate CLA. A PR is a grant on the same terms.
3. Never put secrets in issues, logs, or commits. `.env` is gitignored. `.env.example` is comments only.

Copyright holder: support@genox.one · GENOX · Juno Andy Cheong · https://github.com/genoxone20261

---

## Local

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run ledger:status
```

- Node 24. Do not fetch tsx via `npx`. Use local `node_modules/tsx`.
- `npm run format` (`prettier --write`) mutates the tree. Do not run it unasked.
- analog `npm test` pass ≠ native Electron persist / GPU golden close. Do not promote ledger OPEN cells from tests alone.

---

## Help wanted

Contribute **with us**. Pick one row. Send the close evidence. Do not analog-GREEN.

| Kind | OPEN | Evidence that closes |
| --- | --- | --- |
| Packaged Electron | 02, 13, 14, 16, 18, 20 | installer persist-reject, source-free launch, keyboard, CRUD |
| GPU golden (your bill) | R-004, R-005 | this-machine Heretic 4B / QLoRA log + VRAM |
| In-app Hub live | R-009 | overlay matching the workload markdown cell |
| Prod / Docker / a11y | W01, W08, W14, W16 | this-source compose + product-flow + keyboard |
| SSH / cost | C-002 … C-007 | live connect, same-workload $ cited |
| Docs / i18n | — | EN chrome leftover, first-run, AUP wording |

This repository does not pay your cloud. Listing an instance is not a golden run.

---

## Do not upload

| Path | Why |
| --- | --- |
| all of `docs/` | Session research dumps. Banned on public git |
| `public/reports/` | Author KDP PDFs. Disk only |
| `.env`, Vast/connection-list JSON, key files | Credentials |
| `electron/release*`, `win-unpacked` | Binaries. Release assets only |
| `node_modules`, `.vercel`, `.hermes` | Generated |
| Whole AGPL tool trees (`heretic`, OBLITERATUS, abliterix) | Pin-call only. No vendor |

Live ledgers the code parses live in `src/data/`. Do not move them back to `docs/maximum-completion/`.

---

## Patch rules

- Tabs are **Workbench (1)** / **Research (2)** only. No KDP/document-library tab.
- `DEFAULT_STATE.base` is `qwen3-4b` (`Qwen/Qwen3-4B-Instruct-2507`). `PRESETS[0]` is `method-compare`. Do not default to a heretic GGUF.
- i18n: ko/en key parity. No leftover Hangul on the EN chrome.
- Keys stay in screen memory. Not localStorage, ZIP, or diagnostics.
- Do not grow the PACK ZIP allowlist (`run.sh` / `run.ps1` and the listed stubs).
- Do not promote ledger OPEN rows to analog IMPLEMENTED. Do not sum ledgers.
- License: port MIT/Apache/BSD only after reading LICENSE. No SUL/fair-code vendor. No SPDX guesses.

Do not `git add -A`. Commit message: one line of what changed.

---

## PR checklist

- [ ] `npm run typecheck` · `lint` · `test` exit 0
- [ ] Secret scan (real keys 0)
- [ ] Ledger cells unchanged without evidence
- [ ] ACCEPTABLE-USE accepted
- [ ] New UI has ko/en

CI is `.github/workflows/ci.yml`. Packaged binaries are Release assets from a tag or `workflow_dispatch`.

---

## Security issues

Do not attach keys or personal data to a public issue. Email `support@genox.one`.
