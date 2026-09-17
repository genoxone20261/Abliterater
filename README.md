# Abliterater

**Educational workbench** for studying refusal-suppression (*abliteration*) so researchers and defenders can **counter illegal misuse**. That purpose needs **worldwide attention**. This is not an attack runbook.

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**Completeness is not high yet.** The analog web workbench is usable; packaged Electron, GPU golden, and in-app Hub live are still OPEN. **Contributions are welcome** — please join us if you have time. Third-party **commercial use, illegal use, and abuse are not licensed** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md). A pull request is a grant on AGPL-3.0-or-later **and** those additional terms.

![Abliterater workbench](./workbench.png)

## Languages

This file is **English only**. Other landings:

| Language | File |
| --- | --- |
| English | [README.md](./README.md) (this file — longest landing) |
| Korean | [README.ko.md](./README.ko.md) (longest Korean landing) |
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

The in-app UI is Korean / English via a locale toggle. Extra README files are landings, not extra UI locales. Step-by-step install, chrome, methods, and remaining OPEN: [USER-GUIDE.en.md](./USER-GUIDE.en.md).

## Why this exists

Open-weight chat models are often **safety-aligned**: they refuse some requests. *Abliteration* (and related methods) studies how that refusal is represented and how it can be reduced or restored. Criminals already misuse those methods. This workbench exists so **researchers, defenders, and educators** can see the same pipeline, measure it, and **counter illegal misuse**. Worldwide attention is part of that defense. It is **not** a cookbook for harm, scams, malware, unauthorized access, weapons, or child-exploitation material. Those uses are **not licensed** and remain crimes. See [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md).

