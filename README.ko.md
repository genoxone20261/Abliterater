# Abliterater

**교육 목적.** 거절 억제(*abliteration*)를 연구·방어하고 **불법 이용을 막는 대응**을 위해 **전 세계의 관심**을 구합니다. 공격 실행 매뉴얼이 아닙니다.

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**기여는 환영합니다.** 제3자 **상업 이용, 불법 이용, 악용은 라이선스되지 않습니다** — [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md). PR은 AGPL-3.0-or-later **와** 그 추가 조건에 대한 부여입니다.

![Abliterater 작업대](./workbench.png)

## 언어

앱 UI는 한국어/영어 토글입니다. 아래는 랜딩 README입니다.

| 언어 | 파일 |
| --- | --- |
| 영어 | [README.md](./README.md) (한글 없음) |
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

설치·남은 OPEN: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md).

## 하는 일

아직 abliteration되지 않은 **Instruct** 베이스를 골라 Heretic / LoRA / 양자화 **팩 ZIP**을 만들고, **본인** GPU 클라우드 키로 연결합니다.

| 화면 | 역할 |
| --- | --- |
| 작업대 (탭 `1`) | 구성 · 탐색 · 연결 |
| 연구 자료 (탭 `2`) | arXiv·GitHub 링크 (`target=_blank`) |

기본 베이스 `Qwen/Qwen3-4B-Instruct-2507`(원본 Instruct), 방법 Heretic, 산출 merged BF16. 이미 처리된 heretic/GGUF는 **재사용 레인**이지 기본값이 아닙니다. `PRESETS[0]`는 `method-compare`(Instruct 작업), 그다음 `domain-lora`, 마지막 `local-gguf`.

구성에는 카탈로그 칩과 프리셋. 탐색에는 추천과 SourceHub. 연결은 **본인** 키를 화면 메모리에만.

## 하지 않는 일

- 가중치 호스팅·재배포.
- GPU를 대신 빌리기. 인스턴스 목록 ≠ 학습 실행.
- AGPL 트리(heretic, OBLITERATUS, abliterix)를 `src/`에 vendor. pin-call만.
- 저자 KDP PDF 출하. `public/reports/`는 저자 디스크만.
- `npm test` 통과로 native / GPU / Electron 원장 클로즈. `:8080` analog 웹 ≠ native close.

## 팩 ZIP

다운로드는 레시피이지 학습된 모델이 아닙니다. 허용 목록만:

`run.sh`, `run.ps1`, 빈 Azure stub, `docker-compose.yml`, `train_lora.py`, `eval.sh`, `Modelfile`, `heretic.args.txt`, `SYSTEM.txt`, `POWER.txt`, `POWER.en.txt`, `SFT.txt`, `eval.txt`, `job.json`, `README.txt`.

항상 `run.sh`와 `run.ps1` 둘 다. 컴퓨트 칩: `local-cuda`, `local-rocm`, `local-metal`, `local-cpu`.

## 정직

`analog IMPLEMENTED` ≠ native close. 원장 합산 금지. 라이브 덤프: `npm run ledger:status`. 칸별 이유: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md#아직-열린-것-원장별-분석-합산-금지).

## 빠른 시작

Node 24가 필요합니다.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

`http://127.0.0.1:8080/`.

```bash
npm run typecheck
npm run lint
npm test
npm run ledger:status
```

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

몇 시간 된 healthy 컨테이너는 **이 소스**의 증거가 아닙니다. `src/`를 바꾼 뒤 `--build`.

### 데스크톱

```bash
npm run electron:dev
# npm run build 다음:
npm run electron:build:win    # NSIS + portable (Windows)
npm run electron:build:linux  # AppImage (Linux 또는 CI)
npm run electron:build:mac    # DMG (macOS 또는 CI)
```

Windows NSIS는 기본 미서명입니다. SmartScreen의 **알 수 없는 게시자**는 미서명 OSS에서 정상입니다. macOS DMG는 Windows에서 만들지 않습니다. 미서명 analog ≠ Authenticode(E03).

## 문서

| 파일 | 내용 |
| --- | --- |
| [USER-GUIDE.ko.md](./USER-GUIDE.ko.md) | 설치, 화면, 작업대, 팩 ZIP, 남은 OPEN을 **원장별**로 |
| [CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md) | 패치 방법. AUP를 수용하면 같이 기여 |
| [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md) | 제3자 상업·불법·악용 금지 |
| [SUPPORT.ko.md](./SUPPORT.ko.md) | 후원(기부) vs 투자 문의 |
| [SECURITY.md](./SECURITY.md) | 취약점 신고 |
| [LICENSE.md](./LICENSE.md) | AGPL-3.0-or-later 본문 + 추가 조건 |

영어본은 각 파일 옆 `*.en.md`. `docs/` 연구 덤프는 올리지 않습니다.

## 라이선스 (포크 전에 읽기)

이 프로젝트는 **AGPL-3.0-or-later와 추가 조건이 함께** 적용됩니다.

- 제3자는 GENOX / Juno Andy Cheong의 **서면 허가** 없이 이 소프트웨어를 **상업 이용할 수 없습니다** (`support@genox.one`).
- **불법 이용은 라이선스되지 않습니다** (아동 성착취 자료, 무기 지원, 무단 침입, 사기, 멀웨어, 제재·수출 통제 위반 등 AUP에 적힌 전부).
- **악용은 라이선스되지 않습니다** (대량 유해 콘텐츠·스캠·멀웨어·사회공학을 위한 abliteration, 안전 장치 없는 모델 살포, 타인 클라우드 과금 도용).
- AGPL 소스 공개가 그 금지를 풀어 주지 않습니다. 충돌하면 **불법·악용 금지가 항상 우선**합니다.

가중치·데이터셋·클라우드 콘솔 라이선스는 **별도**입니다. 카탈로그 행이 재배포 허가가 아닙니다.

## 같이 기여합시다

이 작업대는 **끝나지 않았습니다.** `:8080` analog 웹은 쓸 수 있습니다. Native Electron, GPU 골든, 앱 안 Hub 실시간은 **OPEN**입니다. 패치·실측·리뷰·모든 언어 문서를 **같이** 개선하고 싶습니다.

**기여는 환영합니다.** 제3자 상업·불법·악용은 그대로 **라이선스되지 않습니다.**

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

Vite `:8080` analog 웹은 쓸 수 있습니다. **Native / live / GPU 골든은 닫히지 않았습니다.** `analog IMPLEMENTED` ≠ native close. 원장별 이유: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md). 라이브 덤프: `npm run ledger:status`.

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

## 후원 · 투자

창구 두 개. 소프트웨어 사용에 필수가 아닙니다. 전문: [SUPPORT.ko.md](./SUPPORT.ko.md).

**후원(기부)** — 선물이지 지분이 아닙니다.

| 경로 | 값 |
| --- | --- |
| Binance ID | `110474712` |
| BSC (BEP-20) | `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` |

BSC만. 잘못된 체인은 복구 불가.

**투자 문의** — GENOX 투자 논의는 `support@genox.one`. 증권 공모가 아닙니다. 후원 주소로 보낸 돈은 지분이 되지 않습니다.

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
