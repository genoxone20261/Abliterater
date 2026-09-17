# Abliterater user guide

One line: pick an **unabliterated Instruct** base, assemble a Heretic / LoRA / quant **pack ZIP**, and connect **your** GPU-cloud keys.

**Educational.** This project exists to study refusal-suppression and to **counter illegal misuse**. That purpose needs **worldwide attention**. It is not a runbook for harm.

This app does not host weights. It does not rent GPUs for you. A passing `npm test` is not a training run. Analog web green is not a native Electron/GPU close.

Language toggle is KO/EN in the header. Korean: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md).

## What abliteration means here

Open-weight chat models often **refuse** some requests after safety alignment. Abliteration (Heretic and related methods) studies that refusal as a direction in residual stream space and how it can be reduced or restored. This workbench is for **research, defense, and education** so illegal misuse can be **countered**. It is not a jailbreak-as-a-service.

“Do work” here means: start from an **unabliterated official Instruct** base (default `Qwen/Qwen3-4B-Instruct-2507`), choose methods (default Heretic), download a **pack ZIP** of pin-call scripts, and run those scripts on **your** machine or **your** GPU cloud. The browser does not train. Turning a chip on does not start a GPU. `npm test` is not a training run. analog `:8080` ≠ native Electron / GPU golden close.

Already-processed heretic/GGUF cards are a **reuse lane**, not the default. Academic jailbreak papers in the Research tab are for **defense and understanding**.

## First session

1. `npm ci && npm run dev` → `http://127.0.0.1:8080/`.
2. Confirm the default chip is official Instruct, not a heretic GGUF. `PRESETS[0]` is method-compare on Instruct.
3. Optionally open Explore. Unknown VRAM is one banner. Do not treat estimates as a GPU run.
4. Download the pack (Ctrl+D on Workbench). Read `run.sh` / `run.ps1` / `job.json` before executing.
5. Keys, if any, go only in Connect screen memory after a budget Dialog. Dry-run until you intend to spend **your** money.
6. `npm run ledger:status` — remaining OPEN **per ledger**, never one percent.

Longer landing: [README.md](./README.md). **What you should do** (workbench / run pack / contribute) is in that README.

## How to work

Do not mix “I opened the web UI” with “I trained a model” with “I closed a ledger cell.”

### A. Assemble a pack (Workbench)

1. Tab **1** (Workbench), workspace **Build**.
2. §1 catalog: official Instruct (`work` lane). Reuse GGUF is the other lane — not the default.
3. Methods: Heretic unless you chose another chip. Purpose/domain: math does **not** treat ablation as a skill.
4. Compute chip matches **your** runner (`local-cuda` / `rocm` / `metal` / `cpu` or a catalog cloud).
5. Storage: three columns (base weights / dataset / artifacts). The UI writes the choice into the ZIP; it does not upload bytes.
6. Ctrl+D → inspect `run.sh` / `run.ps1` / `job.json`.

Empty HF `owner/name` **blocks** the workflow. Connect keys are **not** required for this step.

### B. Run the pack (your machine or your key)

1. Execute `run.sh` or `run.ps1` on **your** disk, or Connect → budget Dialog → dry-run first.
2. Keep log + VRAM if you claim a GPU golden (R-004 / R-005).
3. Listing cloud instances is not that golden.

### C. Close an OPEN row (contributors)

