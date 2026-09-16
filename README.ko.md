# Abliterater

**교육 목적.** 거절 억제(abliteration)를 연구·방어하고 **불법 이용을 막는 대응**을 위해 **전 세계의 관심**을 구합니다. 공격 실행 매뉴얼이 아닙니다.

영어 README: [README.md](./README.md).

아직 abliteration되지 않은 Instruct 베이스를 골라 Heretic / LoRA / 양자화 **팩 ZIP**을 만들고, **본인** GPU 클라우드 키로 연결하는 작업대입니다.

가중치를 호스팅하지 않습니다. GPU를 대신 빌려 주지 않습니다. `npm test` 통과는 학습 실행이 아닙니다.

## 빠른 시작

```bash
npm install
npm run dev
```

`http://127.0.0.1:8080/`. 기본 베이스 `Qwen/Qwen3-4B-Instruct-2507`(원본 Instruct), 방법 Heretic, 산출 merged BF16. 이미 처리된 heretic/GGUF는 재사용 레인입니다.

데스크톱: `npm run electron:dev`. 팩은 `npm run build` 다음:

```bash
npm run electron:build:win    # NSIS + portable (Windows)
npm run electron:build:linux  # AppImage (Linux 또는 CI)
npm run electron:build:mac    # DMG (macOS 또는 CI)
```

Windows NSIS는 기본 미서명입니다. macOS DMG는 Windows에서 만들지 않습니다.

## 상태 (완료 아님)

Vite `:8080` analog 웹은 쓸 수 있습니다. **Native / live / GPU 골든은 닫히지 않았습니다.**

| 원장 | 아직 OPEN |
| --- | --- |
| 01–20 native | 02, 13, 14, 16, 18, 20 |
| R GPU | R-004, R-005 |
| R in-app Hub live | R-009 |
| W 표 | W01, W02, W06, W07, W08, W09, W11, W12, W14, W16 |
| 에코 표 | C-002 … C-007 |

`analog IMPLEMENTED` ≠ native close. 이 README의 레시피가 GPU 골든을 닫지 않습니다. 왜 열려 있는지는 [USER-GUIDE.ko.md](./USER-GUIDE.ko.md)에 원장별로 적었습니다.

라이브 원장: `npm run ledger:status`.

## 배포

```bash
npm ci
npm run build
HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs
```

```bash
docker compose up -d --build
# http://127.0.0.1:8080/
```

GitHub Actions는 push에 `npm test`, 태그/`workflow_dispatch`에 패키징. 바이너리는 **Release**이지 git이 아닙니다.

## 라이선스

**AGPL-3.0-or-later**와 추가 조건이 **함께** 적용됩니다.

- [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md)
- 제3자는 GENOX / Juno Andy Cheong의 서면 허가 없이 **상업 이용 불가**
- **불법·악용 금지**
- 본문: `LICENSE.md`

사용 설명서: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md)  
기여: [CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md)  
후원·투자: [SUPPORT.ko.md](./SUPPORT.ko.md)

## 계정 연결 (다른 사용자)

클론 후 `npm install`, `npm run dev`(웹) 또는 `npm run electron:dev`(데스크톱).

키는 **API 연결 · 인스턴스 모니터** 화면 메모리에만 붙입니다. localStorage/팩/ZIP/진단에 쓰지 않습니다. 이 저장소에 개인 Azure/크레딧 가정은 없습니다.

RunPod / Lambda / Vast.ai의 create·stop은 **본인 키**와 예산 확인 뒤에만. 목록 성공 ≠ 학습 성공.

## Windows 설치본 (미서명)

기본 미서명입니다. 코드사인 인증서를 사지 않아도 빌드됩니다. SmartScreen의 ‘알 수 없는 게시자’는 미서명 OSS에서 정상입니다. E03(clean VM + Authenticode)은 그대로 OPEN입니다.

## 라이선스 매트릭스

| 라이선스 | 저장소 | 비고 |
| --- | --- | --- |
| AGPL | heretic, OBLITERATUS, abliterix | subprocess 호출만, vendor 금지 |
| MIT | FailSpy, gabliteration, apostate, ablate, jwest, AUGMXNT, llama.cpp | — |
| Apache-2.0 | refusal_direction, nanofatdog, model-unfetter, kimi-k3 | — |
| NONE | ricyoung | 인용만 |

## 후원 · 투자

자발적 **후원**(기부)과 GENOX **투자 문의**는 [SUPPORT.ko.md](./SUPPORT.ko.md)에 창구가 나뉘어 있습니다. 후원 주소로 보낸 돈은 지분이 되지 않습니다.

| 경로 | 값 |
| --- | --- |
| Binance ID | `110474712` |
| BSC (BEP-20) | `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` |

BSC만. 잘못된 체인은 복구 불가. 투자 논의: `support@genox.one`.
