# Abliterater

**교육 목적**의 로컬 작업대입니다. 거절 억제(*abliteration*)를 연구·측정하고, 연구자·방어자가 **불법 이용을 막는 대응**을 할 수 있게 만들었습니다. 그 목적은 **전 세계의 관심**이 필요합니다.

공격 매뉴얼이 아니고, 탈검열 모델 상점도 아닙니다.

[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**완성도는 아직 높지 않습니다.** analog 웹 작업대는 쓤 수 있습니다. 패키지 Electron, GPU 골든, 앱 안 Hub 실시간은 아직 OPEN입니다. **같이 기여**해 주십시오. 기여했다고 제3자 상업권이 생기지는 않습니다. 제3자 상업·불법·악용은 **라이선스되지 않습니다** — [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md).

<p align="center">
  <img src="./workbench.png" alt="Abliterater 작업대" width="900" />
</p>

| 얻는 것 | 안 얻는 것 |
| --- | --- |
| 공식 Instruct 카탈로그 → 방법 칩 → 팩 ZIP | 이 저장소에 호스팅된 가중치 |
| Hugging Face 검색 + VRAM 추정 | jailbreak SaaS |
| *본인* 클라우드 키로 연결 (기본 dry-run) | 이 리포가 내는 GPU 요금 |
| 연구 자료 탭: 논문·리포 | 공격 조리법 |

기본 베이스: `Qwen/Qwen3-4B-Instruct-2507`. 기본 방법: Heretic. 이미 처리된 heretic/GGUF는 **재사용 레인**이지 기본값이 아닙니다. 브라우저는 학습하지 않습니다. ZIP은 본인 머신이나 본인 클라우드에서 실행합니다.

## 퀵 시작

**Node 24**와 npm이 필요합니다. 그다음 `http://127.0.0.1:8080/`을 엽니다.

### Windows (PowerShell)

```powershell
git clone https://github.com/genoxone20261/Abliterater.git
cd Abliterater
npm ci
npm run dev
```

팩 스크립트: `run.ps1`. 데스크톱 미리보기: `npm run electron:dev`. Windows 설치 파일(미서명 NSIS + portable):

```powershell
npm run build
npm run electron:build:win
```

SmartScreen이 **Unknown publisher**를 볼 수 있습니다. 미서명 빌드에서는 예상된 표시입니다.

### macOS (터미널)

```bash
git clone https://github.com/genoxone20261/Abliterater.git
cd Abliterater
npm ci
npm run dev
```

Apple GPU는 `local-metal` 칩을 고른 뒤 ZIP의 `run.sh`를 실행합니다. 데스크톱 미리보기: `npm run electron:dev`. DMG는 macOS 또는 CI에서 만듭니다.

```bash
npm run build
npm run electron:build:mac
```

### Linux (bash)

```bash
git clone https://github.com/genoxone20261/Abliterater.git
cd Abliterater
npm ci
npm run dev
```

팩 스크립트: `run.sh`. CUDA / ROCm / CPU: `local-cuda`, `local-rocm`, `local-cpu`. 데스크톱 미리보기: `npm run electron:dev`. AppImage(Linux 호스트 또는 CI):

```bash
npm run build
npm run electron:build:linux
```

Docker (Docker Engine이 있는 모든 OS):

```bash
docker compose up -d --build
# http://127.0.0.1:8080/
```

모든 OS에서 검사:

```bash
npm run typecheck && npm run lint && npm test && npm run ledger:status
```

프로덕션 웹(Vite 없음): `npm run build` 다음 `HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs`.

설치·화면·방법·남은 OPEN: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md).

## 언어

앱 UI는 한국어/영어 토글입니다. 나머지 README는 랜딩이지 추가 UI 로케일이 아닙니다.

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

## 왜 있는가

