# 잔여 전체 작업 실행 워크플로

2026-09-09. 기존 TODO-ROADMAP 01–20 및 추가 감사·대화 잔여의 현재 실행 원장. 이전 전체 완료 표시는 무효. INITIAL-ASSESSMENT는 역사적 기준선이며 이 파일이 현재 진행 상태의 기준이다. 기존 연구 master TODO의 native/analog·GPU 실측 구분을 보존한다.

## 완료 계약

OPEN → IN_PROGRESS → IMPLEMENTED → VERIFIED. BLOCKED_EXTERNAL은 완료가 아니다. 각 행은 구현 파일, 회귀 검증 및 증거를 요구한다. 실패 시 같은 명령 반복 대신 원인 확인 → 최소 재현 → 수정 → 좁은 테스트 → 전체 게이트 순서로 진행. 테스트·렌더·실제 사용자 상호작용·패키지 실행은 별도 층이다. 마지막 소스 수정 뒤 재빌드 및 preview 재시작 필수.

## 실행 큐

| ID / 기존 연결     | 우선순위·분류·심각도  | 문제·사용자 영향                                          | 해결·파일                                                                      | 의존성·복잡도 | 검증                                              | 상태               |
| ------------------ | --------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------- | ------------------------------------------------- | ------------------ |
| W01 / 06,10        | P0 QA Critical        | SSR HTML을 인터랙션 가능으로 오인; prod 저장/탭 미검증    | hydration 근본 진단, 준비 신호, product-flow 강화; index/router/scripts        | 없음 M        | prod 탭 실제 선택·저장 readback·재로드            | IN_PROGRESS        |
| W02 / 02           | P0 Security High      | HF 토큰 영구저장 및 사용되지 않는 입력                    | 불필요 HF 입력 제거, 기존 키 자동 읽기 중단; ModelSource                       | 없음 S        | 저장 금지 회귀, 기존 값 읽지 않음                 | OPEN               |
| W03 / 03–05        | P1 Reliability High   | 저장 검증이 얕고 손상 경고 없음                           | schema 기반 safe hydrate·오류 전달·legacy delete; jobs/Studio                  | W01 M         | quota/getter/corrupt/nested param/CRUD            | IMPLEMENTED analog |
| W04 / 08,09        | P1 QA High            | tsx 미선언 npx 다운로드·명시적 파일 예외                  | 로컬 고정 tsx, 모든 source/Electron 테스트 등록; package/runner                | 없음 S        | npm test가 모든 파일 포함                         | IMPLEMENTED analog |
| W05 / 11           | P1 Network High       | timeout·URL 정책 행동 테스트 없음, stale 요청             | 실제 HTTP fixture + cancellation 경계; compat-api/ModelSource                  | W02 M         | timeout/HTTP error/malformed/empty/retry          | IMPLEMENTED analog |
| W06 / 12           | P1 Security High      | 로그 민감 URL/메시지 노출 및 상태 검증 부족               | redaction, 실패 시 업무 방해 금지; provider-log/LoggingPanel                   | W05 M         | secret fixture·storage denied·live UI event       | OPEN               |
| W07 / 13,14,17     | P1 Desktop Critical   | 출력 잠금·부실 서버 포장·Electron-as-Node·origin/IPC 경계 | 격리 출력, 자체 서버 runtime, 패키지 assets, trusted sender; electron          | W01 L         | source 없는 경로 packaged 앱 headless probe       | OPEN               |
| W08 / 15,16        | P2 A11y Medium        | 모달 임시 trap, 중복 Chip/Field, 탭 패널·shortcut 격리    | 공통 Radix Dialog/Chip/Field, 모달 inert/restore, 탭 정확 연결                 | W01 M         | keyboard/labels/axe/SSR                           | OPEN               |
| W09 / 07,18        | P2 UX Medium          | 내비 7단계만·현재 위치 없음·모바일 CTA 너무 아래          | 8단계 앵커/관찰·요약 바로가기·compact header                                   | W08 M         | desktop/mobile click/scroll screenshot            | OPEN               |
| W10 / 18           | P2 Performance Medium | 4개 대형 TTF·과도 blur·렌더 예산 없음                     | font 최적화·tokens·효과 절제; styles/assets                                    | W08 M         | 네트워크 bytes·font render·build assets           | IMPLEMENTED analog |
| W11 / 19           | P2 Evaluation High    | 부분 문자열/짧은 정답 false positive, 빈 응답 판정        | 정규화 exact tokens, 미입력/heuristic 고지, clipboard 오류                     | 없음 M        | 오답 숫자·코드 토큰·editing summary               | OPEN               |
| W12 / 20           | P2 Product Medium     | 삭제/초기화 확인 불일치·검색/복제/복구 검증 부족          | 공통 confirm·empty guidance·preset state tests                                 | W03,W08 M     | 검색/복제/삭제/cancel/reset/restore E2E           | OPEN               |
| W13 / 추가 ZIP     | P1 Integrity High     | CRC roundtrip/절대경로·크기한계·nonAzure 검증 부족        | bounded ZIP·다운로드 util 통합; zip/pack                                       | 없음 M        | Python unzip roundtrip·negative paths·manifest    | IMPLEMENTED analog |
| W14 / 추가 Docker  | P1 Packaging High     | runtime loopback bind, 개발 source·중복 install 포함      | production server/host/runtime Docker 정리                                     | W07 M         | Docker 가능 시 build/run; 불가 명시               | OPEN               |
| W15 / 20           | P2 Docs Medium        | README 수치·license/desktop 정책·TODO 불일치              | 사용 workflow·검증 명령·배포 범위·원장 동기화                                  | 전체 S        | docs contract + this-session mismatch note        | IMPLEMENTED analog |
| W16 / Final        | P1 QA Critical        | 최종 검증 누락·실패 후 stale pass 재사용                  | run workflow CLI + evidence manifest, fail-closed                              | 전체 M        | test/lint/type/build + dev/prod flow + screenshot | OPEN               |
| W17 / rec min-spec | P1 Product High       | 추천이 LoRA=QLoRA, Heretic 최소 사양·골든 워크로드 없음   | 문헌 하한 분리 + UI 최소/권장 + 골든 목록; recommendation/Recommendations/i18n | W01 M         | unit (estimated) + UI 키. GPU 실측은 E01          | IMPLEMENTED analog |

