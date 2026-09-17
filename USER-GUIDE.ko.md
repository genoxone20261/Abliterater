# Abliterater 사용 설명서

한 줄: **아직 abliteration 되지 않은 Instruct 베이스**를 골라 Heretic / LoRA / 양자화 **팩 ZIP**을 만들고, **사용자 본인**의 GPU 클라우드 키로 연결하는 작업대입니다.

**교육 목적**입니다. 거절 억제를 연구하고, 이를 통한 **불법 이용을 막는 대응**을 위해 **전 세계의 관심**을 구합니다. 유해 생성·공격 실행용이 아닙니다.

이 앱은 가중치를 호스팅하지 않습니다. GPU를 대신 빌려 주지 않습니다. `npm test` 통과는 학습 실행이 아닙니다. analog 웹 통과는 native Electron/GPU 클로즈가 아닙니다.

언어 토글은 헤더의 KO/EN. 영어: [USER-GUIDE.en.md](./USER-GUIDE.en.md).

## 여기서 abliteration이 의미하는 것

오픈 웨이트 채팅 모델은 안전 정렬 뒤 일부 요청을 **거절**합니다. Abliteration(Heretic 등)은 그 거절을 잔차 스트림의 방향으로 보고, 줄이거나 되돌리는 방법을 연구합니다. 이 작업대는 **연구·방어·교육**용이며 불법 이용을 **막는 대응**을 위한 것입니다. jailbreak-as-a-service가 아닙니다.

여기서 “작업”은: **아직 abliteration되지 않은 공식 Instruct** 베이스(기본 `Qwen/Qwen3-4B-Instruct-2507`)에서 시작해 방법(기본 Heretic)을 고르고, pin-call 스크립트 **팩 ZIP**을 받아 **본인** 머신 또는 **본인** GPU 클라우드에서 실행하는 것입니다. 브라우저가 학습하지 않습니다. 칩을 켠다고 GPU가 시작되지 않습니다. `npm test`는 학습이 아닙니다. analog `:8080` ≠ native Electron / GPU 골든 클로즈.

이미 처리된 heretic/GGUF는 **재사용 레인**이지 기본값이 아닙니다. 연구 자료 탭의 학술 jailbreak 논문은 **방어·이해**용입니다.

## 첫 세션

1. `npm ci && npm run dev` → `http://127.0.0.1:8080/`.
2. 기본 칩이 공식 Instruct인지 확인. heretic GGUF가 아님. `PRESETS[0]`는 Instruct 방법 비교.
3. 탐색을 연다. VRAM 불명은 배너 하나. 추정을 GPU 실행으로 보지 말 것.
4. 작업대에서 팩 다운로드 (Ctrl+D). 실행 전에 `run.sh` / `run.ps1` / `job.json`.
5. 키는 연결 화면 메모리만, 예산 Dialog 뒤. **본인** 돈을 쓸 때까지 dry-run.
6. `npm run ledger:status` — 남은 OPEN은 **원장별**. 한 %로 합치지 말 것.

긴 랜딩: [README.ko.md](./README.ko.md). **지금 할 일**(작업대 / 팩 실행 / 기여)은 그 README에 있습니다.

## 작업 방법

“웹을 열었다”와 “모델을 학습했다”와 “원장 칸을 닫았다”를 섞지 마십시오.

### A. 팩 만들기 (작업대)

1. 탭 **1**(작업대), 워크스페이스 **구성**.
2. §1 카탈로그: 공식 Instruct(`work` 레인). 재사용 GGUF는 다른 레인 — 기본값 아님.
3. 방법: 다른 칩을 고르지 않으면 Heretic. 목적/도메인: 수학은 ablation을 스킬로 **보지 않습니다**.
4. 컴퓨트 칩은 **본인** 러너에 맞춥니다 (`local-cuda` / `rocm` / `metal` / `cpu` 또는 카탈로그 클라우드).
5. 저장: 세 열(베이스 가중치 / 데이터셋 / 산출물). UI는 ZIP에 선택만 적습니다. 바이트를 올리지 않습니다.
6. Ctrl+D → `run.sh` / `run.ps1` / `job.json` 확인.

빈 HF `owner/name`은 워크플로를 **막습니다**. 이 단계에 연결 키는 **필요 없습니다**.

### B. 팩 실행 (본인 머신 또는 본인 키)