오픈 웨이트 채팅 모델은 종종 일부 요청을 거절합니다. Abliteration은 그 거절이 어디에 표현되는지, 어떻게 줄이거나 되돌릴 수 있는지를 연구합니다. 범죄자는 이미 그 방법을 악용합니다. 이 작업대는 **연구자·방어자·교육자**가 같은 파이프라인을 보고 불법 이용에 대응하도록 있습니다.

출발 논문: Arditi 등, *Refusal in Language Models Is Mediated by a Single Direction* ([arXiv:2406.11717](https://arxiv.org/abs/2406.11717)). 연구 자료 탭의 학술 jailbreak 논문은 **방어·이해**용이지 공격 매뉴얼이 아닙니다.

## 여기서 abliteration이 의미하는 것

1. 공식 Instruct 기반 체크포인트로 시작 (기본 `Qwen/Qwen3-4B-Instruct-2507`).
2. 방법 선택 (기본 Heretic).
3. pin-call 스크립트가 든 팩 ZIP 다운로드.
4. **본인** 머신 또는 **본인** GPU 클라우드에서 실행. 브라우저는 학습하지 않습니다.

## 지금 할 일

세 가지를 섞지 마십시오.

1. `:8080` analog 작업대를 쓤 것 (GPU 불필요).
2. ZIP을 본인 머신 또는 본인 클라우드에서 돌릴 것.
3. 기여: OPEN 원장 한 줄에 대한 **증거**를 보내실 것. analog `npm test` ≠ native close.

## 첫 세션

클론, `npm ci`, `npm run dev`, `http://127.0.0.1:8080/` 을 엽니다.

기본 칩이 공식 Instruct인지 확인하십시오. 팩 ZIP을 받은 뒤 `run.sh` / `run.ps1` / `job.json`을 읽고 실행하십시오.

## 라이선스

**AGPL-3.0-or-later + 추가 조건** — [LICENSE.md](./LICENSE.md), [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md).

- GENOX / Juno Andy Cheong(`support@genox.one`)의 서면 허가 없이 제3자 상업 이용 불가.
- 불법·악용은 라이선스되지 않음. AGPL 소스 공개가 그 금지를 풀지 않음.
- PR은 *이* 프로젝트에 대한 부여입니다. **제3자 상업 허가를 만들지 않습니다.**
- 이 소프트웨어, 또는 그것으로 만든 모델·산출물을 법률에 어긋나게 쓰면 불법이며, **그 책임은 그 사용자에게 있습니다.**

가중치·데이터셋·클라우드 콘솔 라이선스는 별도입니다.

## 같이 기여

완성도는 아직 높지 않습니다. `:8080` analog 웹은 쓤 수 있습니다. 패키지 Electron, GPU 골든, 앱 안 Hub 실시간은 **OPEN**입니다. 마크다운 칸이 아니라 **증거**를 보내십시오. analog `npm test` ≠ native close.

[CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md) · [USER-GUIDE.ko.md](./USER-GUIDE.ko.md)

API 키, `.env`, `docs/` 연구 덤프를 git에 넣지 마십시오.

## 후원 · 협업

작업대는 그대로 쓰셔도 됩니다. 그래도 도움이 되어 컴퓨트 선물을 보내고 싶으시면 감사히 받겠습니다. 선물은 선택이며 지분·상품·의결권이 아닙니다. 부담 갖지 않으셔도 됩니다.

| 경로 | 값 |
| --- | --- |
| Binance ID | `110474712` |
| BNB Smart Chain (BEP-20) | `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` |

보내실 때는 **BSC(BEP-20)만** 부탁드립니다. 다른 체인으로 보내면 복구할 수 없습니다. 보내 주셔도 고맙고, 안 보내 주셔도 같이 고맙습니다.

같이 일하고 싶으시면 편할 때 `support@genox.one`으로 적어 주십시오. 증권 공모가 아닙니다. 전문: [SUPPORT.ko.md](./SUPPORT.ko.md).

## 감사의 말

핀호출한 도구와 인용 논문의 저자·유지보수에게 **감사합니다.** AGPL/GPL 트리를 `src/`에 vendor하지 않습니다.

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