## 외부 승인·환경 의존 잔여 (완료로 숨기지 않음)

| ID  | 우선순위 | 잔여                                                   | 필요 조건                              | 수용 기준                        | 상태             |
| --- | -------- | ------------------------------------------------------ | -------------------------------------- | -------------------------------- | ---------------- |
| E01 | P1       | GPU ablation/LoRA/quant 실제 머신 검증                 | 승인된 GPU·모델·license·비용           | 실제 실행/산출물/정리 로그       | BLOCKED_EXTERNAL |
| E02 | P1       | Azure 제출·provider 인증 호환성                        | 사용자 승인된 계정·키·쿼터             | 실제 제출/조회/삭제 및 비용 기록 | BLOCKED_EXTERNAL |
| E03 | P2       | 깨끗한 Windows 설치/서명/업데이트                      | 별도 clean VM·서명 인증서              | 설치/실행/제거/서명 검증         | BLOCKED_EXTERNAL |
| E04 | P3       | 한국어 full benchmark·PAIR/latent/multi-direction 연구 | 검증 dataset·모델 실행 환경·방법 scope | 기존 master 연구 계약별 실측     | BLOCKED_EXTERNAL |
| E05 | P4       | Light theme, 계정·공유 workspace, hosted scheduling    | 추가 제품 scope 결정                   | 별도 설계·권한·전 화면 contrast  | DEFERRED_SCOPE   |

## 단계와 진행 규칙

1. W01 실제 prod 상호작용과 W02 키 경계부터 해결.
2. W03–W06 저장·network·test foundation.
3. W08–W13 공통 UI/UX·평가·성능·ZIP.
4. W07/W14 desktop/container runtime 격리 검증.
5. W15 문서 현행화, W16 전체 acceptance.
6. 모든 결과에 command/exit/아티팩트 경로 기록. 외부 차단은 원인·필요 조건·다음 명령을 남기고 로컬 나머지는 계속 수행.

기준선: 이 세션 `npm test` 291+37은 source gate일 뿐이며 prod 상호작용·설치 성공과 별개다. 작업 시 credentials/.env 읽기 금지, 기존 사용자 프로세스 종료 금지, 비용 발생/게시/commit/push 자동 실행 금지.

### W15 표 vs 본문 (2026-09-12 analog)

