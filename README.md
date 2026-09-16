# Abliterater

**Educational workbench** for studying refusal-suppression (*abliteration*) so researchers and defenders can **counter illegal misuse**. That purpose needs **worldwide attention**. This is not an attack runbook.

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**Contributions are welcome.** Third-party **commercial use, illegal use, and abuse are not licensed** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md). A pull request is a grant on AGPL-3.0-or-later **and** those additional terms.

![Abliterater workbench](./workbench.png)

## Languages

This file is **English only**. Other landings:

| Language | File |
| --- | --- |
| English | [README.md](./README.md) (this file) |
| Korean | [README.ko.md](./README.ko.md) |
| Japanese | [README.ja.md](./README.ja.md) |
| Simplified Chinese | [README.zh-Hans.md](./README.zh-Hans.md) |
| Traditional Chinese | [README.zh-Hant.md](./README.zh-Hant.md) |
| Spanish | [README.es.md](./README.es.md) |
| French | [README.fr.md](./README.fr.md) |
| German | [README.de.md](./README.de.md) |
| Portuguese (Brazil) | [README.pt-BR.md](./README.pt-BR.md) |
| Russian | [README.ru.md](./README.ru.md) |
| Arabic | [README.ar.md](./README.ar.md) |
| Vietnamese | [README.vi.md](./README.vi.md) |
| Indonesian | [README.id.md](./README.id.md) |

The in-app UI is Korean / English via a locale toggle. Extra README files are landings, not extra UI locales. Full install and remaining OPEN: [USER-GUIDE.en.md](./USER-GUIDE.en.md).

## What it does

Pick an **unabliterated Instruct** base, assemble a Heretic / LoRA / quant **pack ZIP**, and connect **your** GPU-cloud keys.

| Surface | Role |
| --- | --- |
| Workbench (tab `1`) | Build · Explore · Connect |
| Research (tab `2`) | arXiv and GitHub links (`target=_blank`) |

Default catalog base is `Qwen/Qwen3-4B-Instruct-2507` (work original), method Heretic, output merged BF16. Already-processed heretic/GGUF cards are a **reuse lane**, not the default. `PRESETS[0]` is `method-compare` (Instruct work), then `domain-lora`, then `local-gguf` last.

Build holds catalog chips and presets. Explore holds recommendations and SourceHub search. Connect pastes **your** keys in screen memory only.

## What it does not

- Host or redistribute model weights.
- Rent GPUs on your behalf. Listing an instance is not a training run.
- Vendor AGPL trees (heretic, OBLITERATUS, abliterix) into `src/`. Pin-call only.
- Ship author KDP PDFs. `public/reports/` stays on the author's disk.
- Close native / GPU / Electron ledgers because `npm test` passed. Analog web at `:8080` is not a native close.

## Pack ZIP

The download is a recipe, not a trained model. Allowlist only:

`run.sh`, `run.ps1`, empty Azure stubs, `docker-compose.yml`, `train_lora.py`, `eval.sh`, `Modelfile`, `heretic.args.txt`, `SYSTEM.txt`, `POWER.txt`, `POWER.en.txt`, `SFT.txt`, `eval.txt`, `job.json`, `README.txt`.

Always both `run.sh` and `run.ps1`. Compute chips: `local-cuda`, `local-rocm`, `local-metal`, `local-cpu`.

## Honesty

`analog IMPLEMENTED` ≠ native close. Never sum ledgers. Live dump: `npm run ledger:status`. Why each OPEN row: [USER-GUIDE.en.md](./USER-GUIDE.en.md#still-open-per-ledger-never-sum).

## Quick start

Need Node 24.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

Open `http://127.0.0.1:8080/`.

```bash
npm run typecheck
npm run lint
npm test
npm run ledger:status
```

### Production web (no Vite)

```bash
npm ci
npm run build
HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs
```

### Docker

```bash
docker compose up -d --build
# http://127.0.0.1:8080/
```

A container that has been healthy for hours is not proof of **this** source. Rebuild with `--build` after you change `src/`.

### Desktop

```bash
npm run electron:dev
# after npm run build:
npm run electron:build:win    # NSIS + portable (Windows host)
npm run electron:build:linux  # AppImage (Linux host or CI)
npm run electron:build:mac    # DMG (macOS host or CI)
```

Windows NSIS is unsigned by default (`CSC_IDENTITY_AUTO_DISCOVERY=false` unless `CSC_LINK` / `WIN_CSC_LINK` is set). SmartScreen **Unknown publisher** is expected. macOS DMG is not produced on Windows. Unsigned analog ≠ Authenticode (E03).

## Documentation

| File | Contents |
| --- | --- |
| [USER-GUIDE.en.md](./USER-GUIDE.en.md) | Install, chrome, workbench, pack ZIP, remaining OPEN **per ledger** (Korean: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md)) |
| [CONTRIBUTING.en.md](./CONTRIBUTING.en.md) | How to patch. Contribute with us if you accept the AUP |
| [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md) | No third-party commercial / illegal / abusive use |
| [SUPPORT.en.md](./SUPPORT.en.md) | Sponsor (donation) vs invest (inquiry) |
| [SECURITY.md](./SECURITY.md) | How to report a vulnerability |
| [LICENSE.md](./LICENSE.md) | AGPL-3.0-or-later body + additional terms |