The core paper this catalog starts from is Arditi et al., *Refusal in Language Models Is Mediated by a Single Direction* ([arXiv:2406.11717](https://arxiv.org/abs/2406.11717)). Later comparison, geometry, and defense papers are linked in the Research tab and in [USER-GUIDE.en.md](./USER-GUIDE.en.md#acknowledgments--papers). Academic jailbreak papers (PAIR, TAP, Crescendo, and similar) are linked for **defense and understanding**, not as attack runbooks.

## What abliteration means here

In this product, “do work” means:

1. Start from an **unabliterated official Instruct** checkpoint (default `Qwen/Qwen3-4B-Instruct-2507`).
2. Choose methods (default **Heretic**: TPE-optimized orthogonalization against a refusal direction).
3. Download a **pack ZIP** — shell/PowerShell recipes that **pin-call** upstream CLIs at pinned git SHAs.
4. Run those scripts on **your** machine or **your** GPU cloud. This app does not train for you in the browser.

Already-processed heretic/GGUF cards are a **reuse lane**. They are not the default. Clicking a done card must not keep “abliterate again + merged BF16” as if the work were still ahead.

Turning a method chip on does **not** start a GPU. `npm test` passing does **not** mean a model was trained. A healthy Docker container does **not** close the W14 ledger cell.

## Who this is for

- Educators and students tracing refusal directions and comparing methods.
- Defenders measuring how open-weight safety fails and how to restore it.
- Contributors who accept the AUP and will send **evidence**, not flipped markdown cells.

## Who this is not for

- Anyone seeking a jailbreak-as-a-service or an uncensored model storefront.
- Third-party commercial redistribution or SaaS wrapping without **written permission** from GENOX / Juno Andy Cheong (`support@genox.one`).
- Illegal or abusive use as listed in the AUP. AGPL source-sharing does not waive that.

## What the product is

Two tabs only. No document library. No author-book catalog.

| Surface | Role |
| --- | --- |
| Workbench (tab `1`) | Build · Explore · Connect |
| Research (tab `2`) | arXiv abs/PDF and GitHub repo links (`target=_blank`) |

Footer: **GENOX** · **Juno Andy Cheong** · https://github.com/genoxone20261 · [support@genox.one](mailto:support@genox.one).

Default catalog base is `Qwen/Qwen3-4B-Instruct-2507` (work original), method Heretic, output merged BF16. `PRESETS[0]` is `method-compare` (Instruct work), then `domain-lora`, then `local-gguf` last. Preset 1 must not undo Instruct by loading a heretic GGUF.

### Build

Default workspace. Catalog chips: `work` = official Instruct, `reuse` = already abliterated/GGUF. Hugging Face repo, local path, or API base URL. Empty HF repo **blocks** the workflow. Purpose/domain (general, engineering, math — math does not treat ablation as a skill). Method chips (Heretic, Gabliteration, FailSpy analog, LoRA/QLoRA/DPO, quant, and related). Compute chips (`local-cuda` / `rocm` / `metal` / `cpu`, or a catalog cloud). Three storage columns: **BASE WEIGHTS**, **DATASET**, **ARTIFACTS** (local / s3 / gcs / azure / hf / minio / nfs). The UI records the choice into the ZIP; it does not upload bytes. Desktop-only data-root picker.

### Explore

Recommendations estimate fit against observed VRAM. Unknown VRAM is **one** banner, not a stamp on every card. Literature GiB is **estimated**, not a GPU run. SourceHub searches models/datasets (allowlisted endpoints, workbench User-Agent). A pick writes `hfRepo` or `storeDataUri`. Ecosystem rows under SourceHub are **links only**. Kaggle is a compute chip, not a SourceHub kind. In-app Hub live overlay (`Hub live`) shows `lastModified` / `gated` on catalog cards and **does not rewrite** `studio.ts` BASES. That overlay does **not** close R-009.

### Connect

Paste keys only in **Provider Connections**. One visible password (`#prov-api-key`). The token stays in **that screen’s memory**. It is not written to localStorage, packs, ZIP, or diagnostics. RunPod / Lambda / Vast.ai create/stop/delete use **your** key after a budget acknowledgement Dialog (not `window.confirm`). Default is dry-run. Extra JSON keys fail closed. This repository does not create GPUs on your behalf and does not pay your bill. Listing an instance is not a training run and does not close R-004.

### Research

Search and type filter. Papers open arXiv in a new tab. Repos open GitHub in a new tab. The in-app PDF viewer is not remounted here.

## What it does not do

- Host or redistribute model weights. A catalog row is not a redistribution grant. Weight, dataset, and cloud-console licenses are **separate**.
- Rent GPUs for you.
- Vendor AGPL trees (heretic, OBLITERATUS, abliterix) into `src/`. Pin-call only.
- Ship author KDP PDFs. `public/reports/` stays on the author’s disk. Public git, Docker, and installers must not contain `reports`.
- Close native / GPU / Electron ledgers because `npm test` passed. Analog web at `:8080` is not a native close.
- Store API keys in git, ZIP, or localStorage.

## What you should do

Three jobs. Do not mix them. analog `:8080` is usable. Native Electron, GPU golden, and in-app Hub live are **not closed**.

### 1. Use the workbench (no GPU required)

This is the default path.

1. Clone, `npm ci`, `npm run dev`, open `http://127.0.0.1:8080/` (commands below).
2. Stay on **Workbench → Build**. Confirm the default chip is official Instruct (`Qwen/Qwen3-4B-Instruct-2507`), **not** a heretic GGUF.
3. Leave method **Heretic** unless you mean to compare (preset 1) or reuse GGUF (preset 3, last).
4. Fill Hugging Face `owner/name` if you leave the catalog. Empty HF **blocks** the pack.
5. Optionally open **Explore**. VRAM numbers are **estimated**. Unknown hardware must not pretend support. A Hub pick writes `hfRepo` or `storeDataUri` — it does **not** download weights.
6. Download the pack ZIP (**Ctrl+D**). Read `run.sh` / `run.ps1` / `job.json` **before** you execute anything.
7. Research tab: papers and repos open in a new browser tab. That is reading, not a GPU run.

You have not trained a model. You have a **recipe ZIP**.

### 2. Run that recipe on your machine or your cloud

The browser does not train. You run the scripts.

1. Inspect the ZIP. AGPL tools are **pin-called** at pinned SHAs, not vendored into `src/`.
2. Local: pick `local-cuda` / `rocm` / `metal` / `cpu` to match **your** GPU/CPU, then run `run.sh` or `run.ps1` on **your** disk.
3. Cloud: **Connect** only. One password field (`#prov-api-key`). Token stays in that screen’s memory. Set max USD / minutes. Acknowledge the Dialog. Stay **dry-run** until you intend to spend **your** money. This repo does not pay.
4. Listing an instance is not a Heretic/QLoRA golden and does **not** close R-004 / R-005.
5. After a real run, keep the log + VRAM. That is the only evidence those GPU rows accept.

Weight, dataset, and cloud-console licenses are **separate**. A catalog row is not a redistribution grant.

### 3. Contribute (close an OPEN row)

Read [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md) first. Third-party commercial, illegal, and abusive use is **not licensed**.

1. Run `npm run ledger:status`. Remaining OPEN is **per ledger**. Never one percent.
2. Pick **one** OPEN row in [USER-GUIDE.en.md](./USER-GUIDE.en.md#still-open-per-ledger-never-sum).
3. Send **evidence** that matches the close column. analog `npm test` ≠ native close. Do not flip a markdown cell.
4. Fork, patch, open a PR. No CLA — the PR is the grant on AGPL-3.0-or-later **and** the AUP.
5. Never put API keys, `.env` values, or `docs/` dumps in git, issues, or chat.

| If you have | Do this | Do not |
| --- | --- | --- |
| A packaged Windows/Linux/macOS install | Persist-reject, source-free launch, keyboard, CRUD (02, 13, 14, 16, 18, 20) | Cite extraResources analog |
| A GPU and **your** bill | This-machine Heretic 4B / QLoRA log+VRAM (R-004, R-005) | Attach someone else’s rental JSON |
| Time for UI | In-app Hub overlay that matches the workload cell (R-009); keyboard E2E (W08) | Parent curl / snapshot |
| Docker | `docker compose up -d --build` from **this** source + product-flow (W14) | Hours-old healthy stack |
| An SSH box | Live connect, upload, run, retrieve (C-002) | list/read analog |

Full patch rules: [CONTRIBUTING.en.md](./CONTRIBUTING.en.md).

## First session

Need Node 24.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

Open `http://127.0.0.1:8080/`.

1. Confirm the default chip is official Instruct (`Qwen/Qwen3-4B-Instruct-2507`), not a heretic GGUF.
2. Leave method Heretic unless you mean to compare (preset 1) or reuse GGUF (preset 3, last).
3. Optionally open Explore and read VRAM estimates. Unknown hardware must not pretend support.
4. Download the pack ZIP (Ctrl+D on Workbench). Inspect `run.sh` / `run.ps1` / `job.json` before you run anything.
5. If you connect a cloud, paste the key only in Connect, set max USD / minutes, acknowledge the Dialog. Stay on dry-run until you intend to spend **your** money.

```bash
npm run typecheck
npm run lint
npm test
npm run ledger:status
```

`ledger:status` prints remaining OPEN **per ledger**. Never sum those lists into one “percent done.”

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

A container that has been healthy for hours is not proof of **this** source. After you change `src/`, rebuild with `--build`. Product-flow scripts take the URL as **argv** (`node scripts/product-flow.mjs http://127.0.0.1:8080`), not `BASE_URL`.

### Desktop

```bash
npm run electron:dev
# after npm run build:
npm run electron:build:win    # NSIS + portable (Windows host)
npm run electron:build:linux  # AppImage (Linux host or CI)
npm run electron:build:mac    # DMG (macOS host or CI)
```

Windows NSIS is unsigned by default (`CSC_IDENTITY_AUTO_DISCOVERY=false` unless `CSC_LINK` / `WIN_CSC_LINK` is set). SmartScreen **Unknown publisher** is expected. macOS DMG is not produced on Windows. Unsigned analog ≠ Authenticode (E03). extraResources analog (web files inside the pack) ≠ packaged Electron persist/keyboard/CRUD E2E (native 02, 13, 14, 16, 18, 20).

## Pack ZIP (recipe, not a trained model)

Allowlist only. Do not grow it in a PR without a product decision.

| File | Role |
| --- | --- |
| `run.sh` | POSIX runner |
| `run.ps1` | Windows runner (always emitted with `run.sh`) |
| `az-startup.sh` / `.ps1`, `azure-job.yml` | Empty unless compute is Azure |
| `docker-compose.yml` | Serve/run recipe |
| `train_lora.py` | LoRA/QLoRA script (pin-call bitsandbytes and similar; not a golden 7B run by itself) |
| `eval.sh` | Eval hook |
| `Modelfile` | Ollama/quant |
| `heretic.args.txt` | Heretic CLI args at the pinned SHA |
| `SYSTEM.txt` / `POWER.txt` / `POWER.en.txt` / `SFT.txt` / `eval.txt` | Prompts; EN UI must not bake Korean POWER into English SYSTEM |
| `job.json` | Selected sources without claiming verified provenance |
| `README.txt` | Pack-local notes |

Compute chips: `local-cuda`, `local-rocm`, `local-metal`, `local-cpu`. AGPL CLIs are invoked at pinned SHAs from these scripts, not copied into `src/`.

## Honesty

`analog IMPLEMENTED` ≠ native close. Never sum ledgers. Live dump: `npm run ledger:status`. Why each OPEN row: [USER-GUIDE.en.md](./USER-GUIDE.en.md#still-open-per-ledger-never-sum).

| Claim | Not enough | Close needs |
| --- | --- | --- |
| Web workbench works | Vite `:8080`, `npm test` | still analog |
| Keys never persist | unit tests | packaged Electron persist-reject E2E (02) |
| extraResources pin | electron-builder config | source-free install launch (13) |
| URL policy | unit tests | packaged navigation (14) |
| Keyboard / CRUD | Field/Dialog analog | packaged E2E (16, 20) |
| Heretic/QLoRA golden | rental JSON from another machine | this-machine log+VRAM (R-004, R-005) |
| Hub live | parent curl / snapshot | in-app overlay matching the workload cell (R-009) |
| Docker accepted | hours-old healthy stack | this-source compose + product acceptance (W14) |

## Documentation

| File | Contents |
| --- | --- |
| [USER-GUIDE.en.md](./USER-GUIDE.en.md) | Install, chrome, workbench, pack ZIP, remaining OPEN **per ledger** (Korean: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md)) |
| [CONTRIBUTING.en.md](./CONTRIBUTING.en.md) | How to patch. Contribute with us if you accept the AUP |
| [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md) | No third-party commercial / illegal / abusive use |
| [SUPPORT.en.md](./SUPPORT.en.md) | Optional gift vs collaboration inquiry |
| [SECURITY.md](./SECURITY.md) | How to report a vulnerability |
| [LICENSE.md](./LICENSE.md) | AGPL-3.0-or-later body + additional terms |

Korean copies sit next to each English file (`*.ko.md`). Do not upload `docs/` research dumps. Runtime ledgers the code parses live under `src/data/`.

## License (read this before you ship a fork)

This project is **AGPL-3.0-or-later together with** additional terms:

- Third parties may **not** use this software commercially without **written permission** from GENOX / Juno Andy Cheong (`support@genox.one`).
- Use **outside that grant** (this AUP and any written permission) is **unauthorized**. AGPL source-sharing does not license it.
- **Illegal use is not licensed** (child-exploitation material, weapons assistance, unauthorized access, scams, malware, sanctions/export violations, and the rest listed in the AUP).
- **Abuse is not licensed** (abliteration for mass harm, scams, malware, or social engineering; dumping unguarded models; stealing someone else's cloud bill).
- **You are responsible** for illegal acts you commit with this software or with models, weights, LoRA/GGUF, or other outputs you produce with it. The copyright holder does not authorize those acts and is not liable for them.
- AGPL source-sharing does **not** waive those bans. On conflict, the ban on illegal and abusive use always wins.

Weight, dataset, and cloud-console licenses are **separate**. A catalog row is not a redistribution grant.

## Contribute with us

This workbench is **not finished**, and **completeness is not high yet**. Analog web at `:8080` is usable. Native Electron, GPU golden, and in-app Hub live are **OPEN**. We would be grateful if you helped us improve it — patches, measurements, reviews, and docs are all welcome.

**Please contribute with us** if you can. Third-party commercial, illegal, and abusive use is still **not licensed**.

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

**Completeness is not high yet.** Analog web at Vite `:8080` is usable. **Native / live / GPU golden is not closed.** `analog IMPLEMENTED` ≠ native close. That is why we ask for contributions rather than calling this a ship. Per-ledger why: [USER-GUIDE.en.md](./USER-GUIDE.en.md). Live dump: `npm run ledger:status`.

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

## Sponsor · collaboration

Please use the software freely. A gift or a note is **never required**. Full text: [SUPPORT.en.md](./SUPPORT.en.md).

**A small gift (optional)** — if this work helped you and you would like to send a little compute time, we would be grateful. It is not equity. Please do not feel obliged.

| Channel | Value |
| --- | --- |
| Binance ID | `110474712` |
| BSC (BEP-20) | `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` |

BSC only, if you send anything. Wrong chain cannot be recovered.

**Collaboration inquiry** — if you would like to work together, please write to `support@genox.one` at your convenience. That is not a public offering of securities. Money sent to the gift address does not become shares.

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
