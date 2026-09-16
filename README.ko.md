# Abliterater

**교육 목적.** 거절 억제(*abliteration*)를 연구·방어하고 **불법 이용을 막는 대응**을 위해 **전 세계의 관심**을 구합니다. 공격 실행 매뉴얼이 아닙니다.

영어: [README.md](./README.md)

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**기여는 환영합니다.** 제3자 **상업 이용, 불법 이용, 악용은 라이선스되지 않습니다** — [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md). PR은 AGPL-3.0-or-later **와** 그 추가 조건에 대한 부여입니다.

![Abliterater 작업대](./workbench.png)

## 하는 일

아직 abliteration되지 않은 **Instruct** 베이스를 골라 Heretic / LoRA / 양자화 **팩 ZIP**을 만들고, **본인** GPU 클라우드 키로 연결합니다.

| 화면 | 역할 |
| --- | --- |
| 작업대 (탭 `1`) | 구성 · 탐색 · 연결 |
| 연구 자료 (탭 `2`) | arXiv·GitHub 링크 (`target=_blank`) |

가중치를 호스팅하지 않습니다. GPU를 대신 빌려 주지 않습니다. `npm test` 통과는 학습 실행이 아닙니다. `:8080` analog 웹은 native Electron / GPU 골든 클로즈가 아닙니다.

## 빠른 시작

Node 24가 필요합니다.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

`http://127.0.0.1:8080/`. 기본 베이스 `Qwen/Qwen3-4B-Instruct-2507`(원본 Instruct), 방법 Heretic, 산출 merged BF16. 이미 처리된 heretic/GGUF는 **재사용 레인**이지 기본값이 아닙니다.

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

### 데스크톱

```bash
npm run electron:dev
# npm run build 다음:
npm run electron:build:win    # NSIS + portable (Windows)
npm run electron:build:linux  # AppImage (Linux 또는 CI)
npm run electron:build:mac    # DMG (macOS 또는 CI)
```

Windows NSIS는 기본 미서명입니다. SmartScreen의 **알 수 없는 게시자**는 미서명 OSS에서 정상입니다. macOS DMG는 Windows에서 만들지 않습니다.

## 문서

| 파일 | 내용 |
| --- | --- |
| [USER-GUIDE.ko.md](./USER-GUIDE.ko.md) | 설치, 화면, 작업대, 팩 ZIP, 남은 OPEN을 **원장별**로 |
| [CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md) | 패치 방법. AUP를 수용하면 PR 환영 |
| [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md) | 제3자 상업·불법·악용 금지 |
| [SUPPORT.ko.md](./SUPPORT.ko.md) | 후원(기부) vs 투자 문의 |
| [SECURITY.md](./SECURITY.md) | 취약점 신고 |
| [LICENSE.md](./LICENSE.md) | AGPL-3.0-or-later 본문 + 추가 조건 |

영어본은 각 파일 옆 `*.en.md` 입니다.

## 라이선스 (포크 전에 읽기)

이 프로젝트는 **AGPL-3.0-or-later와 추가 조건이 함께** 적용됩니다.

- 제3자는 GENOX / Juno Andy Cheong의 **서면 허가** 없이 이 소프트웨어를 **상업 이용할 수 없습니다** (`support@genox.one`).
- **불법 이용은 라이선스되지 않습니다** (아동 성착취 자료, 무기 지원, 무단 침입, 사기, 멀웨어, 제재·수출 통제 위반 등 AUP에 적힌 전부).
- **악용은 라이선스되지 않습니다** (대량 유해 콘텐츠·스캠·멀웨어·사회공학을 위한 abliteration, 안전 장치 없는 모델 살포, 타인 클라우드 과금 도용).
- AGPL 소스 공개가 그 금지를 풀어 주지 않습니다. 충돌하면 **불법·악용 금지가 항상 우선**합니다.

가중치·데이터셋·클라우드 콘솔 라이선스는 **별도**입니다. 카탈로그 행이 재배포 허가가 아닙니다.

## 기여

1. [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md)와 [CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md)를 읽습니다.
2. 포크하고 패치한 뒤 PR을 엽니다. 별도 CLA는 없습니다. PR이 같은 조건의 부여입니다.
3. API 키, `.env` 값, 연구 덤프(`docs/`)를 git·이슈·채팅에 넣지 않습니다.

AGPL 도구(heretic, OBLITERATUS, abliterix)를 `src/`에 vendor하지 않습니다. pin-call만.

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