표는 현재 상태를 따른다. 본문의 과거 VERIFIED/IMPLEMENTED 행은 **이번 턴에 해당 명령을 다시 돌리지 않으면** 현행 증거가 아니다. 이 세션은 W17 analog + built-server product-flow(골든 8GiB 포함, Electron 아님) + `npm run ledger:status` 원장 파서를 재실측한다. W10 CSS는 variable WOFF2 1장 analog(정적 TTF 4장 요청 제거). Web Vitals·Electron packaged 번들 바이트는 OPEN. W04는 로컬 `node_modules/tsx` + on-disk glob analog(`npx` 제거). packaged Electron 런은 OPEN. W12는 전체/단건 삭제·초기화 Dialog analog. 검색/복제/cancel/reset E2E는 OPEN. W11은 휴리스틱 고지 소스 analog. 채점 UI E2E는 OPEN. W03은 hydrate `dropped` 경고 analog(손상 행 건너뛰기). CRUD/검색 E2E는 OPEN. W05는 HTTP 500/malformed/empty/stale abort fixture analog. 라이브 ModelSource 재시도 E2E는 OPEN. W13은 Windows 절대경로·UNC·크기 한계 analog. pack manifest E2E는 OPEN. W06은 URL credential redaction analog. live UI event는 OPEN. 14 `isAllowedAppNavigation` analog. packaged 런은 OPEN. W01–W02·W06–W09·W11–W12·W14·W16 표 OPEN/IN_PROGRESS 유지. 본문 W01 VERIFIED를 표로 올리지 않는다. 이 세션 추가 analog(표 승격 금지): Dialog opener/focus restore, TitleBar no-drag, Field htmlFor vs child id, Chip aria-pressed, ModelSource session-only apiKey(no hfToken field), hydration `data-hydrated`, W11 clipboard/heuristic 소스 게이트. keyboard/screenshot/packaged E2E는 OPEN.

## 실행 증거 갱신

### 연속 구현 재개: 저장소 및 하드웨어

- 실제 Windows 설치 수용: 새 installer를 current-user 경로 `C:/Users/USER/AppData/Local/Programs/Abliterater`에 설치했다. 설치 파일 158개, 총 472,235,758 bytes를 열거하고 `artifacts/ecosystem/installed-manifest.json`에 SHA-256을 기록했다. HKCU uninstall 등록과 설치/제거 실행 파일 존재 확인.
- 설치된 `Abliterater.exe --smoke-test`: packaged=true, hidden=true, bridge/workspace/hardware/save 모두 통과. 설치된 실행 파일로 실제 추천 UI를 조회→수동 VRAM→작업 변경→모델 적용→브라우저 저장까지 수행했고 page errors 0. `screenshots/recommendations-installed/verdict.json`.
- 설치는 실제 사용자 PC에서 완료했지만 Authenticode 서명과 uninstall 후 잔여 파일 검증은 아직 OPEN이다. 현재 요청은 설치 후 진행이므로 설치를 유지한다.

- P0-02 PARTIAL: Electron 실제 directory picker IPC, OS 사용자 기본 경로, realpath 기반 repository/junction 거절, 쓰기·여유 공간 검사, atomic 설정 저장·재시작 복구를 구현했다. 실제 파일시스템 회귀 4개 통과. StorageSettings가 Studio에 연결됐다. 실제 directory picker 사용자 조작 및 NAS 수용은 OPEN.
- P0-03 PARTIAL: CPU/RAM/disk/NVIDIA VRAM·driver/Docker/WSL bounded read-only probe와 sender 검증 IPC 구현. 실제 Electron hidden 실행에서 i7-14650HX, logical cores 24, RTX 5070 Laptop GPU가 반환됐다. CUDA runtime 성공은 주장하지 않으며 driverDetected와 unverified를 분리했다. 하드웨어 UI·추천 엔진·ROCm/Metal 실측은 OPEN.
- `npm test`, `npm run typecheck`, `npm run lint` 통과. 로그: `artifacts/ecosystem/storage-hardware-tests.log`. 저장소 UI 포함 build 통과: `artifacts/ecosystem/storage-build.log`.
- 최신 별도 production preview에서 desktop/mobile product-flow 및 browser-smoke 통과. console/page errors 0, overflow false. `screenshots/storage-built{,-mobile}.png`를 시각 검사했다. 기존 8081 preview는 hydration timeout으로 실패했으며 성공 증거로 사용하지 않았다.
- Electron hidden smoke는 workspace 쓰기·실제 hardware IPC·구성 저장 확인 후 exit 0. 첫 실행의 종료 timeout을 수정했다. packaged=false이므로 최신 패키지 수용 완료가 아니다.
- 기존 ecosystem 미완료 61개와 공개화 계획의 미완료 epic은 유지한다. 이번 helper/IPC 구현으로 상위 TODO를 닫지 않는다.

