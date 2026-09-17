# Abliterater

**교육 목적.** 거절 억제(*abliteration*)를 연구·방어하고 **불법 이용을 막는 대응**을 위해 **전 세계의 관심**을 구합니다. 공격 실행 매뉴얼이 아닙니다.

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**완성도는 아직 높지 않습니다.** analog 웹 작업대는 쓸 수 있지만, 패키지 Electron·GPU 골든·앱 안 Hub 실시간은 아직 OPEN입니다. **기여를 진심으로 환영합니다.** 시간이 되시면 함께해 주십시오. 제3자 **상업 이용, 불법 이용, 악용은 라이선스되지 않습니다** — [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md). PR은 AGPL-3.0-or-later **와** 그 추가 조건에 대한 부여입니다.

![Abliterater 작업대](./workbench.png)

## 언어

앱 UI는 한국어/영어 토글입니다. 가장 긴 랜딩은 이 파일과 영어 [README.md](./README.md)입니다. `README.md`에는 한글이 없습니다.

| 언어 | 파일 |
| --- | --- |
| 영어 | [README.md](./README.md) |
| 한국어 | [README.ko.md](./README.ko.md) (이 파일) |
| 日本語 | [README.ja.md](./README.ja.md) |
| 简体中文 | [README.zh-Hans.md](./README.zh-Hans.md) |
| 繁體中文 | [README.zh-Hant.md](./README.zh-Hant.md) |
| Español | [README.es.md](./README.es.md) |
| Français | [README.fr.md](./README.fr.md) |
| Deutsch | [README.de.md](./README.de.md) |
| Português (Brasil) | [README.pt-BR.md](./README.pt-BR.md) |
| Русский | [README.ru.md](./README.ru.md) |
| العربية | [README.ar.md](./README.ar.md) |
| Tiếng Việt | [README.vi.md](./README.vi.md) |
| Bahasa Indonesia | [README.id.md](./README.id.md) |

설치·화면·방법·남은 OPEN: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md).

## 왜 있는가

오픈 웨이트 채팅 모델은 종종 **안전 정렬**되어 일부 요청을 거절합니다. *Abliteration*(및 유사 방법)은 그 거절이 어디에 표현되는지, 어떻게 줄이거나 되돌리는지를 연구합니다. 범죄자는 이미 그 방법을 악용합니다. 이 작업대는 **연구자·방어자·교육자**가 같은 파이프라인을 보고 측정하고 **불법 이용을 막는 대응**을 하도록 있습니다. 전 세계의 관심은 그 방어의 일부입니다. 위해·사기·멀웨어·무단 침입·무기·아동 성착취 자료의 요리책이 **아닙니다**. 그런 이용은 **라이선스되지 않으며** 범죄는 그대로 범죄입니다. [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md).

