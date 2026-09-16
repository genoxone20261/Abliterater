# Ecosystem Modernization Master TODO

Date: 2026-09-09
Status source: `providers-current.md`, `methods-current.md`, `datasets-current.md` after source verification. This ledger never promotes catalog entries to integration without evidence.

- [x] C-008 P1: raw 수집과 canonical index를 분리하고 deterministic merge/dedupe + SHA manifest 구현. 1,041개 index, failures=0, unknown-license 208개. `docs/research-20260909/public-ecosystem-index-20260910.md`.
- [ ] C-009 P1: OpenML/Zenodo 및 GPU/SaaS 공식 metadata adapter 추가.

## 경쟁 우위·지속 발견 원장 (2026-09-10 KST)

경쟁 우위는 아직 미입증이다. 같은 GPU·모델/데이터 revision·작업·리전에서 측정하지 않은 속도·비용 우위는 표시하지 않는다. 새 발견은 아래 ID로 추가하고, 구현/계약 테스트/실계정/워크로드 증거를 분리한다. 비용 추정 검증 함수는 실제 과금 차단 장치가 아니다.

| ID    | 우선순위 | 발견/문제                                                      | 구현·검증 방법                                                                               | 상태                               |
| ----- | -------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------- |
| C-001 | P0       | SSH 사용자명 선두 `-` 허용으로 CLI 옵션 혼동 가능              | 사용자명 제한, 옵션 구분자, 고정 명령 allowlist; RED→GREEN 회귀                              | IMPLEMENTED; 아래 실행 증거로 확정 |
| C-002 | P0       | SSH는 명령 생성뿐; 본인 서버 실제 연결 아님                    | Electron IPC 권한·호스트키 검증·SSH agent; 연결/업로드/실행/회수 E2E                         | OPEN                               |
| C-003 | P0       | 여러 compute 선택지가 공급자 전용 제출 없는 일반 runner로 연결 | capability 기반 선택 제한·생성파일 명시·unsupported 차단                                     | OPEN                               |
| C-004 | P1       | 쉬운 설정 우위 측정 없음                                       | SkyPilot/dstack/RunPod 콘솔과 같은 SSH·모델 작업 비교; 초기 설정 시간/입력 수/복구 단계 기록 | OPEN; 비교 실측 필요               |
| C-005 | P1       | 비용·성능 우위 미측정                                          | 동일 GPU/모델/데이터/seed/precision에서 작업 완료시간·총비용·오류율·artifact 무결성 비교     | OPEN; 유료 실측 별도               |
| C-006 | P0       | 계약 테스트·과거 설치본 성공이 현재 통합 완료처럼 보고됨       | 최신 build identity·실제 작업 ID·산출물 checksum·cleanup evidence 필수                       | OPEN                               |
| C-007 | P1       | API 모니터의 연결 실패·해제·stale 응답 UI 검증 미완료          | 실제 브라우저 fixture 테스트와 실계정 수용 테스트 분리                                       | OPEN                               |

평가 순서: 안전한 인증 → 실행/회수 → 실패 복구 → 설정 시간 → 비용/성능. 링크/업체 수는 기능적 우위 점수에 포함하지 않는다.

Support tiers:

1. `CATALOG_VERIFIED`: official URL/docs checked.
2. `DISCOVERY_LIVE`: current data fetched and mapped through a bounded public/authenticated API.
3. `AUTH_VERIFIED`: real credential login/list call succeeded without credential persistence or leakage.
4. `LIFECYCLE_VERIFIED`: create → poll → logs → artifact readback → cancel/delete succeeded with a hard budget and cleanup proof.
5. `WORKLOAD_VERIFIED`: an actual ML/DL/RL workload completed and its outputs were validated.

No item is complete from source code, mocks, HTTP 200, or a vendor claim alone.

## PHASE 0 — Evidence and contracts

- [x] E-001 P0: ingest the three dated reports; trace every recommendation to an official source. `docs/research-20260909/{providers,datasets,methods}-current.md`; methods report is explicitly partial because the worker was interrupted.
- [ ] E-002 P0: build provider capability schema: auth, regions, hardware, lifecycle, logs, artifacts, webhooks, spot, idle shutdown.
- [ ] E-003 P0: build per-provider support matrix with tier and last verified timestamp.
- [ ] E-004 P0: define normalized job states and preserve raw provider states.
- [ ] E-005 P0: define audit event schema with secret redaction and immutable request correlation IDs.

## PHASE 1 — Credential boundary

