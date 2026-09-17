# Abliterater

**Educational workbench** for refusal-suppression research (*abliteration*). Researchers and defenders can measure the same pipeline and **counter illegal misuse**. That purpose needs **worldwide attention**.

This is not an attack runbook and not an uncensored-model storefront.

[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**Completeness is not high yet.** The analog web workbench is usable. Packaged Electron, GPU golden, and in-app Hub live are still OPEN. **Contributions are welcome.** A contribution is **not** a commercial license. Third-party commercial, illegal, and abusive use is **not licensed** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md).

<p align="center">
  <img src="./workbench.png" alt="Abliterater workbench" width="900" />
</p>

| You get | You do not get |
| --- | --- |
| Official Instruct catalog → method chips → pack ZIP | Weights hosted in this repo |
| Hugging Face search + estimated VRAM | A jailbreak SaaS |
| Connect with *your* cloud key (dry-run default) | This repo paying the GPU bill |
| Research tab: papers and repositories | An attack cookbook |

Default base: `Qwen/Qwen3-4B-Instruct-2507`. Default method: Heretic. Already-processed heretic/GGUF cards are a **reuse lane**, not the default. The browser does not train. You run the ZIP on your machine or your cloud.

## Quick start

Need **Node 24** and npm. Then open `http://127.0.0.1:8080/`.

### Windows (PowerShell)

```powershell
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

Pack scripts in the ZIP: `run.ps1`. Desktop preview: `npm run electron:dev`. Windows installer (unsigned NSIS + portable):

```powershell
npm run build
npm run electron:build:win
```

SmartScreen may say **Unknown publisher**. That is expected for an unsigned build.

### macOS (Terminal)

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

Local Apple GPU: pick the `local-metal` compute chip, then run `run.sh` from the ZIP. Desktop preview: `npm run electron:dev`. DMG (must be built on macOS or CI):

```bash
npm run build
npm run electron:build:mac
```

### Linux (bash)

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

Pack scripts in the ZIP: `run.sh`. CUDA / ROCm / CPU chips: `local-cuda`, `local-rocm`, `local-cpu`. Desktop preview: `npm run electron:dev`. AppImage (Linux host or CI):

```bash
npm run build
npm run electron:build:linux
```

Docker (any OS with Docker Engine):

```bash
docker compose up -d --build
# http://127.0.0.1:8080/
```

Checks on every OS:

```bash
npm run typecheck && npm run lint && npm test && npm run ledger:status
```

Production web (no Vite): `npm run build` then `HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs`.

Install, chrome, methods, remaining OPEN: [USER-GUIDE.en.md](./USER-GUIDE.en.md) · [USER-GUIDE.ko.md](./USER-GUIDE.ko.md).

## Languages

In-app UI is Korean / English. Extra README files are landings, not extra UI locales.

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

## Why this exists

Open-weight chat models often refuse some requests. Abliteration studies how that refusal is represented and how it can be reduced or restored. Criminals already misuse those methods. This workbench exists so **researchers, defenders, and educators** can see the same pipeline and counter illegal misuse.

Starting paper: Arditi et al., *Refusal in Language Models Is Mediated by a Single Direction* ([arXiv:2406.11717](https://arxiv.org/abs/2406.11717)). Academic jailbreak papers linked in the Research tab are for **defense and understanding**, not attack runbooks.

## What abliteration means here

1. Start from an official unabliterated Instruct checkpoint (default `Qwen/Qwen3-4B-Instruct-2507`).
2. Choose a method (default Heretic).
3. Download a pack ZIP of pin-called scripts.
4. Run those scripts on **your** machine or **your** GPU cloud. The browser does not train.

## What you should do

Three jobs. Do not mix them.

1. Use the analog workbench at `:8080` (no GPU required).
2. Run the ZIP on your machine or your cloud.
3. Contribute: send **evidence** for one OPEN ledger row. analog `npm test` ≠ native close.

## First session

Clone, `npm ci`, `npm run dev`, open `http://127.0.0.1:8080/`.

Confirm the default chip is official Instruct, not a heretic GGUF. Download the pack ZIP and read `run.sh` / `run.ps1` / `job.json` before you execute anything.

## License

**AGPL-3.0-or-later + additional terms** in [LICENSE.md](./LICENSE.md) and [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md).

- No third-party commercial use without written permission from GENOX / Juno Andy Cheong (`support@genox.one`).
- Illegal and abusive use is **not licensed**. AGPL source-sharing does not waive that.
- A PR is a grant into *this* project. It does **not** create a third-party commercial license.
- **You are responsible** for illegal acts you commit with this software or with models or outputs you produce using it.

Weight, dataset, and cloud-console licenses are separate.

## Contribute with us

**Contribute with us** if you accept the AUP. Completeness is not high yet. Send **evidence**, not a flipped markdown cell.

[CONTRIBUTING.en.md](./CONTRIBUTING.en.md) · [USER-GUIDE.en.md](./USER-GUIDE.en.md#still-open-per-ledger-never-sum)

Do not put API keys, `.env`, or `docs/` research dumps in git.

## Sponsor · collaboration

Please use the workbench without paying. If it still helped you and you would like to send a small gift for compute time, we would be grateful. A gift is optional. It does not buy equity, a product, or a vote. Please do not feel obliged.

| Channel | Value |
| --- | --- |
| Binance ID | `110474712` |
| BNB Smart Chain (BEP-20) | `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` |

If you send anything, please use **BEP-20 on BSC only**. Funds on another chain cannot be recovered. Thank you if you send something. Thank you just as much if you do not.

To work together — research, compute, documentation — write to `support@genox.one` when it is convenient. This is not a securities offering. Full text: [SUPPORT.en.md](./SUPPORT.en.md).

## Acknowledgments

Thank you to every author and maintainer of the pin-called tools and cited papers. We do not vendor AGPL/GPL trees into `src/`.

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
