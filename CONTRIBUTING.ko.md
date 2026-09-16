# Abliterater 기여 가이드

한 줄: 패치는 환영합니다. 키·연구 덤프·KDP PDF는 올리지 마십시오. 제3자 상업 이용과 불법·악용은 [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md)로 금지입니다.

이 저장소는 **교육용**이며, 불법 이용을 막는 대응을 위해 **전 세계의 관심**을 구합니다.

영어본: [CONTRIBUTING.en.md](./CONTRIBUTING.en.md). 사용법: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md). 후원·투자: [SUPPORT.ko.md](./SUPPORT.ko.md).

---

## 시작 전에

1. [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md)를 읽고 수용한다.
2. AGPL-3.0-or-later **와** 그 추가 조건에 기여한다. 별도 CLA는 없다. PR은 같은 조건의 라이선스 부여이다.
3. 시크릿을 이슈·로그·커밋에 넣지 않는다. `.env`는 gitignore. `.env.example`은 주석만.

저작권자 연락: support@genox.one · GENOX · Juno Andy Cheong · https://github.com/genoxone20261

---

## 로컬

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run ledger:status
```

- Node 24. `npx`로 tsx를 받지 않는다. 로컬 `node_modules/tsx`.
- `npm run format`(prettier --write)는 트리를 바꾼다. 요청 없이 돌리지 않는다.
- analog `npm test` 통과 ≠ native Electron persist / GPU 골든 클로즈. 원장 OPEN 칸을 테스트만으로 올리지 않는다.

---

## 올리면 안 되는 것

| 경로 | 이유 |
| --- | --- |
| `docs/` 전체 | 세션 연구·감사 덤프. 공개 git 금지 |
| `public/reports/` | 저자 KDP PDF. 디스크만 |
| `.env`, Vast/connection-list JSON, 키 파일 | 자격 증명 |
| `electron/release*`, `win-unpacked` | 바이너리. Release 자산만 |
| `node_modules`, `.vercel`, `.hermes` | 생성물 |
| AGPL 도구 소스 트리 통째 (`heretic`, OBLITERATUS, abliterix) | pin-call만. vendor 금지 |

제품 원장(코드가 파싱)은 `src/data/` 이다. `docs/maximum-completion/`로 되돌리지 않는다.

---

## 패치 규칙

- 탭은 **작업대(1)** / **연구 자료(2)** 만. KDP/문서 라이브러리 탭을 만들지 않는다.
- `DEFAULT_STATE.base`는 `qwen3-4b` (`Qwen/Qwen3-4B-Instruct-2507`). `PRESETS[0]`는 `method-compare`. heretic GGUF를 기본으로 두지 않는다.
- i18n: ko/en 키 대칭. 하드코딩 한글을 EN 화면에 남기지 않는다.
- 키는 화면 메모리만. localStorage/ZIP/진단에 쓰지 않는다.
- PACK ZIP 파일 목록을 임의로 늘리지 않는다 (`run.sh`/`run.ps1` 등 허용 목록).
- 원장 표 OPEN을 analog IMPLEMENTED로 승격하지 않는다. 합산하지 않는다.
- 라이선스: MIT/Apache/BSD만 읽고 포팅. SUL/fair-code는 vendor 금지. SPDX 추측 금지.

커밋 메시지 예: 무엇을 바꿨는지 한 줄. `git add -A` 금지.

---

## PR 체크

- [ ] `npm run typecheck` · `lint` · `test` 0
- [ ] 시크릿 스캔 (실키 0)
- [ ] 원장 칸을 증거 없이 바꾸지 않음
- [ ] ACCEPTABLE-USE 수용
- [ ] 신규 UI는 ko/en

CI는 `.github/workflows/ci.yml`이다. 패키지 바이너리는 태그/`workflow_dispatch`의 Release다.

---

## 보안 이슈

공개 이슈에 키·개인정보를 붙이지 마십시오. `support@genox.one`.