`npm run ledger:status`. Pick one row in [Still open](#still-open-per-ledger-never-sum). Evidence only. analog `npm test` ≠ close. [CONTRIBUTING.en.md](./CONTRIBUTING.en.md).

Acceptable use (no third-party commercial / illegal / abusive use): [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md). Contributing: [CONTRIBUTING.en.md](./CONTRIBUTING.en.md). Gift or collaboration: [SUPPORT.en.md](./SUPPORT.en.md). Security reports: [SECURITY.md](./SECURITY.md).

---

## Author PDFs stay on disk

Author book PDFs live on disk at `public/reports/`. They are not listed in the product tabs and not packed into the workbench ZIP. **They are not deleted.**

What went wrong:

1. The Vite/Nitro production build copies all of `public/` into `.vercel/output/static/`.
2. Electron `extraResources` copies that whole `.vercel/output` into the installer.
3. So the **first Windows exe** built on the host after `npm run build` contained KDP PDFs (~185MB).
4. The Docker image was already clean: `.dockerignore` excludes `public/reports`.

Fix: `scripts/omit-kdp-from-output.mjs` removes `static/reports` after build, and Electron `extraResources.filter` drops `reports` again. The rebuilt exe is ~88MB with zero unpacked `reports`. `public/reports` stays on the local disk.

Vite dev may still serve `/reports/….pdf` if someone knows the URL. That local exception is accepted. Public git, Docker, and installers must not ship those files.

## Why TODOs are in the product

Session scratch (`docs/research-*`, child memos, Vast JSON) was **not** published.

What shipped is the **live ledger the code parses**:

| File | Why |
| --- | --- |
| `src/data/TODO-ROADMAP.md` | `npm run ledger:status` and tests read native 01–20 OPEN |
| `TODO-WORKLOAD-SPEC-20260912.md` | R GPU / in-app live ledger |
| `WORKFLOW.md` | W table |
| `ECOSYSTEM-MASTER-TODO.md` | ecosystem table |
| `compute-sources.json` `dataset-sources.json` `method-sources.json` | imported by `src/lib/ecosystem.ts` |
| `HUB-SNAPSHOT-20260912.json` | hub snapshot tests |

They are not scratch TODOs dressed as docs. Without them CI typecheck fails. This guide does not close OPEN cells.

---

## Install

Need Node 24 and npm. Desktop packs need Electron 35. The server image needs Docker Engine.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

Open `http://127.0.0.1:8080/`.

Tests: `npm run typecheck` · `npm run lint` · `npm test`.

Production web (no Vite):

```bash
npm run build
HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs
```

Docker:

```bash
docker compose up -d --build
# http://127.0.0.1:8080/
```

Desktop (run `npm run build` first):

```bash
npm run electron:dev
npm run electron:build:win     # NSIS + portable on Windows, unsigned by default
npm run electron:build:linux   # AppImage on Linux or CI
npm run electron:build:mac     # DMG on macOS or CI
```

This Windows host cannot produce AppImage or DMG. The GitHub Release Linux zip is an unpacked x64 tree. SmartScreen “Unknown publisher” is expected for unsigned OSS.

Do not commit keys. Paste them only in the Connect screen memory. `.env.example` is comments only.

---

## Chrome

Two tabs only. No document library / KDP tab.

| Key | Tab | What it is |
| --- | --- | --- |
| `1` | Workbench | Build · Explore · Connect |
| `2` | Research | arXiv paper links, GitHub repo links |

Footer: GENOX · Juno Andy Cheong · https://github.com/genoxone20261 · support@genox.one

### Shortcuts

| Keys | Action |
| --- | --- |
| Ctrl+S | Save current job |
| Ctrl+D | Download pack |
| Ctrl+/ or ? | Shortcut help |
| 1 / 2 | Tabs |
| Esc | Close dialog |

---

## Workbench — Build

Default workspace is **Build**. Default base is `Qwen/Qwen3-4B-Instruct-2507` (unabliterated Instruct). Method Heretic, output merged BF16. Already-processed heretic/GGUF cards are a **reuse lane**, not the default.

1. **Purpose / domain** — abliterated, domain, pipeline, and similar. Domains include general, engineering, math. Math does not treat ablation as skill.
2. **Model source (§1)** — catalog chips `work` = official Instruct, `reuse` = already abliterated/GGUF. Hugging Face repo, local path, API base URL. An empty HF repo blocks the workflow.
3. **Methods** — Heretic (trials / max weight / direction index), Gabliteration, FailSpy analog, LoRA/QLoRA/DPO, quant, RAG-first, and related chips. Turning a chip on does not start a GPU. The **pack scripts pin-call** those tools. AGPL tools are not vendored into `src/`.
4. **Presets (§4)** — (1) Abliteration method comparison on Instruct, (2) domain LoRA, (3) local GGUF reuse. Preset 1 must not swap Instruct for a heretic GGUF.
5. **Compute** — local-cuda / rocm / metal / cpu, or a catalog cloud. Create runs only after **your** key and a budget ack. This repository does not pay.
6. **Three storage columns** — BASE WEIGHTS, DATASET, ARTIFACTS. Each may be local / s3 / gcs / azure / hf / minio / nfs. The UI records the choice into the ZIP; it does not upload bytes. Picking a data root is desktop-only.
7. **Outputs** — merged-bf16, GGUF Q4/Q5/Q8, LoRA adapter, Ollama, Docker. Packs always emit both `run.sh` and `run.ps1`.
8. **Pack download** — ZIP with run.sh/ps1, empty Azure stubs, docker-compose.yml, train_lora.py, eval.sh, Modelfile, heretic.args.txt, SYSTEM/POWER/SFT/eval text, job.json, README.txt. No `public/reports`.

### Explore

- **Recommendations** — estimates against observed VRAM. Unknown VRAM is one banner, not a line per card. Literature GiB is estimated, not a GPU run. A finished heretic card is not re-ablated.
- **SourceHub** — model/dataset search. A pick writes `hfRepo` or `storeDataUri`. Ecosystem rows are **links only**. Kaggle is a compute chip, not a SourceHub kind.

### Connect

**Provider Connections**. One password field `#prov-api-key`. The wizard hides its own key input. The token stays in screen memory. It is not written to localStorage, packs, or diagnostics.

| Adapter | Live behavior |
| --- | --- |
| RunPod, Lambda, Vast.ai | Desktop IPC list/read; create/stop with your key after budget ack |
| Shadeform | `X-API-KEY`, instance info |
| Massed Compute, Prime Intellect, DeepInfra GPU, DigitalOcean, Together clusters | list/read. DO lists every Droplet |
| Thunder Compute | list only |
| Ollama / LM Studio | loopback `:11434` / `:1234` |
| Hugging Face search | public Hub; the app does not store `HF_TOKEN` |
| Modal, Azure ML, SSH, Jarvislabs, TensorDock, others | catalog/plan, not a live login |

A successful list does not close Heretic GPU golden (R-004).

---

## Research tab

Search and type filter. Papers open arXiv abs/PDF in a new tab. Repos open GitHub in a new tab. The in-app PDF viewer is not remounted. The tables below are the full in-app lists.

---

## Acknowledgments — papers

The authors below shaped method choice, warnings, and comparison axes. We do not vendor their papers into `src/`. Links are arXiv abs. Thank you.

| arXiv | Title | Authors | Venue | Priority |
| --- | --- | --- | --- | --- |
| [2406.11717](https://arxiv.org/abs/2406.11717) | Refusal in Language Models Is Mediated by a Single Direction | Arditi, Obeso, Syed, Paleka, Panickssery, Gurnee, Nanda | NeurIPS 2024 | required |
| [2512.13655](https://arxiv.org/abs/2512.13655) | Comparative Analysis of LLM Abliteration Methods | Young | 2026-01 v2 | required |
| [2607.17427](https://arxiv.org/abs/2607.17427) | Abliteration Is Not a Scalpel | Fafuła | 2026-07 | required |
| [2512.18901](https://arxiv.org/abs/2512.18901) | Gabliteration: Adaptive Multi-Directional Neural Weight Modification | Gülmez | 2025-12 / v3 2026-01 | recommended |
| [2607.02714](https://arxiv.org/abs/2607.02714) | Not All Refusals Are Equal: How Safety Alignment Fails Cybersecurity at Scale | Hadetskyi et al. | 2026-07 | relevant |
| [2602.02132](https://arxiv.org/abs/2602.02132) | There Is More to Refusal in LLMs than a Single Direction | Joad, Hawasly, Boughorbel, Durrani, Sencar | 2026-02 | recommended |
| [2505.19056](https://arxiv.org/abs/2505.19056) | An Embarrassingly Simple Defense Against LLM Abliteration Attacks | Abu Shairah, Hammoud, Ghanem, Turkiyyah | 2025-05 | defense |
| [2608.18093](https://arxiv.org/abs/2608.18093) | Abliteration Mitigation via Refusal Aliases | Truong | 2026-08 | defense |
| [2606.05396](https://arxiv.org/abs/2606.05396) | Willing but Unable | Carleo et al. | 2026-06 | recommended |
| [2606.04160](https://arxiv.org/abs/2606.04160) | Expert-Aware Refusal Steering | Marbut, Olson, Wheeler | 2026-06 | relevant |
| [2605.08513](https://arxiv.org/abs/2605.08513) | A Single Neuron Is Sufficient to Bypass Safety Alignment | Kazemi, Chegini, Safi | 2026-05 | recommended |
| [2605.21706](https://arxiv.org/abs/2605.21706) | Latent-space Attacks for Refusal Evasion | Piras, Mura, Brau, Pintor, Oneto, Roli, Biggio | 2026-05 | defense |
| [2505.17306](https://arxiv.org/abs/2505.17306) | Refusal Direction is Universal Across Safety-Aligned Languages | Wang, Wang, Liu, Schuetze, Plank | 2025-05 | relevant |
| [2310.08419](https://arxiv.org/abs/2310.08419) | Jailbreaking Black Box Large Language Models in Twenty Queries (PAIR) | Chao et al. | 2023-10 | academic JB |
| [2312.02119](https://arxiv.org/abs/2312.02119) | TAP: Tree of Attacks with Pruning | Mehrotra et al. | NeurIPS 2024 | academic JB |
| [2404.01833](https://arxiv.org/abs/2404.01833) | Great, Now Write an Article About That (Crescendo) | Russinovich, Salem, Eldan | arXiv 2024 / v3 2025-02 | academic JB |
| [2602.15001](https://arxiv.org/abs/2602.15001) | Boundary Point Jailbreaking | UK AISI | 2026-02 | academic JB |
| [2603.22061](https://arxiv.org/abs/2603.22061) | On the Failure of Topic-Matched Contrast Baselines | Petrov | 2026-03 | relevant |
| [2606.23375](https://arxiv.org/abs/2606.23375) | Legal Over-alignment and Heretic LoRA | Wuhrmann et al. | 2026-06 | relevant |
| [2603.10012](https://arxiv.org/abs/2603.10012) | Military-tuned model + Heretic (authorized study) | Fitzgerald et al. | 2026-03 | relevant |
| [2605.26526](https://arxiv.org/abs/2605.26526) | Safeguarded open-weight models: abliteration + prefill range | Kuo et al. | 2026-05 | defense |
| [2604.05267](https://arxiv.org/abs/2604.05267) | Do Domain-specific Experts exist in MoE-based LLMs? (DSMoE) | Do et al. | ACL Findings 2026 | recommended |
| [2401.14196](https://arxiv.org/abs/2401.14196) | DeepSeek-Coder: When the Large Language Model Meets Programming -- The Rise of Code Intelligence | Guo et al. | 2024-01 | relevant |
| [2402.03300](https://arxiv.org/abs/2402.03300) | DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models | Shao et al. | 2024-02 | relevant |
| [2406.04313](https://arxiv.org/abs/2406.04313) | Improving Alignment and Robustness with Circuit Breakers | Zou et al. | 2024-06 | defense |
| [2310.01405](https://arxiv.org/abs/2310.01405) | Representation Engineering: A Top-Down Approach to AI Transparency | Zou, Phan, et al. | 2023-10 | recommended |
| [2306.01708](https://arxiv.org/abs/2306.01708) | TIES-Merging: Resolving Interference When Merging Models | Yadav et al. | NeurIPS 2023 | relevant |
| [2606.26161](https://arxiv.org/abs/2606.26161) | Refusal Lives Downstream of Persona in Chat Models | Zhong, Li | ICML 2026 workshop | recommended |
| [2502.17420](https://arxiv.org/abs/2502.17420) | The Geometry of Refusal: Concept Cones and Representational Independence | Wollschläger et al. | 2025-02 | recommended |
| [2606.22686](https://arxiv.org/abs/2606.22686) | The Geometry of Refusal: Linear Instability (Contrastive Logit Steering) | Ratnakar, Vats | 2026-06 | relevant |
| [2604.04385](https://arxiv.org/abs/2604.04385) | How Alignment Routes: Policy Circuits in Language Models | Frank | 2026-04 | relevant |
| [2603.11388](https://arxiv.org/abs/2603.11388) | Deactivating Refusal Triggers | Xue, Qi, Liu, Chen, Pedarsani | 2026-03 | relevant |
| [2410.03415](https://arxiv.org/abs/2410.03415) | Mitigating False Refusal via Single Vector Ablation | Cao et al. | ICLR 2025 | recommended |
| [2509.09708](https://arxiv.org/abs/2509.09708) | Dissecting Large-Language-Model Refusal | Prakash et al. | AAAI 2026 | relevant |
| [2409.05907](https://arxiv.org/abs/2409.05907) | Programming Refusal with Conditional Activation Steering (CAST) | Lee, Padhi, Ramamurthy, et al. | ICLR 2025 Spotlight | recommended |
| [2603.13359](https://arxiv.org/abs/2603.13359) | Discovering and Steering Category-Specific Refusal Directions | Alagharu, Singh, Shamsudeen, Wu, Panda | 2026-03 | recommended |
| [2512.16602](https://arxiv.org/abs/2512.16602) | Refusal Steering: Fine-grained Control over Refusal Behaviour | García-Ferrero, Montero, Orus | 2025-12 | relevant |
| [2601.08489](https://arxiv.org/abs/2601.08489) | Surgical Refusal Ablation | Cristofano | 2026-01 | recommended |

Academic jailbreak papers (PAIR, TAP, Crescendo, and similar) are for **defense and understanding**. Do not use them to generate harm.

---

## Acknowledgments — repositories

Thank you to the tool authors and maintainers. Abliterater mostly **pin-calls** them. AGPL/GPL is not vendored into `src/`.

| Repository | Role | License | How we use it |
| --- | --- | --- | --- |
| [p-e-w/heretic](https://github.com/p-e-w/heretic) | primary tool | AGPL-3.0 | TPE-optimized orthogonalization. pip install git+https://github.com/p-e-w/heretic.git@3521f8648a0dccf6e12a92666862632235fac7e6 |
| [elder-plinius/OBLITERATUS](https://github.com/elder-plinius/OBLITERATUS) | headless ablation CLI | AGPL-3.0 | pip install git+https://github.com/elder-plinius/OBLITERATUS.git@205d28a11352313eb68954223948c9ce9b10cb39 · obliteratus obliterate --method advanced. no failspy in argparse. |
| [andyrdt/refusal_direction](https://github.com/andyrdt/refusal_direction) | paper official code | Apache-2.0 | Arditi reproduction; draw r yourself |
| [ant-research/Awesome-Refusal-Suppression](https://github.com/ant-research/Awesome-Refusal-Suppression) | index | curation | starting index of papers and repos |
| [FailSpy/abliterator](https://github.com/FailSpy/abliterator) | original practical | MIT | early standard. narrow compatibility. no console script. analog apply_ablation.py. |
| [Goekdeniz-Guelmez/gabliteration](https://github.com/Goekdeniz-Guelmez/gabliteration) | research code | MIT | multi-direction ridge reproduction. gabliterate @1498fc74. stdin 1 is analog. |
| [heterodoxin/apostate](https://github.com/heterodoxin/apostate) | MIT KCRN/diode CLI | MIT | console script apostate. apostate ablate --model --out @be36269d (2026-09-07). PyPI 404. optional chip. |
| [wuwangzhang1216/abliterix](https://github.com/wuwangzhang1216/abliterix) | 2026 Heretic derivative | AGPL-3.0 | optional chip. pip git @5d58cea9 (2026-09-01). --model.model-id --non-interactive --non-interactive-output-dir. do not vendor. |
| [AIAnytime/ablate](https://github.com/AIAnytime/ablate) | MIT unattended CLI | MIT | optional chip. console script ablate. git @6b89bea10dd2305b374004147ccc2b3a16769c38 = ablate-llm 0.2.0. ablate run --model --output --save-model. bake writes output/model. |
| [jwest33/abliterator](https://github.com/jwest33/abliterator) | MIT orthogonal-projection CLI | MIT | optional chip. console script abliterate. not FailSpy. git @6ca3356e. --batch --model_path --output_path (underscore). PyPI abliterator 404. do not pip-install abliteration. |
| [nanofatdog/LLM-abliterate](https://github.com/nanofatdog/LLM-abliterate) | Apache unattended extract/apply CLI | Apache-2.0 | optional chip. console script llm-abliterate @f01cec96. do not alias as abliterate (jwest). extract --out; apply --direction --lam 1.65 --save. LICENSE file 404; pyproject Apache-2.0. |
| [josepha-mayo/model-unfetter](https://github.com/josepha-mayo/model-unfetter) | Apache unattended ablate CLI | Apache-2.0 | optional chip. console script unfetter @4c9548c2. unfetter ablate MODEL --output --backend gpu. --strength parser default 1.0. setup.py entry_points. |
| [NousResearch/llm-abliteration](https://github.com/NousResearch/llm-abliteration) | Transformers | GPL-3.0 | fast educational pipeline. do not vendor. |
| [AUGMXNT/deccp](https://github.com/AUGMXNT/deccp) | single pass | Apache-2.0 | capability-preserving comparison. files 01/03 @1a6d5571. no deccp command. |
| [mlabonne/abliteration (HF blog)](https://huggingface.co/blog/mlabonne/abliteration) | intro article | blog | beginner entry. 2024-06 explainer |
| [TransformerLens](https://github.com/TransformerLensOrg/TransformerLens) | interpretability | MIT | hooks, cache, patch. FailSpy notebook dependency. not ported. |
| [Tsadoq/ErisForge](https://github.com/Tsadoq/ErisForge) | layer wrapper | MIT | layer-wrapper library. no console script. analog apply_ablation.py. |
| [Orion-zhen/abliteration](https://github.com/Orion-zhen/abliteration) | YAML single-pass | GPL-3.0 | python abliterate.py config.yaml. do not vendor. |
| [elder-plinius/OBLITERATUS (pinned fork)](https://github.com/elder-plinius/OBLITERATUS) | GUI multi-strategy (pinned) | AGPL-3.0-or-later | pack git @fb38a3b0. HEAD 2026-08-30 ls-remote cd8b0b78 drifted; not re-pinned. do not vendor. |
| [mainlp/False-Refusal-Mitigation](https://github.com/mainlp/False-Refusal-Mitigation) | false-refusal only | ICLR 2025 code | false-refusal vector. not all categories |
| [ricyoung/abliteration-comparison](https://github.com/ricyoung/abliteration-comparison) | bench | paper reproduction | 4-tool compatibility and GSM8K table |
| [GraySwanAI/circuit-breakers](https://github.com/GraySwanAI/circuit-breakers) | defense | paper | mirror of ablation. blocks harmful trajectories |
| [wollschlager/geometry-of-refusal](https://github.com/wollschlager/geometry-of-refusal) | cone | paper code | multi-dimensional refusal geometry |
| [knoveleng/orthex](https://github.com/knoveleng/orthex) | MIT --config CLI | MIT | has console script orthex. --config required. configs/data outside the wheel; architecture_adapter required. not a chip. |
| [FiditeNemini/mlx-abliteration](https://github.com/FiditeNemini/mlx-abliteration) | Apple MLX script | Apache-2.0 | python cli.py argparse. no console script. MLX-only. CUDA pack not a chip. |
| [knol3j/cli-abliterated](https://github.com/knol3j/cli-abliterated) | GGUF chat | MIT | cli-abliterated console script is chat, not ablation. |
| [0x0806/UnleashedLLM](https://github.com/0x0806/UnleashedLLM) | downloader/chat | LICENSE 404 | Unleashed label. no ablation CLI. do not invent an analog chip. |
| [adybag14-cyber/Abliteration](https://github.com/adybag14-cyber/Abliteration) | handbook | Apache-2.0 | docs + abliterate-cxx release. pip has no console script. not a chip. |

The license matrix is in root `LICENSE.md` and the README.

---

## Ecosystem catalogs (links only)

These are rows under SourceHub. They do not mean this app runs PyTorch for you.

- 57 method rows (`method-sources.json`) — PyTorch, JAX, Transformers, TRL, PEFT, Axolotl, and others
- 40 compute rows (`compute-sources.json`) — RunPod, Vast.ai, Lambda, Modal, cloud GPUs, and others
- 39 dataset rows (`dataset-sources.json`) — Hugging Face Datasets, Kaggle, OpenML, Zenodo, AI Hub, and others

There is no `DATASETS[]` catalog in the picker. Dataset pick is a URI plus optional revision/license.

---


---

## Methods — what the pack actually runs

Turning on a chip does not start a GPU. `run.sh` / `run.ps1` inside the ZIP clone tools at **pinned SHAs**. AGPL tools are not vendored into `src/`.

Research-tab axes A–F:

| Axis | Meaning |
| --- | --- |
| A direction | mean-diff · SVD · SAE. What to remove |
| B operator | orthogonalization · ridge · norm-preserving · steering |
| C search | manual · grid · TPE · layer pick |
| D scope | all-category · domain · style · single concept |
| E repair | none · DPO/ORPO · orthogonal LoRA |
| F defense | extended-refusal · alias · app filter · weight signing |

### Heretic (default)

- p-e-w/heretic `@3521f86` AGPL. TPE orthogonalization. Pack file `heretic.args.txt`.
- Default base is still-unabliterated Instruct. Finished GGUF is the reuse lane.
- Literature VRAM is **estimated**. 4B floor ~10 GiB, 7–8B recommended 24 GiB. 80B+ MoE has no streaming → no-fit.
- Heretic GPU golden in this repo is **R-004 OPEN**. `npm test` does not close it.

### Gabliteration

- Goekdeniz-Guelmez/gabliteration `@1498fc7` MIT. Multi-direction · ridge. Optional chip.

### FailSpy analog

- FailSpy/abliterator MIT. No console script. Pack uses analog `apply_ablation.py`. Do not vendor the upstream CLI.

### Other optional chips (pin-call)

abliterix AGPL `@5d58cea9` · ablate MIT `@6b89bea` · apostate MIT `@be36269d` · jwest MIT `@6ca3356` · LLM-abliterate Apache `@f01cec9` · unfetter Apache `@4c9548c` · deccp Apache `@1a6d557` · OBLITERATUS AGPL `@205d28a1`.

### LoRA / QLoRA / DPO

- Pack `train_lora.py`. **QLoRA ≠ LoRA ≠ Heretic** VRAM. The recommender keeps the formulas separate.
- QLoRA 7B golden measurement is **R-005 OPEN**.

### Quantization · serving

- llama.cpp MIT `@5cdd3d1` clone. GGUF Q4/Q5/Q8, Ollama `Modelfile`, Docker compose.
- Outputs: merged-bf16, adapter, GGUF, ollama, docker. Always both `run.sh` and `run.ps1`.

### PACK ZIP allowlist

`run.sh`, `run.ps1`, empty Azure stubs (`az-startup.sh/.ps1`, `azure-job.yml`), `docker-compose.yml`, `train_lora.py`, `eval.sh`, `Modelfile`, `heretic.args.txt`, `SYSTEM.txt`, `POWER.txt`, `POWER.en.txt`, `SFT.txt`, `eval.txt`, `job.json`, `README.txt`.

No `public/reports`. No keys.

### Run order

1. Build: purpose · base (§1) · methods · presets (§4) · compute · three stores · outputs.
2. Ctrl+S save, Ctrl+D ZIP.
3. Unzip on a GPU machine; `run.sh` or `run.ps1`.
4. Artifacts go to the ARTIFACTS column. The workbench does not upload bytes.
5. Connection list/create is **not** a training success.

---

## Every TODO ledger (never sum)

Files the code parses live in `src/data/`. `npm run ledger:status`. analog IMPLEMENTED ≠ native close. This guide does not close cells.

### 01–20 native (`TODO-ROADMAP.md`)

| ID | What | Status |
| --- | --- | --- |
| 01 | Unauthenticated server proxy removed | IMPLEMENTED |
| 02 | No auto-persist keys | analog + web Playwright. **Electron packaged OPEN** |
| 03–12, 15, 17, 19 | storage/QA/log/modal/titlebar/bench analog | IMPLEMENTED analog |
| 13 | Installer web assets | analog extraResources. **native OPEN** |
| 14 | Desktop external navigation policy | analog unit. **desktop launch OPEN** |
| 16 | Labels/tabs/selection a11y | analog. **E2E OPEN** |
| 18 | Header/font payload | analog blur-off. **bundle E2E OPEN** |
| 20 | Search/recovery/confirm | analog. **E2E OPEN** |

### R GPU / Hub (`TODO-WORKLOAD-SPEC-20260912.md`)

| ID | What | Status |
| --- | --- | --- |
| R-001–R-003, R-006–R-008, R-010 | recommender math/UI/params/RAM/golden patch analog | IMPLEMENTED analog |
| **R-004** | Heretic pipe on a real GPU | **OPEN** — this-machine 4B heretic log+VRAM |
| **R-005** | QLoRA 7B measured | **OPEN** |
| **R-009** | In-app Hub live refresh | analog snapshot. **in-app live OPEN** |

### W (`WORKFLOW.md`)

Still OPEN/IN_PROGRESS: **W01, W02, W06, W07, W08, W09, W11, W12, W14, W16**. W03–W05, W10, W13, W15, W17 are analog. E01–E04 BLOCKED_EXTERNAL (GPU, account, signing, bench). E05 DEFERRED.

### Ecosystem C (`ECOSYSTEM-MASTER-TODO.md`)

| ID | What | Status |
| --- | --- | --- |
| C-001 | Reject SSH usernames starting `-` | IMPLEMENTED |
| **C-002–C-007** | live SSH, runner submit, setup/cost compare, contract mix-up, monitor UI | **OPEN** |

Unchecked C-009, E-002…, A-001…, M-*, L-*, W-001 workload rows are catalog, not integration complete.

External: E01 GPU, E02 paid account, E03 Authenticode+clean VM. This repo does not pay for you.

---

## Still open (per ledger, never sum)

This guide does not close cells. `npm run ledger:status`. analog IMPLEMENTED ≠ native close.

### native 01–20 (`src/data/TODO-ROADMAP.md`)

| ID | Why still OPEN | Close requires |
| --- | --- | --- |
| 02 | Web analog keeps keys in screen memory. **Packaged Electron** persist-reject not measured | installer E2E, localStorage 0 |
| 13 | extraResources analog. No **source-free** install launch | clean-install start |
| 14 | URL policy unit analog. Desktop navigation run OPEN | packaged Electron policy pass |
| 16 | Field/Chip analog. No keyboard E2E | live tab/label E2E |
| 18 | blur-off analog. No bundle-byte E2E | network/bundle measure |
| 20 | Dialog analog. No search/clone/restore E2E | CRUD E2E |

01, 03–12, 15, 17, 19 are analog IMPLEMENTED. Do not promote the table.

### R (`src/data/TODO-WORKLOAD-SPEC-20260912.md`)

| ID | Why still OPEN | Close requires |
| --- | --- | --- |
| R-004 | No Heretic GPU golden | this-machine 4B heretic log+VRAM |
| R-005 | No QLoRA 7B run | 1 epoch or explicit skip |
| R-009 | Hub snapshot analog. No in-app live refresh | in-app live fetch |

### W (`src/data/WORKFLOW.md`)

OPEN/IN_PROGRESS: **W01** prod save/tabs, **W02** HF key boundary, **W06** live log redaction, **W07** packaged desktop, **W08** a11y keyboard, **W09** stepper/mobile CTA, **W11** scoring UI, **W12** search/reset E2E, **W14** Docker runtime, **W16** final fail-closed acceptance.

### C (`src/data/ECOSYSTEM-MASTER-TODO.md`)

**C-002–C-007** OPEN: live SSH, runner submit, setup/cost compare, contract mix-up, monitor UI. **C-001 and C-008** are closed. Do not analog-GREEN the rest. We want to improve the remaining rows **together** — [CONTRIBUTING.en.md](./CONTRIBUTING.en.md).

External: **E01** GPU, **E02** paid account, **E03** Authenticode+clean VM. This repo does not pay for you.

## Acceptable use · contributing

- No third-party **commercial** use, **illegal** use, or **abuse**: [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md)
- Use **outside our grant** is unauthorized. **Illegal use is your responsibility** — not GENOX, not contributors.
- Contribute with us: [CONTRIBUTING.en.md](./CONTRIBUTING.en.md) — patches, measurements, reviews. analog `npm test` ≠ table close.
- License: [LICENSE.md](./LICENSE.md)

## Sponsor · collaboration

A small gift and a collaboration inquiry are **separate doors**. Neither is required. Full text: [SUPPORT.en.md](./SUPPORT.en.md).

A gift is not equity. If you would like to work together, email `support@genox.one`. This page is not an offer of securities.

| Channel | Value |
| --- | --- |
| Binance ID | `110474712` |
| BSC (BEP-20) | `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` |

BSC only. Wrong chain cannot be recovered.

---

GENOX · Juno Andy Cheong · AGPL-3.0-or-later + [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md)
