# Abliterater

거절 억제(*abliteration*)를 연구·측정하는 **교육용 로컬 작업대**. 연구자·방어자가 같은 파이프라인을 보고 **불법 이용을 막는 대응**을 하도록 만들었습니다. 공격 매뉴얼이 아니고, 탈검열 모델 상점도 아닙니다.

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or-later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

기여 환영. **기여했다고 제3자 상업권이 생기지는 않습니다.** 제3자 상업·불법·악용은 **라이선스되지 않습니다** — [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md).

![Abliterater 작업대](./workbench.png)

| 얻는 것 | 안 얻는 것 |
| --- | --- |
| 공식 Instruct 카탈로그 → 방법 칩 → 팩 ZIP | 이 저장소에 호스팅된 가중치 |
| HF 검색 + VRAM 추정 | jailbreak SaaS |
| *본인* 클라우드 키로 연결 (기본 dry-run) | 이 리포가 내는 GPU 요금 |
| 연구 자료 탭: 논문 / 리포 | 공격 조리법 |

기본 베이스: `Qwen/Qwen3-4B-Instruct-2507`. 기본 방법: Heretic. 이미 처리된 heretic/GGUF는 **재사용 레인**이지 기본값이 아닙니다. 브라우저는 학습하지 않습니다. ZIP은 본인 머신이나 본인 클라우드에서 실행합니다.

## 퀵 시작

Node 24.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci && npm run dev
```

`http://127.0.0.1:8080/`.

```bash
npm run typecheck && npm run lint && npm test && npm run ledger:status
```

프로덕션 웹: `npm run build` 다음 `HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs`.  
Docker: `docker compose up -d --build`.  
데스크톱: `npm run electron:dev` (패키지 Electron E2E는 아직 OPEN).

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

## 라이선스

**AGPL-3.0-or-later + 추가 조건** — [LICENSE.md](./LICENSE.md), [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md).

- GENOX / Juno Andy Cheong(`support@genox.one`)의 서면 허가 없이 제3자 상업 이용 불가.
- 불법·악용은 라이선스되지 않음. AGPL 소스 공개가 그 금지를 풀지 않음.
- PR은 *이* 프로젝트에 대한 부여입니다. **제3자 상업 허가를 만들지 않습니다.**

가중치·데이터셋·클라우드 콘솔 라이선스는 별도입니다.

## 기여

완성도는 아직 높지 않습니다. `:8080` analog 웹은 쓤 수 있습니다. 패키지 Electron, GPU 골든, 앱 안 Hub 실시간은 **OPEN**입니다. 마크다운 칸이 아니라 **증거**를 보내십시오. analog `npm test` ≠ native close.

[CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md) · [USER-GUIDE.ko.md](./USER-GUIDE.ko.md)

API 키, `.env`, `docs/` 연구 덤프를 git에 넣지 마십시오.

## 후원 · 협업

선택 선물이며 지분이 아닙니다. Binance `110474712` / BSC `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` (**BSC만**). 협업: `support@genox.one`. 증권 공모가 아닙니다. 전문: [SUPPORT.ko.md](./SUPPORT.ko.md).

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