- [ ] A-001 P0: web mode uses memory-only tokens; unload/disconnect clears them.
- [ ] A-002 P0: Electron secure storage adapter using OS credential protection; never localStorage or ZIP.
- [ ] A-003 P0: OAuth2 Authorization Code + PKCE adapter for providers that officially support delegated OAuth.
- [ ] A-004 P0: API-key adapters for providers that officially use personal/service tokens.
- [ ] A-005 P0: cloud CLI adapters (Azure CLI, AWS SSO/CLI, gcloud ADC) that use existing sessions without copying secrets.
- [ ] A-006 P0: credential status UI: source, scope, expiry, last verified, revoke/disconnect.
- [ ] A-007 P0: token/log/URL/exception redaction regression suite.

## PHASE 2 — Read-only monitoring

- [ ] M-001 P0: RunPod list/read adapter against current official schema. Contract tests pass; real credential not verified.
- [ ] M-002 P0: Lambda list/read adapter against current official schema. Contract tests pass; endpoint corrected to `https://cloud.lambda.ai/api/v1`; real credential not verified.
- [ ] M-003 P1: Vast.ai list/read adapter.
- [ ] M-004 P1: Modal function/app/run monitor.
- [ ] M-005 P1: Azure ML job/compute monitor via CLI identity.
- [ ] M-006 P1: AWS Batch/SageMaker/EC2 monitor via CLI identity.
- [ ] M-007 P1: GCP Vertex/GCE monitor via ADC/CLI identity.
- [ ] M-008 P1: normalized dashboard with filters, status, elapsed time, cost estimate provenance, logs, artifacts.
- [ ] M-009 P1: polling backoff, visibility pause, cancellation, stale response suppression, offline state.

## PHASE 3 — Safe lifecycle

- [ ] L-001 P0: mandatory dry run and explicit maximum spend/runtime before create.
- [ ] L-002 P0: provider-specific create adapters with idempotency key and request readback.
- [ ] L-003 P0: stop/terminate/delete confirmations and cleanup verification.
- [ ] L-004 P0: idle timeout and TTL guard independent of provider defaults.
- [ ] L-005 P0: spot/preemptible interruption handling and checkpoint hooks.
- [ ] L-006 P1: logs with cursor pagination and bounded retention.
- [ ] L-007 P1: artifact URI inventory, checksums, download/readback and provenance manifest.
- [ ] L-008 P1: webhook/event adapters with signature verification where officially supported.

## PHASE 4 — Workload execution

- [ ] W-001 P0: tiny LoRA/QLoRA golden workload on local CUDA and one rented provider.
- [ ] W-002 P1: quantization/GGUF golden workload and model-load verification.
- [ ] W-003 P1: supervised classical ML workload with dataset split/metrics/artifact proof.
- [ ] W-004 P1: Gymnasium RL golden workload with seed, episode metrics and checkpoint.
- [ ] W-005 P1: distributed training smoke for one supported launcher.
- [ ] W-006 P1: inference serving smoke with health, request, latency and shutdown.
- [ ] W-007 P0: every workload records code revision, dependency lock, model/dataset revision, hardware and random seeds.

## PHASE 5 — Dataset/model/method sources

- [ ] D-001 P0: unified live-source adapter interface with pagination, rate limits, retries and response caps.
- [ ] D-002 P0: immutable model/dataset revision and checksum in execution packs.
- [ ] D-003 P0: license/terms/privacy acknowledgement before download or training.
- [ ] D-004 P1: HF, OpenML and Zenodo live adapters; current response schema tests.
- [ ] D-005 P1: authenticated Kaggle and public-data adapters where officially supported.
- [ ] D-006 P1: dataset card/Croissant/lineage viewer and missing-metadata warnings.
- [ ] D-007 P1: streaming/resume/cache policy with bounded disk use.
- [ ] D-008 P1: takedown/revocation state so removed data cannot silently resume.

## PHASE 6 — Product UX and operations

- [ ] U-001 P1: connection setup wizard driven by provider auth capability.
- [ ] U-002 P1: job command center with list/detail/log/artifact/cost/cleanup views.
- [ ] U-003 P1: explicit status labels: connected, provisioned, running, completed, failed, cleanup verified.
- [ ] U-004 P1: empty/loading/error/rate-limit/expired-token/permission-denied states.
- [ ] U-005 P1: notification rules without leaking model, dataset or secret values.
- [ ] U-006 P1: exportable redacted support bundle.

## PHASE 7 — Release gates