Korean copies sit next to each English file (`*.ko.md`). Do not upload `docs/` research dumps.

## License (read this before you ship a fork)

This project is **AGPL-3.0-or-later together with** additional terms:

- Third parties may **not** use this software commercially without **written permission** from GENOX / Juno Andy Cheong (`support@genox.one`).
- **Illegal use is not licensed** (child-exploitation material, weapons assistance, unauthorized access, scams, malware, sanctions/export violations, and the rest listed in the AUP).
- **Abuse is not licensed** (abliteration for mass harm, scams, malware, or social engineering; dumping unguarded models; stealing someone else's cloud bill).
- AGPL source-sharing does **not** waive those bans. On conflict, the ban on illegal and abusive use always wins.

Weight, dataset, and cloud-console licenses are **separate**. A catalog row is not a redistribution grant.

## Contribute with us

This workbench is **not finished.** Analog web at `:8080` is usable. Native Electron, GPU golden, and in-app Hub live are **OPEN**. We want to improve it **together** — patches, measurements, reviews, and docs in every language on this page.

**Contributions are welcome.** Third-party commercial, illegal, and abusive use is still **not licensed**.

1. Read [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md) and [CONTRIBUTING.en.md](./CONTRIBUTING.en.md).
2. Pick an OPEN row. Send **evidence**, not a flipped markdown cell. analog `npm test` ≠ native close.
3. Fork, patch, open a PR. No CLA — the PR is the grant on AGPL-3.0-or-later **and** the AUP.
4. Never put API keys, `.env` values, or research dumps (`docs/`) in git, issues, or chat.

Help we actually need (per ledger — **never sum**). Close conditions: [USER-GUIDE.en.md](./USER-GUIDE.en.md#still-open-per-ledger-never-sum).

| You can help with | OPEN | Close needs | Not enough |
| --- | --- | --- | --- |
| Packaged Electron E2E | 02, 13, 14, 16, 18, 20 | installer persist / launch / keyboard / CRUD | extraResources analog |
| GPU golden on *your* machine | R-004, R-005 | this-machine Heretic 4B / QLoRA log+VRAM | someone else's rental JSON |
| In-app Hub live | R-009 | overlay that matches the workload cell | parent curl / snapshot |
| Prod / Docker / a11y | W01, W08, W14, W16 | this-source compose + keyboard | hours-old healthy stack |
| SSH / same-workload cost | C-002 … C-007 | live connect, cited $ | list/read analog |
| Docs and i18n | — | leftover Hangul on EN chrome, first-run | analog-GREEN in the guide |

Do not vendor AGPL tools (heretic, OBLITERATUS, abliterix) into `src/`. Pin-call only. Do not `git add -A`. This repository does not pay your cloud bill.

## Connect accounts (your keys)

Paste keys only in **Provider Connections**. The token stays in that screen's memory. It is not written to localStorage, packs, ZIP, or diagnostics. Official docs are linked in-app.

create / stop / delete for RunPod, Lambda, and Vast.ai use **your** key after a budget acknowledgement. This repository does not create GPUs on your behalf. Listing an instance is not a training or abliteration run.

Do not paste keys into GitHub issues. `.env` is gitignored. `.env.example` has no provider secrets.

## Status (not done)

Analog web workbench at Vite `:8080` is usable. **Native / live / GPU golden is not closed.** `analog IMPLEMENTED` ≠ native close. Per-ledger why: [USER-GUIDE.en.md](./USER-GUIDE.en.md). Live dump: `npm run ledger:status`.

| Ledger | Still OPEN |
| --- | --- |
| 01–20 native | 02, 13, 14, 16, 18, 20 |
| R GPU | R-004, R-005 |
| R in-app Hub live | R-009 |
| W table | W01, W02, W06, W07, W08, W09, W11, W12, W14, W16 |
| Ecosystem table | C-002 … C-007 |

A recipe in this README is not a golden GPU run and does not flip those rows.

## Acknowledgments

Thank you to the authors and maintainers of every repository and paper this workbench pin-calls or cites. Their licenses stay theirs. We do **not** vendor AGPL/GPL trees into `src/`. Full tables: [USER-GUIDE.en.md](./USER-GUIDE.en.md#acknowledgments--repositories).

| Author / org | Repository |
| --- | --- |
| p-e-w | [heretic](https://github.com/p-e-w/heretic) |
| elder-plinius | [OBLITERATUS](https://github.com/elder-plinius/OBLITERATUS) |
| andyrdt | [refusal_direction](https://github.com/andyrdt/refusal_direction) |
| FailSpy | [abliterator](https://github.com/FailSpy/abliterator) |
| Goekdeniz-Guelmez | [gabliteration](https://github.com/Goekdeniz-Guelmez/gabliteration) |
| heterodoxin | [apostate](https://github.com/heterodoxin/apostate) |
| wuwangzhang1216 | [abliterix](https://github.com/wuwangzhang1216/abliterix) |
| AIAnytime | [ablate](https://github.com/AIAnytime/ablate) |
| jwest33 | [abliterator](https://github.com/jwest33/abliterator) |
| josepha-mayo | [model-unfetter](https://github.com/josepha-mayo/model-unfetter) |
| nanofatdog | [LLM-abliterate](https://github.com/nanofatdog/LLM-abliterate) |
| AUGMXNT | [deccp](https://github.com/AUGMXNT/deccp) |
| ggml-org | [llama.cpp](https://github.com/ggml-org/llama.cpp) |
| jim-plus | [llm-abliteration](https://github.com/jim-plus/llm-abliteration) |
| NousResearch | [llm-abliteration](https://github.com/NousResearch/llm-abliteration) |
| ant-research | [Awesome-Refusal-Suppression](https://github.com/ant-research/Awesome-Refusal-Suppression) |
| ricyoung | [abliteration-comparison](https://github.com/ricyoung/abliteration-comparison) (citation only) |

Paper authors — Arditi, Obeso, Syed, Paleka, Panickssery, Gurnee, Nanda; Young; Fafuła; Gülmez; and everyone listed in the user-guide paper table — thank you. Academic jailbreak papers are linked for **defense and understanding**, not as attack runbooks.

## Live dependency pins

Mirrored in `src/lib/runners.ts` and enforced by `pack.assert.test.ts` (stale SHA fails the build).

| Repo | Pin |
| --- | --- |
| p-e-w/heretic | `3521f86` |
| elder-plinius/OBLITERATUS | `205d28a1` |
| wuwangzhang1216/abliterix | `5d58cea9` |
| ggml-org/llama.cpp | `5cdd3d1` |
| AIAnytime/ablate | `6b89bea` |
| heterodoxin/apostate | `be36269d` |
| Goekdeniz-Guelmez/gabliteration | `1498fc7` |
| jwest33/abliterator | `6ca3356` |
| josepha-mayo/model-unfetter | `4c9548c` |
| AUGMXNT/deccp | `1a6d557` |
| andyrdt/refusal_direction | `9d852fa` |
| jim-plus/llm-abliteration | `ca6e223` |
| nanofatdog/LLM-abliterate | `f01cec9` |

## License matrix (upstream tools)

| License | Repos | How this repo uses them |
| --- | --- | --- |
| AGPL | heretic, OBLITERATUS, abliterix | pin-call only, no vendor |
| MIT | FailSpy, gabliteration, apostate, ablate, jwest, AUGMXNT, llama.cpp | pin-call / analog |
| Apache-2.0 | refusal_direction, nanofatdog, model-unfetter, kimi-k3 | pin-call |
| NONE | ricyoung | citation only |

## Sponsor or invest

Two doors, neither required to use the software. Full text: [SUPPORT.en.md](./SUPPORT.en.md).

**Sponsor (donation)** — a gift, not equity.

| Channel | Value |
| --- | --- |
| Binance ID | `110474712` |
| BSC (BEP-20) | `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` |

BSC only. Wrong chain cannot be recovered.

**Invest (inquiry)** — to discuss investing in GENOX, email `support@genox.one`. That is not a public offering of securities. Money sent to the sponsorship address does not become shares.

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
