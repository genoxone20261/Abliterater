# Abliterater

**Educational workbench** for refusal-suppression research (*abliteration*) — so researchers and defenders can measure the pipeline and **counter illegal misuse**. That purpose needs **worldwide attention**. This is not an attack runbook and not an uncensored-model storefront.

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**Completeness is not high yet.** Analog web is usable; packaged Electron, GPU golden, and in-app Hub live are OPEN. **Contributions are welcome.** A contribution is **not** a commercial license. Third-party commercial, illegal, and abusive use is **not licensed** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md).

![Abliterater workbench](./workbench.png)

| You get | You do not get |
| --- | --- |
| Official Instruct catalog → method chips → pack ZIP | Weights hosted in this repo |
| HF search + estimated VRAM | A jailbreak SaaS |
| Connect with *your* cloud key (dry-run default) | This repo paying the GPU bill |
| Research tab: papers / repos | An attack cookbook |

Default base: `Qwen/Qwen3-4B-Instruct-2507`. Default method: Heretic. Already-processed heretic/GGUF cards are a **reuse lane**, not the default. The browser does not train; you run the ZIP on your machine or your cloud.

## Quick start

Node 24.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci && npm run dev
```

Open `http://127.0.0.1:8080/`.

```bash
npm run typecheck && npm run lint && npm test && npm run ledger:status
```

Production web: `npm run build` then `HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs`.  
Docker: `docker compose up -d --build`.  
Desktop: `npm run electron:dev` (packaged Electron E2E is still OPEN).

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

Clone, `npm ci`, `npm run dev`, open `http://127.0.0.1:8080/`. Confirm the default chip is official Instruct, not a heretic GGUF. Download the pack ZIP (Ctrl+D) and read `run.sh` / `run.ps1` / `job.json` before you execute anything.

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

Optional gift, not equity. Binance `110474712` / BSC `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` (**BSC only**). Collaboration: `support@genox.one`. Not a securities offering. Full text: [SUPPORT.en.md](./SUPPORT.en.md).

## Acknowledgments

Thank you to every author and maintainer of the pin-called tools and cited papers. We do not vendor AGPL/GPL trees into `src/`.

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