- [ ] Q-001 P0: unit/contract tests for every provider adapter.
- [ ] Q-002 P0: fixture server tests for auth expiry, pagination, 429, 5xx, timeout and schema drift.
- [ ] Q-003 P0: browser flows for connect, refresh, failure, disconnect and secret non-persistence.
- [ ] Q-004 P0: actual provider acceptance tests, opt-in and cost-capped.
- [ ] Q-005 P0: Docker production browser flow and health probe.
- [ ] Q-006 P0: fresh Electron build, install, packaged flow and uninstall.
- [ ] Q-007 P1: accessibility, mobile, memory/polling and bundle-size regression.
- [ ] Q-008 P0: cleanup ledger proves no paid resources remain.

## Current evidence

### 현재 추가 구현 (2026-09-10)

판정 정정: 아래 BLOCKED-LIVE는 실제 계정 수용에만 해당한다. lifecycle은 dry-run helper이며 실제 mutation/승인 UI/독립 종료가 미구현이다. SSH는 계획 생성 IPC이며 실행·회수 엔진/UI가 미구현이다. dataset revision 보존도 미구현이다. 이 항목은 외부 차단이 아닌 OPEN이며 task tool의 잘못된 completed 처리는 다시 열었다. CartPole 50회는 고정 정책 환경 실행이지 RL 학습 성공이 아니다.

- 공급자 main-process GET gateway 추가: RunPod/Lambda 고정 endpoint, sender/frame/origin 확인, 동시 요청 제한, 15초 timeout, 2MB cap, redirect 금지, 오류 본문 비노출. preload→목록/단건 조회 연결 및 패키징 목록 반영.
- gateway 단위 테스트 2개, 전체 npm test/typecheck/lint/build 통과. 실제 Electron hidden smoke: packaged=false, bridge=true, saved=true. 실계정 인증·IPC를 통한 실제 공급자 왕복·새 설치본 수용은 아직 미검증이므로 M-001/M-002/Q-003/Q-006은 닫지 않는다.
- lifecycle, SSH E2E, dataset lineage, golden ML/RL/serving은 계속 OPEN. 이번 gateway 구현을 전체 완료로 간주하지 않는다.
- lifecycle contract: 비용 승인·상한·24시간 제한·예상비용 검사와 dry-run plan/cleanupRequired를 구현했다. 실생성은 의도적으로 거부하며 provider 과금 제어 증거는 BLOCKED-LIVE다.
- SSH contract: StrictHostKeyChecking/BatchMode, 안전한 경로, upload→pipefail run→artifact tar→회수→SHA-256 계획과 IPC를 구현했다. 실제 SSH 접속과 artifact readback은 호스트가 없어 BLOCKED-LIVE다.
- golden workload: 격리 Python 3.12.9에서 Iris accuracy 0.947368(38 samples) 및 CartPole-v1 seed 42 reward 50/50 PASS. 이는 LoRA/serving/provider 검증이 아니다. 기본 Python 3.13의 NumPy/PyTorch 경로는 경고 후 segmentation fault가 발생하여 CUDA 최신 검증은 BLOCKED-ENV다.

- `job.json.lineage`에 model/dataset/method 선택 정보를 포함. 모델 revision이 40자리 SHA인지 구분하며 configuration-only로 표시한다. checksum/license 및 실제 실행 provenance가 없으면 unknown/null을 유지한다. D-002 전체 완료는 아니다.
- 회귀: manifest 테스트 RED→GREEN 3개 통과, 전체 npm test 통과, typecheck/lint/build 통과. 브라우저·실계정·workload 검증과 구분한다.
- 공개 수집기: 875개 고유 metadata, 20개 query 성공, 실패 0. `docs/research-20260909/public-harvest-20260910.md` 참조. evaluator 전용 분류·추가 허브·pagination·증분 갱신·UI import는 미완료.
- [ ] D-009 P1: 수집 metadata의 evaluator/tool 분류, query별 lineage, schema validation, SHA 아닌 branch 필드 구분.
- [ ] D-010 P1: OpenML/Zenodo 및 GPU/SaaS 공식 discovery 연결, pagination/증분 갱신과 429 Retry-After 준수.
- [ ] D-011 P0: dataset revision/license/checksum 선택에서 execution pack까지 보존, 실제 다운로드 해시 검증.

- Docker image/runtime and browser flow: verified on this machine.
- Windows packaged/install runtime: verified on this machine; trusted Authenticode identity is not verified.
- Local CUDA: RTX 5070 matrix computation verified; this is not workload verification.
- Public source discovery: HF model/dataset and GitHub search verified.
- Provider adapter: RunPod/Lambda list/read contract tests implemented; real account auth has not been verified.