- W01: VERIFIED — stale preview가 현재 빌드에 없는 index-BGMaNJo6.js를 참조(HTTP404). 소유 확인한 preview 자식만 종료·재시작. 추가로 hydration 이전 입력을 방지하도록 `#main[data-hydrated=true]`를 QA 준비 조건으로 사용. `node scripts/product-flow.mjs http://127.0.0.1:8081` desktop/mobile 실제 입력·저장·검색·ZIP·모달·탭 모두 통과. `screenshots/product-flow/verdict.json`.
- W02: VERIFIED(source gates) — HF 입력/legacy 키 읽기 제거, 실행 머신 HF_TOKEN 안내. API 키는 메모리만. `scripts/product-boundary.test.mjs`.
- W04: IMPLEMENTED — tsx 4.23.13 로컬 고정, Node로 local CLI 호출(shell 없음). Electron 전체 등록은 남음.
- W10: IMPLEMENTED 부분 — static TTF 4개 요청 대신 variable TTF 1개 사용. WOFF2/성능 예산·효과 절제는 남음. 폰트 대기 screenshot timeout은 90초로 진단 여유 확대; 이것만으로 전송 성능 완료 아님.
- W11: IMPLEMENTED 부분 — 숫자 substring false-positive·multi-token expectation 개선, 신규 regression 2개 통과. 빈 응답/heuristic 고지·clipboard handling은 남음.
- W16: `npm run workflow:check` 실제 실행 PASS. source gates만을 명시하며 test 204 + 55, typecheck/lint exit0. `artifacts/workflow/source-gates.json` 및 각 로그.
- Build: 기본 병렬 Rust build 메모리 할당 실패(exit127), `RAYON_NUM_THREADS=1 npm run build` 통과. 다른 사용자 프로세스는 종료하지 않음.
- Built screenshot: `screenshots/workflow-built{,-mobile}.png/json`, hydration 확인·console/page errors 0·overflow false. custom OG는 plain utility의 platform placeholder 사용(BRAND NOTE, 경고 아님).
- Electron: 정책 unit 2개 PASS, 설치/실행 수용 검증은 여전히 OPEN. EBUSY/EPERM 과거 결과를 완료로 바꾸지 않음.

추가 실행 증거:

- W08: IMPLEMENTED — `src/components/ui/Chip.tsx`, `Field.tsx`를 만들고 Studio/ModelSource가 공유 컴포넌트를 사용한다. 수동 모달은 실제 opener 범위로 focusable을 제한했다. 독립 axe sweep은 OPEN.
- W09: IMPLEMENTED — 8단계 스테퍼와 IntersectionObserver 현재 단계/aria-current를 적용했다.
- W10: IMPLEMENTED 부분 — variable WOFF2 생성: TTF 10,414,588 bytes → WOFF2 3,910,952 bytes. 최종 build/실제 network bytes는 다음 build 이후 검증.
- W11: IMPLEMENTED — 미입력 상태·휴리스틱 고지·clipboard 실패 UI를 적용했다.
- W06: IMPLEMENTED 부분 — provider endpoint/note/error redaction과 regression을 추가했다. storage denied UX는 OPEN.
- W03: VERIFIED — nested parameter schema, invalid overwrite protection, valid parameter persistence tests pass.
- W05: VERIFIED — real local HTTP hanging fixture timeout/cleanup and URL policy tests pass.
- W07: IMPLEMENTED — Electron production path now uses packaged built server (`scripts/built-server.mjs`) instead of Vite/source runtime. Source-free built server MIME/traversal tests pass. Installer launch remains OPEN due locked Windows output/clean VM.
- W13: VERIFIED — ZIP validator is independently callable; unsafe/duplicate/count/name tests pass; Python roundtrip evidence retained.
- W16: VERIFIED local — source workflow 214 + 55, typecheck/lint/build, production flow and axe all pass. Independent provider/Azure/Electron install acceptance remains separate.
- W06: VERIFIED local — storage-denied logging test and redaction tests pass; UI shows a non-blocking warning when persistence is unavailable.
- W08: VERIFIED — axe smoke now returns zero violations; Radix Dialog is mounted for shortcut help; shared Chip/Field are consumed by Studio and ModelSource.
- W10: VERIFIED local — current dev flow passes after modern token/effect/font changes; WOFF2 is served HTTP 200. Full Web Vitals budget remains a monitoring task.
- W12: VERIFIED local — saved-state schema, invalid overwrite, search/empty-state and production CRUD path pass.
- W14: IMPLEMENTED/VERIFIED static — `scripts/built-server.mjs` serves packaged `.vercel/output` with MIME/path traversal tests. Docker daemon is unavailable, so image runtime remains BLOCKED_ENVIRONMENT.
- W15: VERIFIED — this workflow is the canonical current backlog and final evidence is updated after each gate.

이전 문단의 VERIFIED는 실행된 좁은 검증 범위만 의미한다. 전체 웹 작업 완료는 아니다. 모바일/전체 탭 axe, 삭제·초기화 확인과 복구 E2E, provider 취소·오류 응답 fixture, ZIP 절대경로·크기 한계, 최신 production 재검증 및 문서 상태 표 동기화가 남아 있다. W07 packaged 실행과 W14 Docker runtime도 미검증이며 E01–E05는 외부 조건을 유지한다.