1. **본인** 디스크에서 `run.sh` 또는 `run.ps1`, 또는 연결 → 예산 Dialog → 먼저 dry-run.
2. GPU 골든(R-004 / R-005)을 주장하면 로그+VRAM을 남깁니다.
3. 클라우드 인스턴스 목록은 그 골든이 아닙니다.

### C. OPEN 칸 닫기 (기여자)

`npm run ledger:status`. [아직 열린 것](#아직-열린-것-원장별-분석-합산-금지)에서 한 칸. 증거만. analog `npm test` ≠ close. [CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md).

이용 제한(제3자 상업·불법·악용 금지): [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md). 기여: [CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md). 후원·협업 문의: [SUPPORT.ko.md](./SUPPORT.ko.md). 보안 신고: [SECURITY.md](./SECURITY.md).

---

## 왜 KDP PDF가 설치본에 들어갔나

저자가 쓰는 책 PDF는 디스크의 `public/reports/`에 둡니다. 제품 탭에 나열하지 않고, PACK ZIP에도 넣지 않습니다. **삭제하지 않습니다.**

실수 경로:

1. Vite/Nitro 프로덕션 빌드는 `public/` 전체를 `.vercel/output/static/`으로 복사합니다.
2. Electron `extraResources`는 그 `.vercel/output` 전체를 설치본에 넣습니다.
3. 그래서 호스트에서 `npm run build` 후 친 **첫 Windows exe**에 KDP PDF가 들어갔습니다. 용량이 약 185MB였습니다.
4. Docker 이미지는 `.dockerignore`가 `public/reports`를 이미 빼고 있어서 **처음부터 깨끗했습니다.**

고친 것: `scripts/omit-kdp-from-output.mjs`가 빌드 직후 `static/reports`를 지우고, Electron `extraResources.filter`가 `reports`를 한 번 더 막습니다. 재패킹 exe는 약 88MB이고 unpacked `reports`는 0입니다. `public/reports`는 로컬 디스크에 그대로 있습니다.

Vite 개발 서버가 URL을 알면 `/reports/….pdf`를 줄 수 있는 것은 의도된 로컬 예외입니다. 공개 git · Docker · 설치본에는 넣지 않습니다.

## 왜 TODO가 제품에 있나

세션 스크래치(`docs/research-*`, CHILD 메모, Vast JSON)는 **올리지 않습니다.** `docs/` 폴더는 공개 git에서 제외입니다.

코드가 **직접 import/파싱하는 제품 원장**은 `src/data/`에 있습니다.

| 파일 | 이유 |
| --- | --- |
| `src/data/TODO-ROADMAP.md` | `npm run ledger:status` · 테스트가 01–20 native OPEN을 읽음 |
| `TODO-WORKLOAD-SPEC-20260912.md` | R GPU / in-app live 원장 |
| `WORKFLOW.md` | W 표 |
| `ECOSYSTEM-MASTER-TODO.md` | 에코 표 |
| `compute-sources.json` `dataset-sources.json` `method-sources.json` | `src/lib/ecosystem.ts` typecheck import |
| `HUB-SNAPSHOT-20260912.json` | 허브 스냅샷 테스트 |

스크래치 TODO를 “문서인 척” 넣은 것이 아닙니다. 원장 없이 CI typecheck가 깨집니다. 표의 OPEN 칸을 이 설명서가 닫지 않습니다.

---

## 설치

필요: Node 24, npm. 데스크톱 팩은 Electron 35. Docker 서버는 Docker Engine.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

브라우저 `http://127.0.0.1:8080/`.

테스트: `npm run typecheck` · `npm run lint` · `npm test`.

프로덕션 웹(Vite 없음):

```bash
npm run build
HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs
```

Docker:

```bash
docker compose up -d --build
# http://127.0.0.1:8080/
```

데스크톱(먼저 `npm run build`):

```bash
npm run electron:dev
npm run electron:build:win     # NSIS + portable, Windows. 기본 미서명
npm run electron:build:linux   # AppImage — Linux 호스트 또는 CI
npm run electron:build:mac     # DMG — macOS 호스트 또는 CI
```

Windows에서 AppImage/DMG는 이 머신에서 만들지 못합니다. 릴리스의 Linux zip은 unpacked x64입니다. SmartScreen의 ‘알 수 없는 게시자’는 미서명 OSS에서 정상입니다.

키는 `.env`에 넣지 말고 **연결 화면 메모리**에만 붙여 넣습니다. `.env.example`은 주석뿐입니다.

---

## 화면

탭은 두 개뿐입니다. 문서 라이브러리/KDP 탭은 없습니다.

| 키 | 탭 | 하는 일 |
| --- | --- | --- |
| `1` | 작업대 | 구성 · 탐색·검증 · 연결 |
| `2` | 연구 자료 | 논문 arXiv 링크, GitHub 리포 링크 |

푸터: GENOX · Juno Andy Cheong · https://github.com/genoxone20261 · support@genox.one

### 단축키

| 키 | 동작 |
| --- | --- |
| Ctrl+S | 현재 작업 저장 |
| Ctrl+D | 팩 다운로드 |
| Ctrl+/ 또는 ? | 단축키 도움말 |
| 1 / 2 | 탭 |
| Esc | 대화상자 닫기 |

---

## 작업대 — 구성

기본 워크스페이스는 **구성**. 기본 베이스는 `Qwen/Qwen3-4B-Instruct-2507` (아직 heretic 되지 않은 Instruct). 방법 Heretic, 산출 merged BF16. 이미 처리된 heretic/GGUF는 **재사용 레인**이지 기본값이 아닙니다.

1. **목적 / 분야** — abliterated, domain, pipeline 등. 분야는 일반·공학·수학 등. 수학 분야는 ablation을 능력으로 취급하지 않습니다.
2. **모델 소스 (§1)** — 카탈로그 칩 `work` = 원본 Instruct, `reuse` = 이미 abliterated/GGUF. Hugging Face 리포, 로컬 경로, API 베이스 URL. 빈 HF 리포는 워크플로가 막습니다.
3. **방법** — Heretic(시도 횟수 / 최대 가중치 / 방향 인덱스), Gabliteration, FailSpy analog, LoRA/QLoRA/DPO, 양자화, RAG-first 등. 칩을 켠다고 GPU가 돌아가지 않습니다. **팩 스크립트가 그 도구를 pin-call**합니다. AGPL 도구는 src에 vendor하지 않습니다.
4. **프리셋 (§4)** — 1번 Abliteration 방법 비교(Instruct), 2번 분야 LoRA, 3번 로컬 GGUF 재사용. 1번을 누르면 Instruct가 heretic GGUF로 바뀌면 안 됩니다.
5. **컴퓨트** — local-cuda / rocm / metal / cpu, 또는 카탈로그 클라우드. create는 **사용자 키 + 예산 확인** 뒤에만. 이 저장소가 대신 결제하지 않습니다.
6. **저장소 세 열** — BASE WEIGHTS, DATASET, ARTIFACTS. 각각 local / s3 / gcs / azure / hf / minio / nfs. UI는 ZIP에 선택만 기록하고 바이트를 올리지 않습니다. 웹에서 데이터 루트 고르기는 데스크톱 전용입니다.
7. **산출물** — merged-bf16, GGUF Q4/Q5/Q8, LoRA adapter, Ollama, Docker. 항상 `run.sh`와 `run.ps1`을 같이 냅니다.
8. **팩 다운로드** — ZIP. 포함: run.sh/ps1, 빈 Azure stub, docker-compose.yml, train_lora.py, eval.sh, Modelfile, heretic.args.txt, SYSTEM/POWER/SFT/eval 텍스트, job.json, README.txt. `public/reports` 없음.

### 탐색·검증

- **추천** — 이 기계 VRAM에 맞춘 추정. VRAM을 모르면 카드마다 반복하지 않고 배너 한 줄. 문헌 GiB는 estimated이지 GPU 실런이 아닙니다. 이미 끝난 heretic 카드는 다시 ablate하지 않습니다.
- **SourceHub** — 모델/데이터셋 검색. 선택하면 `hfRepo` 또는 `storeDataUri`. 에코시스템 행은 **링크만**. Kaggle은 컴퓨트 칩이지 SourceHub kind가 아닙니다.

### 연결

**API 연결 · 인스턴스 모니터**. 비밀번호 칸은 `#prov-api-key` 하나. 위자드는 키 입력을 숨깁니다. 토큰은 화면 메모리만. localStorage/팩/진단에 안 남깁니다.

| 어댑터 | 실제 동작 |
| --- | --- |
| RunPod, Lambda, Vast.ai | 데스크톱 IPC list/read, 예산 ack 후 사용자 키 create/stop |
| Shadeform | `X-API-KEY`, instances info |
| Massed Compute, Prime Intellect, DeepInfra GPU, DigitalOcean, Together clusters | list/read. DO는 GPU만이 아님 |
| Thunder Compute | list only |
| Ollama / LM Studio | 루프백 `:11434` / `:1234` |
| Hugging Face 검색 | 공개 Hub. 앱이 HF_TOKEN을 저장하지 않음 |
| Modal, Azure ML, SSH, Jarvislabs, TensorDock 등 | 카탈로그/플랜. 라이브 로그인이 아님 |

목록이 성공이어도 Heretic GPU 골든(R-004)이 닫히지 않습니다.

---

## 연구 자료

검색·유형 필터. 논문은 arXiv abs/PDF를 새 탭으로. 리포는 GitHub를 새 탭으로. 앱 안에 PDF 뷰어를 다시 달지 않습니다. 아래 표가 앱이 인용하는 전 목록입니다.

---

## 감사의 말 — 논문

아래 저자와 논문이 이 작업대의 방법 선택·경고·비교 축을 만들었습니다. 구현은 그들의 코드를 통째로 넣지 않습니다. 링크는 arXiv abs입니다. 감사합니다.

| arXiv | Title | Authors | Venue | 우선 |
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

학술 jailbreak 논문(PAIR, TAP, Crescendo 등)은 **방어·이해용**입니다. 유해 생성에 쓰지 마십시오.

---

## 감사의 말 — 리포지토리

도구 저자·유지보수자에게 **감사합니다.** Abliterater는 대부분 **pin-call**입니다. AGPL/GPL은 src에 vendor하지 않습니다.

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

라이선스 매트릭스 원문은 루트 `LICENSE.md`와 README입니다.

---

## 에코시스템 카탈로그 (링크만)

SourceHub 아래 행입니다. PyTorch를 이 앱이 실행한다는 뜻이 아닙니다.

- 방법 카탈로그 57행 (`method-sources.json`) — PyTorch, JAX, Transformers, TRL, PEFT, Axolotl 등
- 컴퓨트 카탈로그 40행 (`compute-sources.json`) — RunPod, Vast.ai, Lambda, Modal, 클라우드 GPU 등
- 데이터셋 카탈로그 39행 (`dataset-sources.json`) — Hugging Face Datasets, Kaggle, OpenML, Zenodo, AI Hub 등

데이터셋 고르는 칸에 `DATASETS[]` 고정 목록은 없습니다. URI + 선택적 revision/license입니다.

---


---

## 방법 — 팩이 실제로 하는 일

칩을 켠다고 GPU가 돌아가지 않습니다. ZIP의 `run.sh` / `run.ps1`이 **핀된 git SHA**로 도구를 받아 실행합니다. AGPL 도구는 `src/`에 vendor하지 않습니다.

연구 탭의 A–F 축:

| 축 | 의미 |
| --- | --- |
| A 방향 추출 | 평균 차 · SVD · SAE. 무엇을 지울지 |
| B 적용 연산 | 직교화 · ridge · 노름 보존 · steering |
| C 탐색 | 수동 · 그리드 · TPE · 층 선택 |
| D 범위 | 전 범주 · 도메인 · 문체 · 단일 개념 |
| E 복구 | 없음 · DPO/ORPO · orthogonal LoRA |
| F 방어 | extended-refusal · alias · 앱 필터 · 가중치 서명 |

### Heretic (기본)

- p-e-w/heretic `@3521f86` AGPL. TPE 직교화. 팩 파일 `heretic.args.txt`.
- 기본 베이스는 아직 abliteration 되지 않은 Instruct. 이미 끝난 GGUF는 재사용 레인.
- 문헌 VRAM은 **estimated**. 4B 하한 ~10 GiB, 7–8B 권장 24 GiB. 80B+ MoE는 스트리밍 없음 → no-fit.
- 이 저장소의 Heretic GPU 골든은 **R-004 OPEN**. `npm test`가 이를 닫지 않습니다.

### Gabliteration

- Goekdeniz-Guelmez/gabliteration `@1498fc7` MIT. 다방향 · ridge. 선택 칩.

### FailSpy analog

- FailSpy/abliterator MIT. console script 없음. 팩은 analog `apply_ablation.py`. 원조 CLI를 vendor하지 않습니다.

### 기타 선택 칩 (pin-call)

abliterix AGPL `@5d58cea9` · ablate MIT `@6b89bea` · apostate MIT `@be36269d` · jwest MIT `@6ca3356` · LLM-abliterate Apache `@f01cec9` · unfetter Apache `@4c9548c` · deccp Apache `@1a6d557` · OBLITERATUS AGPL `@205d28a1`.

### LoRA / QLoRA / DPO

- 팩 `train_lora.py`. **QLoRA ≠ LoRA ≠ Heretic** VRAM. 수식은 추천 엔진이 분리합니다.
- QLoRA 7B 골든 실측은 **R-005 OPEN**.

### 양자화 · 서빙

- llama.cpp MIT `@5cdd3d1` clone. GGUF Q4/Q5/Q8, Ollama `Modelfile`, Docker compose.
- 산출: merged-bf16, adapter, GGUF, ollama, docker. 항상 `run.sh`와 `run.ps1`.

### 팩 ZIP 허용 목록

`run.sh`, `run.ps1`, 빈 Azure stub (`az-startup.sh/.ps1`, `azure-job.yml`), `docker-compose.yml`, `train_lora.py`, `eval.sh`, `Modelfile`, `heretic.args.txt`, `SYSTEM.txt`, `POWER.txt`, `POWER.en.txt`, `SFT.txt`, `eval.txt`, `job.json`, `README.txt`.

`public/reports` 없음. 키 없음.

### 실행 순서

1. 구성에서 목적 · 베이스(§1) · 방법 · 프리셋(§4) · 컴퓨트 · 저장 3열 · 산출.
2. Ctrl+S 저장, Ctrl+D ZIP.
3. GPU 머신에서 압축 해제 후 `run.sh` 또는 `run.ps1`.
4. 산출은 ARTIFACTS 열. 작업대가 바이트를 올리지 않습니다.
5. 연결 화면의 list/create는 **학습 성공이 아닙니다.**

---

## 모든 TODO 원장 (합산 금지)

코드가 읽는 파일은 `src/data/` 입니다. `npm run ledger:status`. analog IMPLEMENTED ≠ native close. 이 설명서가 칸을 닫지 않습니다.

### 01–20 native (`TODO-ROADMAP.md`)

| ID | 내용 | 상태 |
| --- | --- | --- |
| 01 | 비인증 서버 프록시 제거 | IMPLEMENTED |
| 02 | 키 자동 영구저장 금지 | analog + web Playwright. **Electron packaged OPEN** |
| 03–12, 15, 17, 19 | 저장/QA/관측/모달/타이틀바/벤치 analog | IMPLEMENTED analog |
| 13 | 설치본에 웹 자산 | analog extraResources. **native OPEN** |
| 14 | 데스크톱 외부 내비 정책 | analog unit. **desktop launch OPEN** |
| 16 | 라벨/탭/선택 a11y | analog. **E2E OPEN** |
| 18 | 헤더/폰트 페이로드 | analog blur-off. **bundle E2E OPEN** |
| 20 | 검색/복구/확인 | analog. **E2E OPEN** |

### R GPU / Hub (`TODO-WORKLOAD-SPEC-20260912.md`)

| ID | 내용 | 상태 |
| --- | --- | --- |
| R-001–R-003, R-006–R-008, R-010 | 추천 식·UI·params·RAM·골든 패치 analog | IMPLEMENTED analog |
| **R-004** | Heretic 파이프 실측 | **OPEN** — 이 머신 4B heretic 로그+VRAM |
| **R-005** | QLoRA 7B 실측 | **OPEN** |
| **R-009** | Hub 실시간 갱신 | analog 스냅샷. **in-app live OPEN** |

### W (`WORKFLOW.md`)

OPEN/IN_PROGRESS로 남는 것: **W01, W02, W06, W07, W08, W09, W11, W12, W14, W16**. W03–W05, W10, W13, W15, W17은 analog. E01–E04는 BLOCKED_EXTERNAL (GPU·계정·서명·벤치). E05 DEFERRED.

### 에코 C (`ECOSYSTEM-MASTER-TODO.md`)

| ID | 내용 | 상태 |
| --- | --- | --- |
| C-001 | SSH 사용자명 선두 `-` 거절 | IMPLEMENTED |
| **C-002–C-007** | SSH 실연결, runner 제출, 설정/비용 비교, 계약 혼동, 모니터 UI | **OPEN** |

체크박스 C-009, E-002…, A-001…, M-*, L-*, W-001 워크로드 실측은 카탈로그이지 통합 완료가 아닙니다.

외부 의존: E01 GPU, E02 유료 계정, E03 Authenticode+clean VM. 이 저장소가 대신 결제하지 않습니다.

---

## 아직 열린 것 (원장별 분석, 합산 금지)

이 설명서가 칸을 닫지 않습니다. `npm run ledger:status`. analog IMPLEMENTED ≠ native close.

### native 01–20 (`src/data/TODO-ROADMAP.md`)

| ID | 왜 열려 있나 | 닫히려면 |
| --- | --- | --- |
| 02 | 웹·analog는 키를 화면 메모리만. **패키지 Electron**에서 localStorage/디스크 0 실측이 없음 | 설치본에서 persist-reject E2E |
| 13 | extraResources analog. **소스 없는 경로**에서 설치본 기동 미완 | clean-install launch |
| 14 | URL 정책 unit analog. 데스크톱 실제 내비 런 OPEN | packaged Electron에서 정책 통과 |
| 16 | Field/Chip analog. 키보드 E2E 없음 | 실제 탭/라벨 E2E |
| 18 | blur-off analog. 번들 바이트 E2E 없음 | 네트워크/번들 측정 |
| 20 | Dialog analog. 검색/복제/복구 E2E 없음 | CRUD E2E |

01, 03–12, 15, 17, 19는 analog IMPLEMENTED. 표로 승격하지 않음.

### R (`src/data/TODO-WORKLOAD-SPEC-20260912.md`)

| ID | 왜 열려 있나 | 닫히려면 |
| --- | --- | --- |
| R-004 | Heretic 파이프 GPU 골든 없음 | 이 머신 4B heretic 로그+VRAM |
| R-005 | QLoRA 7B 실측 없음 | 1 epoch 또는 명시 skip |
| R-009 | Hub 스냅샷 analog. 앱 안 실시간 갱신 없음 | in-app live fetch |

### W (`src/data/WORKFLOW.md`)

OPEN/IN_PROGRESS: **W01** prod 저장/탭, **W02** HF 키 경계, **W06** 로그 레드액션 라이브, **W07** 패키지 데스크톱, **W08** a11y 키보드, **W09** 스텝퍼/모바일 CTA, **W11** 채점 UI, **W12** 검색/리셋 E2E, **W14** Docker 런타임, **W16** 최종 fail-closed 수용.

### C (`src/data/ECOSYSTEM-MASTER-TODO.md`)

**C-002–C-007** OPEN: SSH 실연결, runner 제출, 설정/비용 비교, 계약 혼동, 모니터 UI. **C-001과 C-008**은 닫힘. 나머지를 analog-GREEN하지 않습니다. 남은 칸은 **같이 기여**해 주십시오 — [CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md).

외부: **E01** GPU, **E02** 유료 계정, **E03** Authenticode+clean VM. 이 저장소가 대신 결제하지 않습니다.

## 이용 제한 · 기여

- 제3자 **상업 이용 금지**, **불법 이용 금지**, **악용 금지**: [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md)
- **우리 허락을 넘는 사용은 허가되지 않습니다.** **불법 이용의 책임은 그 사용자에게 있습니다** — GENOX·기여자가 아닙니다.
- 같이 기여: [CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md) — 패치·실측·리뷰. analog `npm test` ≠ 표 클로즈.
- 라이선스: [LICENSE.md](./LICENSE.md)

## 후원 · 협업 문의

작은 선물과 **협업 문의**는 창구가 다릅니다. 어느 쪽도 필수가 아닙니다. 전문: [SUPPORT.ko.md](./SUPPORT.ko.md).

선물은 지분이 아닙니다. 같이 일하고 싶으시면 `support@genox.one`. 이 페이지는 증권 공모가 아닙니다.

| 경로 | 값 |
| --- | --- |
| Binance ID | `110474712` |
| BSC (BEP-20) | `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` |

BSC만. 잘못된 체인은 복구 불가.

---

GENOX · Juno Andy Cheong · AGPL-3.0-or-later + [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md)
