# Abliterater user guide

One line: pick an **unabliterated Instruct** base, assemble a Heretic / LoRA / quant **pack ZIP**, and connect **your** GPU-cloud keys.

**Educational.** This project exists to study refusal-suppression and to **counter illegal misuse**. That purpose needs **worldwide attention**. It is not a runbook for harm.

This app does not host weights. It does not rent GPUs for you. A passing `npm test` is not a training run. Analog web green is not a native Electron/GPU close.

Language toggle is KO/EN in the header. Korean: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md).

Acceptable use (no third-party commercial / illegal / abusive use): [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md). Contributing: [CONTRIBUTING.en.md](./CONTRIBUTING.en.md).

---

## Why KDP PDFs landed in the installer

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
| [2406.11717](https://arxiv.org/abs/2406.11717) | Refusal in Language Models Is Mediated by a Single Direction | Arditi, Obeso, Syed, Paleka, Panickssery, Gurnee, Nanda | NeurIPS 2024 | 필수 |
| [2512.13655](https://arxiv.org/abs/2512.13655) | Comparative Analysis of LLM Abliteration Methods | Young | 2026-01 v2 | 필수 |
| [2607.17427](https://arxiv.org/abs/2607.17427) | Abliteration Is Not a Scalpel | Fafuła | 2026-07 | 필수 |
| [2512.18901](https://arxiv.org/abs/2512.18901) | Gabliteration: Adaptive Multi-Directional Neural Weight Modification | Gülmez | 2025-12 / v3 2026-01 | 권장 |
| [2607.02714](https://arxiv.org/abs/2607.02714) | Not All Refusals Are Equal: How Safety Alignment Fails Cybersecurity at Scale | Hadetskyi et al. | 2026-07 | 해당자 |
| [2602.02132](https://arxiv.org/abs/2602.02132) | There Is More to Refusal in LLMs than a Single Direction | Joad, Hawasly, Boughorbel, Durrani, Sencar | 2026-02 | 권장 |
| [2505.19056](https://arxiv.org/abs/2505.19056) | An Embarrassingly Simple Defense Against LLM Abliteration Attacks | Abu Shairah, Hammoud, Ghanem, Turkiyyah | 2025-05 | 방어 |
| [2608.18093](https://arxiv.org/abs/2608.18093) | Abliteration Mitigation via Refusal Aliases | Truong | 2026-08 | 방어 |
| [2606.05396](https://arxiv.org/abs/2606.05396) | Willing but Unable | Carleo et al. | 2026-06 | 권장 |
| [2606.04160](https://arxiv.org/abs/2606.04160) | Expert-Aware Refusal Steering | Marbut, Olson, Wheeler | 2026-06 | 해당자 |
| [2605.08513](https://arxiv.org/abs/2605.08513) | A Single Neuron Is Sufficient to Bypass Safety Alignment | Kazemi, Chegini, Safi | 2026-05 | 권장 |
| [2605.21706](https://arxiv.org/abs/2605.21706) | Latent-space Attacks for Refusal Evasion | Piras, Mura, Brau, Pintor, Oneto, Roli, Biggio | 2026-05 | 방어 |
| [2505.17306](https://arxiv.org/abs/2505.17306) | Refusal Direction is Universal Across Safety-Aligned Languages | Wang, Wang, Liu, Schuetze, Plank | 2025-05 | 해당자 |
| [2310.08419](https://arxiv.org/abs/2310.08419) | Jailbreaking Black Box Large Language Models in Twenty Queries (PAIR) | Chao et al. | 2023-10 | 학술 JB |
| [2312.02119](https://arxiv.org/abs/2312.02119) | TAP: Tree of Attacks with Pruning | Mehrotra et al. | NeurIPS 2024 | 학술 JB |
| [2404.01833](https://arxiv.org/abs/2404.01833) | Great, Now Write an Article About That (Crescendo) | Russinovich, Salem, Eldan | arXiv 2024 / v3 2025-02 | 학술 JB |
| [2602.15001](https://arxiv.org/abs/2602.15001) | Boundary Point Jailbreaking | UK AISI | 2026-02 | 학술 JB |
| [2603.22061](https://arxiv.org/abs/2603.22061) | On the Failure of Topic-Matched Contrast Baselines | Petrov | 2026-03 | 해당자 |
| [2606.23375](https://arxiv.org/abs/2606.23375) | Legal Over-alignment and Heretic LoRA | Wuhrmann et al. | 2026-06 | 해당자 |
| [2603.10012](https://arxiv.org/abs/2603.10012) | Military-tuned model + Heretic (authorized study) | Fitzgerald et al. | 2026-03 | 해당자 |
| [2605.26526](https://arxiv.org/abs/2605.26526) | Safeguarded open-weight models: abliteration + prefill range | Kuo et al. | 2026-05 | 방어 |
| [2604.05267](https://arxiv.org/abs/2604.05267) | Do Domain-specific Experts exist in MoE-based LLMs? (DSMoE) | Do et al. | ACL Findings 2026 | 권장 |
| [2401.14196](https://arxiv.org/abs/2401.14196) | DeepSeek-Coder: When the Large Language Model Meets Programming -- The Rise of Code Intelligence | Guo et al. | 2024-01 | 해당자 |
| [2402.03300](https://arxiv.org/abs/2402.03300) | DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models | Shao et al. | 2024-02 | 해당자 |
| [2406.04313](https://arxiv.org/abs/2406.04313) | Improving Alignment and Robustness with Circuit Breakers | Zou et al. | 2024-06 | 방어 |
| [2310.01405](https://arxiv.org/abs/2310.01405) | Representation Engineering: A Top-Down Approach to AI Transparency | Zou, Phan, et al. | 2023-10 | 권장 |
| [2306.01708](https://arxiv.org/abs/2306.01708) | TIES-Merging: Resolving Interference When Merging Models | Yadav et al. | NeurIPS 2023 | 해당자 |
| [2606.26161](https://arxiv.org/abs/2606.26161) | Refusal Lives Downstream of Persona in Chat Models | Zhong, Li | ICML 2026 workshop | 권장 |
| [2502.17420](https://arxiv.org/abs/2502.17420) | The Geometry of Refusal: Concept Cones and Representational Independence | Wollschläger et al. | 2025-02 | 권장 |
| [2606.22686](https://arxiv.org/abs/2606.22686) | The Geometry of Refusal: Linear Instability (Contrastive Logit Steering) | Ratnakar, Vats | 2026-06 | 해당자 |
| [2604.04385](https://arxiv.org/abs/2604.04385) | How Alignment Routes: Policy Circuits in Language Models | Frank | 2026-04 | 해당자 |
| [2603.11388](https://arxiv.org/abs/2603.11388) | Deactivating Refusal Triggers | Xue, Qi, Liu, Chen, Pedarsani | 2026-03 | 해당자 |
| [2410.03415](https://arxiv.org/abs/2410.03415) | Mitigating False Refusal via Single Vector Ablation | Cao et al. | ICLR 2025 | 권장 |
| [2509.09708](https://arxiv.org/abs/2509.09708) | Dissecting Large-Language-Model Refusal | Prakash et al. | AAAI 2026 | 해당자 |
| [2409.05907](https://arxiv.org/abs/2409.05907) | Programming Refusal with Conditional Activation Steering (CAST) | Lee, Padhi, Ramamurthy, et al. | ICLR 2025 Spotlight | 권장 |
| [2603.13359](https://arxiv.org/abs/2603.13359) | Discovering and Steering Category-Specific Refusal Directions | Alagharu, Singh, Shamsudeen, Wu, Panda | 2026-03 | 권장 |
| [2512.16602](https://arxiv.org/abs/2512.16602) | Refusal Steering: Fine-grained Control over Refusal Behaviour | García-Ferrero, Montero, Orus | 2025-12 | 해당자 |
| [2601.08489](https://arxiv.org/abs/2601.08489) | Surgical Refusal Ablation | Cristofano | 2026-01 | 권장 |

Academic jailbreak papers (PAIR, TAP, Crescendo, and similar) are for **defense and understanding**. Do not use them to generate harm.

---

## Acknowledgments — repositories

Thank you to the tool authors and maintainers. Abliterater mostly **pin-calls** them. AGPL/GPL is not vendored into `src/`.

| Repository | Role | License | How we use it |
| --- | --- | --- | --- |
| [p-e-w/heretic](https://github.com/p-e-w/heretic) | 기본 도구 | AGPL-3.0 | TPE 최적화 직교화. pip install git+https://github.com/p-e-w/heretic.git@3521f8648a0dccf6e12a92666862632235fac7e6 |
| [elder-plinius/OBLITERATUS](https://github.com/elder-plinius/OBLITERATUS) | 헤드리스 ablation CLI | AGPL-3.0 | pip install git+https://github.com/elder-plinius/OBLITERATUS.git@205d28a11352313eb68954223948c9ce9b10cb39 · obliteratus obliterate --method advanced. argparse에 failspy 없음. |
| [andyrdt/refusal_direction](https://github.com/andyrdt/refusal_direction) | 논문 공식 코드 | Apache-2.0 | Arditi 재현. r을 직접 그릴 때 |
| [ant-research/Awesome-Refusal-Suppression](https://github.com/ant-research/Awesome-Refusal-Suppression) | 인덱스 | 큐레이션 | 논문·리포 목록의 출발점 |
| [FailSpy/abliterator](https://github.com/FailSpy/abliterator) | 원조 실용 | MIT | 초기 표준. 호환은 좁음. console script 없음. analog apply_ablation.py. |
| [Goekdeniz-Guelmez/gabliteration](https://github.com/Goekdeniz-Guelmez/gabliteration) | 연구 코드 | MIT | 다방향·ridge 재현. gabliterate @1498fc74. stdin 1은 analog. |
| [heterodoxin/apostate](https://github.com/heterodoxin/apostate) | MIT KCRN/diode CLI | MIT | console script apostate. apostate ablate --model --out @be36269d (2026-09-07). PyPI 404. 선택 칩. |
| [wuwangzhang1216/abliterix](https://github.com/wuwangzhang1216/abliterix) | 2026 Heretic 파생 | AGPL-3.0 | 선택 칩. pip git @5d58cea9 (2026-09-01). --model.model-id --non-interactive --non-interactive-output-dir. vendor 금지. |
| [AIAnytime/ablate](https://github.com/AIAnytime/ablate) | MIT 무인 CLI | MIT | 선택 칩. console script ablate. git @6b89bea10dd2305b374004147ccc2b3a16769c38 = ablate-llm 0.2.0. ablate run --model --output --save-model. bake는 output/model. |
| [jwest33/abliterator](https://github.com/jwest33/abliterator) | MIT 직교 투영 CLI | MIT | 선택 칩. console script abliterate. FailSpy 아님. git @6ca3356e. --batch --model_path --output_path (underscore). PyPI abliterator 404. pip abliteration 금지. |
| [nanofatdog/LLM-abliterate](https://github.com/nanofatdog/LLM-abliterate) | Apache 무인 extract/apply CLI | Apache-2.0 | 선택 칩. console script llm-abliterate @f01cec96. alias abliterate 금지(jwest). extract --out; apply --direction --lam 1.65 --save. LICENSE 파일 404, pyproject Apache-2.0. |
| [josepha-mayo/model-unfetter](https://github.com/josepha-mayo/model-unfetter) | Apache 무인 ablate CLI | Apache-2.0 | 선택 칩. console script unfetter @4c9548c2. unfetter ablate MODEL --output --backend gpu. --strength 파서 기본 1.0. setup.py entry_points. |
| [NousResearch/llm-abliteration](https://github.com/NousResearch/llm-abliteration) | Transformers | GPL-3.0 | 빠른 교육용 파이프라인. vendor 금지. |
| [AUGMXNT/deccp](https://github.com/AUGMXNT/deccp) | 단일 패스 | Apache-2.0 | 능력 보존 비교 실험. 01/03 파일명 @1a6d5571. deccp 명령 없음. |
| [mlabonne/abliteration (HF blog)](https://huggingface.co/blog/mlabonne/abliteration) | 입문 글 | 블로그 | 초보 진입. 2024-06 해설 |
| [TransformerLens](https://github.com/TransformerLensOrg/TransformerLens) | 해석 | MIT | 훅·캐시·패치. FailSpy 노트북 의존. 포트 안 함. |
| [Tsadoq/ErisForge](https://github.com/Tsadoq/ErisForge) | 레이어 래퍼 | MIT | 레이어 래퍼 라이브러리. console script 없음. analog apply_ablation.py. |
| [Orion-zhen/abliteration](https://github.com/Orion-zhen/abliteration) | YAML 단일패스 | GPL-3.0 | python abliterate.py config.yaml. vendor 금지. |
| [elder-plinius/OBLITERATUS (pinned fork)](https://github.com/elder-plinius/OBLITERATUS) | GUI·다중전략 (pinned) | AGPL-3.0-or-later | 팩 git @fb38a3b0. HEAD 2026-08-30 ls-remote cd8b0b78 드리프트, 재핀 안 함. vendor 금지. |
| [mainlp/False-Refusal-Mitigation](https://github.com/mainlp/False-Refusal-Mitigation) | 과잉거절만 | ICLR 2025 코드 | 거짓 거절 벡터. 전 범주 아님 |
| [ricyoung/abliteration-comparison](https://github.com/ricyoung/abliteration-comparison) | 벤치 | 논문 재현 | 4도구 호환·GSM8K 표 |
| [GraySwanAI/circuit-breakers](https://github.com/GraySwanAI/circuit-breakers) | 방어 | 논문 | ablation의 거울. 유해 궤적 차단 |
| [wollschlager/geometry-of-refusal](https://github.com/wollschlager/geometry-of-refusal) | 원뿔 | 논문 코드 | 다차원 거절 기하 재현 |
| [knoveleng/orthex](https://github.com/knoveleng/orthex) | MIT --config CLI | MIT | console script orthex 있음. --config required. configs/data 휠 밖, architecture_adapter 필수. 칩 아님. |
| [FiditeNemini/mlx-abliteration](https://github.com/FiditeNemini/mlx-abliteration) | Apple MLX 스크립트 | Apache-2.0 | python cli.py argparse. console script 없음. MLX-only. CUDA 팩 칩 아님. |
| [knol3j/cli-abliterated](https://github.com/knol3j/cli-abliterated) | GGUF 채팅 | MIT | cli-abliterated 콘솔 스크립트는 채팅. ablation 아님. |
| [0x0806/UnleashedLLM](https://github.com/0x0806/UnleashedLLM) | 다운로더/채팅 | LICENSE 404 | Unleashed 라벨. ablation CLI 없음. analog 칩 발명 금지. |
| [adybag14-cyber/Abliteration](https://github.com/adybag14-cyber/Abliteration) | 핸드북 | Apache-2.0 | 문서+abliterate-cxx 릴리스. pip console script 없음. 칩 아님. |

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

## Acceptable use · contributing

- No third-party **commercial** use, **illegal** use, or **abuse**: [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md)
- Contributing: [CONTRIBUTING.en.md](./CONTRIBUTING.en.md)
- License text: [LICENSE.md](./LICENSE.md) (AGPL-3.0-or-later + those additional terms)


## Still open

Per-ledger OPEN (never sum): native 02, 13, 14, 16, 18, 20 · R-004, R-005 · R-009 · W01, W02, W06–W09, W11, W12, W14, W16 · C-002–C-007.

`npm run ledger:status`. analog IMPLEMENTED ≠ native close.

## Support

If this project is useful, a small donation helps us keep going. It is not required. We would receive it humbly, and keep working as carefully as we can.

| Route | Value |
| --- | --- |
| Binance ID | `110474712` |
| BSC (BEP-20) | `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` |

Funds sent on the wrong chain cannot be recovered. Use BSC only.

---

GENOX · Juno Andy Cheong · AGPL-3.0-or-later + [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md)