카탈로그가 출발하는 핵심 논문은 Arditi 등, *Refusal in Language Models Is Mediated by a Single Direction* ([arXiv:2406.11717](https://arxiv.org/abs/2406.11717)). 이후 비교·기하·방어 논문은 연구 자료 탭과 [USER-GUIDE.ko.md](./USER-GUIDE.ko.md)에 있습니다. 학술 jailbreak 논문(PAIR, TAP, Crescendo 등)은 **방어·이해**용 링크이지 공격 실행 매뉴얼이 아닙니다.

## 여기서 abliteration이 의미하는 것

이 제품에서 “작업”은:

1. **아직 abliteration되지 않은 공식 Instruct** 체크포인트에서 시작한다 (기본 `Qwen/Qwen3-4B-Instruct-2507`).
2. 방법을 고른다 (기본 **Heretic**: 거절 방향에 대한 TPE 최적화 직교화).
3. **팩 ZIP**을 받는다 — 핀된 git SHA의 업스트림 CLI를 **pin-call**하는 셸/PowerShell 레시피.
4. 그 스크립트를 **본인** 머신 또는 **본인** GPU 클라우드에서 실행한다. 이 앱은 브라우저에서 학습하지 않는다.

이미 처리된 heretic/GGUF는 **재사용 레인**이지 기본값이 아닙니다. 끝난 카드를 눌러도 “다시 abliterate + merged BF16”이 남으면 안 됩니다.

방법 칩을 켠다고 GPU가 시작되지 않습니다. `npm test` 통과가 학습이 아닙니다. healthy Docker가 W14 칸을 닫지 않습니다.

## 대상

- 거절 방향을 추적하고 방법을 비교하는 교육자·학생.
- 오픈 웨이트 안전이 어떻게 실패하고 어떻게 되돌리는지 측정하는 방어자.
- AUP를 수용하고 마크다운 칸이 아니라 **증거**를 보내는 기여자.

## 대상이 아닌 사람

- 탈검열 모델 상점이나 jailbreak-as-a-service를 찾는 사람.
- GENOX / Juno Andy Cheong(`support@genox.one`)의 **서면 허가** 없이 제3자 상업 재배포·SaaS로 감싸려는 사람.
- AUP에 적힌 불법·악용. AGPL 소스 공개가 그 금지를 풀어 주지 않습니다.

## 제품이 하는 일

탭 두 개만. 문서 라이브러리 없음. 저자 책 카탈로그 없음.

| 화면 | 역할 |
| --- | --- |
| 작업대 (탭 `1`) | 구성 · 탐색 · 연결 |
| 연구 자료 (탭 `2`) | arXiv abs/PDF·GitHub 링크 (`target=_blank`) |

푸터: **GENOX** · **Juno Andy Cheong** · https://github.com/genoxone20261 · [support@genox.one](mailto:support@genox.one).

기본 베이스 `Qwen/Qwen3-4B-Instruct-2507`(원본 Instruct), 방법 Heretic, 산출 merged BF16. `PRESETS[0]`는 `method-compare`(Instruct 작업), 그다음 `domain-lora`, 마지막 `local-gguf`. 프리셋 1이 heretic GGUF로 Instruct를 뒤집으면 안 됩니다.

### 구성

기본 워크스페이스. 카탈로그 칩: `work` = 공식 Instruct, `reuse` = 이미 abliteration/GGUF. Hugging Face 리포, 로컬 경로, 또는 API 베이스 URL. 빈 HF 리포는 워크플로를 **막습니다**. 목적/도메인(일반, 공학, 수학 — 수학은 ablation을 스킬로 보지 않음). 방법 칩(Heretic, Gabliteration, FailSpy analog, LoRA/QLoRA/DPO, 양자화 등). 컴퓨트 칩(`local-cuda` / `rocm` / `metal` / `cpu`, 또는 카탈로그 클라우드). 저장 세 열: **BASE WEIGHTS**, **DATASET**, **ARTIFACTS** (local / s3 / gcs / azure / hf / minio / nfs). UI는 선택을 ZIP에 기록할 뿐 바이트를 올리지 않습니다. 데이터 루트 선택은 데스크톱만.

### 탐색

추천은 관측 VRAM에 맞춰 추정합니다. VRAM 불명은 **배너 하나**이지 카드마다 도장이 아닙니다. 문헌 GiB는 **추정**이지 GPU 실행이 아닙니다. SourceHub는 모델/데이터셋 검색(허용 엔드포인트, 작업대 User-Agent). 선택은 `hfRepo` 또는 `storeDataUri`를 씁니다. SourceHub 아래 에코 행은 **링크만**. Kaggle은 컴퓨트 칩이지 SourceHub 종류가 아닙니다. 앱 안 Hub 실시간 overlay는 `lastModified` / `gated`만 보여 주고 `studio.ts` BASES를 **다시 쓰지 않습니다**. 그 overlay가 R-009를 닫지 않습니다.

### 연결

키는 **API 연결 · 인스턴스 모니터**에만 붙입니다. 보이는 비밀번호 하나(`#prov-api-key`). 토큰은 **그 화면 메모리**만. localStorage·팩·ZIP·진단에 쓰지 않습니다. RunPod / Lambda / Vast.ai의 create·stop·delete는 **본인 키**와 예산 확인 Dialog 뒤에만 (`window.confirm` 아님). 기본은 dry-run. 추가 JSON 키는 거절. 이 저장소가 대신 GPU를 만들지 않고 요금도 내지 않습니다. 목록 성공 ≠ 학습 성공 ≠ R-004 클로즈.

### 연구 자료

검색·유형 필터. 논문은 arXiv를 새 탭. 리포는 GitHub를 새 탭. 여기에서는 인앱 PDF 뷰어를 다시 마운트하지 않습니다.

## 하지 않는 일

- 가중치 호스팅·재배포. 카탈로그 행이 재배포 허가가 아닙니다. 가중치·데이터셋·클라우드 콘솔 라이선스는 **별도**.
- GPU를 대신 빌리기.
- AGPL 트리(heretic, OBLITERATUS, abliterix)를 `src/`에 vendor. pin-call만.
- 저자 KDP PDF 출하. `public/reports/`는 저자 디스크만. 공개 git·Docker·설치본에 `reports`가 있으면 안 됩니다.
- `npm test` 통과로 native / GPU / Electron 원장 클로즈. `:8080` analog 웹 ≠ native close.
- API 키를 git·ZIP·localStorage에 저장.

## 지금 할 일

할 일은 세 가지입니다. 섞지 마십시오. analog `:8080`은 쓸 수 있습니다. Native Electron, GPU 골든, 앱 안 Hub 라이브는 **닫히지 않았습니다**.

### 1. 작업대만 쓰기 (GPU 불필요)

기본 경로입니다.

1. 클론, `npm ci`, `npm run dev`, `http://127.0.0.1:8080/` (명령은 아래).
2. **작업대 → 구성**에 둡니다. 기본 칩이 공식 Instruct(`Qwen/Qwen3-4B-Instruct-2507`)인지 확인합니다. heretic GGUF가 **아닙니다**.
3. 방법을 바꾸지 않으면 **Heretic**입니다. 비교는 프리셋 1, GGUF 재사용은 프리셋 3(마지막).
4. 카탈로그를 떠나면 Hugging Face `owner/name`을 채웁니다. 빈 HF는 팩을 **막습니다**.
5. **탐색**은 선택입니다. VRAM 숫자는 **추정**입니다. 하드웨어 불명은 지원을 가장하지 않습니다. Hub에서 고르면 `hfRepo` 또는 `storeDataUri`만 씁니다. 가중치를 **받지 않습니다**.
6. 팩 ZIP을 받습니다 (**Ctrl+D**). 실행 전에 `run.sh` / `run.ps1` / `job.json`을 읽습니다.
7. 연구 자료 탭: 논문·리포는 새 브라우저 탭입니다. 읽는 것이지 GPU 런이 아닙니다.

모델을 학습한 것이 아닙니다. **레시피 ZIP**입니다.

### 2. 그 레시피를 본인 머신 또는 본인 클라우드에서 실행

브라우저가 학습하지 않습니다. 스크립트는 본인이 돌립니다.

1. ZIP을 확인합니다. AGPL 도구는 핀된 SHA에서 **pin-call**합니다. `src/`에 vendor하지 않습니다.
2. 로컬: **본인** GPU/CPU에 맞게 `local-cuda` / `rocm` / `metal` / `cpu`를 고르고, **본인** 디스크에서 `run.sh` 또는 `run.ps1`을 실행합니다.
3. 클라우드: **연결** 화면만. 비밀번호 칸 하나(`#prov-api-key`). 토큰은 그 화면 메모리만. 최대 USD/분을 넣고 Dialog를 확인합니다. **본인** 돈을 쓸 때까지 **dry-run**. 이 저장소는 요금을 내지 않습니다.
4. 인스턴스 목록은 Heretic/QLoRA 골든이 아닙니다. R-004 / R-005를 **닫지 않습니다**.
5. 실제 런 뒤에는 로그+VRAM을 남깁니다. GPU 칸이 받는 증거는 그것뿐입니다.

가중치·데이터셋·클라우드 콘솔 라이선스는 **별도**입니다. 카탈로그 행이 재배포 허가가 아닙니다.

### 3. 기여 (OPEN 칸을 닫기)

먼저 [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md)를 읽으십시오. 제3자 상업·불법·악용은 **라이선스되지 않습니다**.

1. `npm run ledger:status`를 돌립니다. 남은 OPEN은 **원장별**입니다. 한 %로 합치지 마십시오.
2. [USER-GUIDE.ko.md](./USER-GUIDE.ko.md#아직-열린-것-원장별-분석-합산-금지)에서 OPEN **한 칸**을 고릅니다.
3. 닫기 열과 맞는 **증거**를 보냅니다. analog `npm test` ≠ native close. 마크다운 칸만 뒤집지 마십시오.
4. 포크, 패치, PR. CLA 없음 — PR이 AGPL-3.0-or-later **와** AUP에 대한 허가입니다.
5. API 키, `.env` 값, `docs/` 덤프를 git·이슈·채팅에 넣지 마십시오.

| 있는 것 | 할 일 | 하지 말 것 |
| --- | --- | --- |
| 패키지 Windows/Linux/macOS 설치본 | persist-reject, 소스 없는 기동, 키보드, CRUD (02, 13, 14, 16, 18, 20) | extraResources analog를 증거로 |
| GPU와 **본인** 요금 | 이 머신 Heretic 4B / QLoRA 로그+VRAM (R-004, R-005) | 타인 렌탈 JSON |
| UI 시간 | 워크로드 칸과 맞는 앱 안 Hub overlay (R-009); 키보드 E2E (W08) | 부모 curl / 스냅샷 |
| Docker | **이 소스** `docker compose up -d --build` + product-flow (W14) | 몇 시간 된 healthy 스택 |
| SSH 박스 | 실연결, 업로드, 실행, 회수 (C-002) | list/read analog |

패치 규칙 전문: [CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md).

## 첫 세션

Node 24가 필요합니다.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

`http://127.0.0.1:8080/`.

1. 기본 칩이 공식 Instruct(`Qwen/Qwen3-4B-Instruct-2507`)인지 확인합니다. heretic GGUF가 아닙니다.
2. 방법을 바꾸지 않으면 Heretic입니다. 비교는 프리셋 1, GGUF 재사용은 프리셋 3(마지막).
3. 탐색에서 VRAM 추정을 읽습니다. 하드웨어 불명은 지원을 가장하지 않습니다.
4. 작업대에서 팩 ZIP을 받습니다 (Ctrl+D). 실행 전에 `run.sh` / `run.ps1` / `job.json`을 봅니다.
5. 클라우드를 연결하면 키는 연결 화면에만, 최대 USD/분을 넣고 Dialog를 확인합니다. **본인** 돈을 쓸 때까지 dry-run.

```bash
npm run typecheck
npm run lint
npm test
npm run ledger:status
```

`ledger:status`는 남은 OPEN을 **원장별로** 찍습니다. 한 “완성도 %”로 합치지 마십시오.

### 프로덕션 웹 (Vite 없음)

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

몇 시간 된 healthy 컨테이너는 **이 소스**의 증거가 아닙니다. `src/`를 바꾼 뒤 `--build`. product-flow URL은 **argv**입니다 (`node scripts/product-flow.mjs http://127.0.0.1:8080`). `BASE_URL`이 아닙니다.

### 데스크톱

```bash
npm run electron:dev
# npm run build 다음:
npm run electron:build:win    # NSIS + portable (Windows)
npm run electron:build:linux  # AppImage (Linux 또는 CI)
npm run electron:build:mac    # DMG (macOS 또는 CI)
```

Windows NSIS는 기본 미서명입니다. SmartScreen의 **알 수 없는 게시자**는 미서명 OSS에서 정상입니다. macOS DMG는 Windows에서 만들지 않습니다. 미서명 analog ≠ Authenticode(E03). extraResources analog ≠ 패키지 Electron persist/키보드/CRUD E2E (native 02, 13, 14, 16, 18, 20).

## 팩 ZIP (레시피이지 학습된 모델이 아님)

허용 목록만. 제품 결정 없이 PR에서 늘리지 마십시오.

| 파일 | 역할 |
| --- | --- |
| `run.sh` | POSIX 실행 |
| `run.ps1` | Windows 실행 (`run.sh`와 항상 같이) |
| `az-startup.sh` / `.ps1`, `azure-job.yml` | 컴퓨트가 Azure일 때만 내용. 아니면 빈 파일 |
| `docker-compose.yml` | 서빙/실행 레시피 |
| `train_lora.py` | LoRA/QLoRA 스크립트 (7B 골든이 아님) |
| `eval.sh` | 평가 훅 |
| `Modelfile` | Ollama/양자화 |
| `heretic.args.txt` | 핀 SHA의 Heretic CLI 인자 |
| `SYSTEM.txt` / `POWER.txt` / `POWER.en.txt` / `SFT.txt` / `eval.txt` | 프롬프트. EN UI가 한글 POWER를 영어 SYSTEM에 구우면 leftover |
| `job.json` | 선택한 소스. 검증된 provenance를 주장하지 않음 |
| `README.txt` | 팩 로컬 메모 |

컴퓨트 칩: `local-cuda`, `local-rocm`, `local-metal`, `local-cpu`. AGPL CLI는 이 스크립트에서 핀 SHA로 호출할 뿐 `src/`에 복사하지 않습니다.

## 정직

`analog IMPLEMENTED` ≠ native close. 원장 합산 금지. 라이브 덤프: `npm run ledger:status`. 칸별 이유: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md#아직-열린-것-원장별-분석-합산-금지).

| 주장 | 부족한 것 | 닫히려면 |
| --- | --- | --- |
| 웹 작업대가 된다 | Vite `:8080`, `npm test` | 여전히 analog |
| 키가 안 남는다 | 유닛 테스트 | 패키지 Electron persist-reject E2E (02) |
| extraResources 핀 | electron-builder 설정 | 소스 없는 설치 기동 (13) |
| URL 정책 | 유닛 테스트 | 패키지 내비 (14) |
| 키보드 / CRUD | Field/Dialog analog | 패키지 E2E (16, 20) |
| Heretic/QLoRA 골든 | 타인 렌탈 JSON | 이 머신 로그+VRAM (R-004, R-005) |
| Hub 실시간 | 부모 curl / 스냅샷 | 워크로드 칸과 맞는 앱 안 overlay (R-009) |
| Docker 수용 | 몇 시간 된 healthy 스택 | this-source compose + 수용 (W14) |

## 문서

| 파일 | 내용 |
| --- | --- |
| [USER-GUIDE.ko.md](./USER-GUIDE.ko.md) | 설치, 화면, 작업대, 팩 ZIP, 남은 OPEN을 **원장별**로 |
| [CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md) | 패치 방법. AUP를 수용하면 같이 기여 |
| [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md) | 제3자 상업·불법·악용 금지 |
| [SUPPORT.ko.md](./SUPPORT.ko.md) | 선택 선물 vs 협업 문의 |
| [SECURITY.md](./SECURITY.md) | 취약점 신고 |
| [LICENSE.md](./LICENSE.md) | AGPL-3.0-or-later 본문 + 추가 조건 |

영어본은 각 파일 옆 `*.en.md`. `docs/` 연구 덤프는 올리지 않습니다. 코드가 파싱하는 원장은 `src/data/`.

## 라이선스 (포크 전에 읽기)

이 프로젝트는 **AGPL-3.0-or-later와 추가 조건이 함께** 적용됩니다.

- 제3자는 GENOX / Juno Andy Cheong의 **서면 허가** 없이 이 소프트웨어를 **상업 이용할 수 없습니다** (`support@genox.one`).
- **그 허락(이 AUP와 서면 허가)을 넘는 사용은 허가되지 않습니다.** AGPL 소스 공개가 그 이용을 허가하지 않습니다.
- **불법 이용은 라이선스되지 않습니다** (아동 성착취 자료, 무기 지원, 무단 침입, 사기, 멀웨어, 제재·수출 통제 위반 등 AUP에 적힌 전부).
- **악용은 라이선스되지 않습니다** (대량 유해 콘텐츠·스캠·멀웨어·사회공학을 위한 abliteration, 안전 장치 없는 모델 살포, 타인 클라우드 과금 도용).
- **이 소프트웨어 또는 그것으로 만든 모델·가중치·LoRA/GGUF·산출물을 법률에 어긋나게 쓰는 것은 불법이며, 그 책임은 그 사용자에게 있습니다.** 저작권자는 그런 이용을 허가하지 않으며 그 결과에 책임지지 않습니다.
- AGPL 소스 공개가 그 금지를 풀어 주지 않습니다. 충돌하면 **불법·악용 금지가 항상 우선**합니다.

가중치·데이터셋·클라우드 콘솔 라이선스는 **별도**입니다. 카탈로그 행이 재배포 허가가 아닙니다.

## 같이 기여합시다

이 작업대는 **끝나지 않았고, 완성도는 아직 높지 않습니다.** `:8080` analog 웹은 쓸 수 있습니다. Native Electron, GPU 골든, 앱 안 Hub 실시간은 **OPEN**입니다. 패치·실측·리뷰·문서로 함께 고쳐 주시면 감사하겠습니다.

**같이 기여해 주시면 고맙겠습니다.** 제3자 상업·불법·악용은 그대로 **라이선스되지 않습니다.**

1. [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md)와 [CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md)를 읽습니다.
2. OPEN 칸을 고릅니다. **증거**를 보냅니다. 마크다운 칸만 올리지 않습니다. analog `npm test` ≠ native close.
3. 포크 → 패치 → PR. 별도 CLA 없음. PR은 AGPL-3.0-or-later **와** AUP 부여입니다.
4. API 키, `.env` 값, 연구 덤프(`docs/`)를 git·이슈·채팅에 넣지 않습니다.

실제로 필요한 도움 (원장별 — **합산 금지**). 닫힘 조건: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md#아직-열린-것-원장별-분석-합산-금지).

| 같이 할 일 | OPEN | 닫히려면 | 부족한 것 |
| --- | --- | --- | --- |
| 패키지 Electron E2E | 02, 13, 14, 16, 18, 20 | 설치본 persist / 기동 / 키보드 / CRUD | extraResources analog |
| *본인* 머신의 GPU 골든 | R-004, R-005 | 이 머신 Heretic 4B / QLoRA 로그+VRAM | 타인 렌탈 JSON |
| 앱 안 Hub 실시간 | R-009 | 워크로드 칸과 맞는 overlay | 부모 curl / 스냅샷 |
| 프로덕션 / Docker / a11y | W01, W08, W14, W16 | this-source compose + 키보드 | 몇 시간 된 healthy 스택 |
| SSH / 동일 워크로드 비용 | C-002 … C-007 | 실연결, 인용된 $ | list/read analog |
| 문서·i18n | — | EN 화면 한글 leftover, 첫 실행 | 설명서 analog-GREEN |

AGPL 도구(heretic, OBLITERATUS, abliterix)를 `src/`에 vendor하지 않습니다. pin-call만. `git add -A` 금지. 이 저장소가 클라우드 요금을 대신 내지 않습니다.

## 계정 연결 (본인 키)

키는 **API 연결 · 인스턴스 모니터** 화면 메모리에만 붙입니다. localStorage·팩·ZIP·진단에 쓰지 않습니다. 공식 문서는 앱 안에서 링크됩니다.

RunPod / Lambda / Vast.ai의 create·stop은 **본인 키**와 예산 확인 뒤에만. 이 저장소가 대신 GPU를 만들지 않습니다. 목록 성공 ≠ 학습 성공.

GitHub 이슈에 키를 붙이지 마십시오. `.env`는 gitignore. `.env.example`은 주석만.

## 상태 (완료 아님)

**완성도는 아직 높지 않습니다.** Vite `:8080` analog 웹은 쓸 수 있습니다. **Native / live / GPU 골든은 닫히지 않았습니다.** `analog IMPLEMENTED` ≠ native close. 그래서 출하라고 하지 않고 기여를 청합니다. 원장별 이유: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md). 라이브 덤프: `npm run ledger:status`.

| 원장 | 아직 OPEN |
| --- | --- |
| 01–20 native | 02, 13, 14, 16, 18, 20 |
| R GPU | R-004, R-005 |
| R in-app Hub live | R-009 |
| W 표 | W01, W02, W06, W07, W08, W09, W11, W12, W14, W16 |
| 에코 표 | C-002 … C-007 |

이 README의 레시피가 GPU 골든을 닫지 않습니다.

## 감사의 말

이 작업대가 pin-call하거나 인용하는 모든 저장소·논문의 저자와 유지보수자에게 **감사합니다.** 라이선스는 그들 것입니다. AGPL/GPL 트리를 `src/`에 vendor하지 않습니다. 전체 표: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md#감사의-말--리포지토리).

| 저자 / 조직 | 저장소 |
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
| ricyoung | [abliteration-comparison](https://github.com/ricyoung/abliteration-comparison) (인용만) |

논문 저자 — Arditi, Obeso, Syed, Paleka, Panickssery, Gurnee, Nanda; Young; Fafuła; Gülmez; 그리고 사용 설명서 논문 표의 전원 — 감사합니다. 학술 jailbreak 논문은 **방어·이해**용 링크이지 공격 실행 매뉴얼이 아닙니다.

## 후원 · 협업 문의

소프트웨어는 그대로 쓰셔도 됩니다. 선물이나 메일은 **필수가 아닙니다.** 전문: [SUPPORT.ko.md](./SUPPORT.ko.md).

**작은 선물 (선택)** — 이 작업이 도움이 되어 컴퓨트 한 줌을 보태고 싶으시면 감사히 받겠습니다. 지분이 아닙니다. 부담 갖지 않으셔도 됩니다.

| 경로 | 값 |
| --- | --- |
| Binance ID | `110474712` |
| BSC (BEP-20) | `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` |

보내실 때는 BSC만. 잘못된 체인은 복구 불가.

**협업 문의** — 같이 일하고 싶으시면 편하실 때 `support@genox.one`으로 적어 주십시오. 증권 공모가 아닙니다. 선물 주소로 보낸 돈은 지분이 되지 않습니다.

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
