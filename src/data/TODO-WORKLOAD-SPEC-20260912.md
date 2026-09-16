# TODO — 최소 작업 사양 · 골든 워크로드 (2026-09-12)

기존 원장을 **교체하지 않는다.** 01–20 / W01–W16 / 에코시스템 C·E·A·M·L·W·D·U·Q 는 유지. 이 파일은 추천 엔진 구멍만 다룬다.

판정: **제품 GREEN 아님.** analog IMPLEMENTED ≠ native. GPU 실측은 `E01` / `W-001`. 커밋 없음. dirty tree 유지.

서브에이전트: `:18081` Connection refused, Ollama `models: []`. 죽은 `hermes3:8b` 재팬아웃 금지. 부모 직접.

---

## 조사 삼각 (문헌, 이 세션 웹. 이 머신 실측 아님)

| 작업                         | 최소 (문헌 하한)                                       | 권장                                            | 출처                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Heretic 처리, 4B dense       | ~10 GiB (튜토리얼 2.5 GiB/B) / 4-bit 더 낮음           | 12 GiB 카드에서 4B 실측 사례(RTX 3060 11.6 GiB) | [Heretic tutorial](https://heretic-project.org/tutorial)                                                                                                                 |
| Heretic 7–8B                 | 16 GiB (양자화)                                        | 24 GiB                                          | [Heretic FAQ](https://mintlify.wiki/p-e-w/heretic/reference/faq)                                                                                                         |
| Heretic 13B                  | 24 GiB (양자화)                                        | 40 GiB                                          | 동일 FAQ                                                                                                                                                                 |
| Heretic 4-bit 7B / 13B / 70B | ~4.2 / ~7.8 / ~42 GiB                                  | 소비자 24 GiB는 13B급                           | [Heretic 1.2](https://jangwook.net/en/blog/en/heretic-12-vram-reduction/)                                                                                                |
| Heretic 병합 RAM             | ~3× paramsB GiB 시스템 RAM (VRAM 아님)                 | 27B ~80 GiB RAM                                 | [troubleshooting](https://www.mintlify.com/p-e-w/heretic/reference/troubleshooting)                                                                                      |
| QLoRA 4-bit 7B               | ~6–14 GiB                                              | 12–24 GiB                                       | [LlamaFactory](https://github.com/hiyouga/LlamaFactory), [AWS Deadline](https://docs.aws.amazon.com/deadline-cloud/latest/developerguide/tutorial-hf-finetune-lora.html) |
| LoRA 16-bit 7B               | ~16 GiB                                                | 24 GiB                                          | LlamaFactory LoRA 행                                                                                                                                                     |
| 전체 FT 7B                   | ~60–120 GiB                                            | 다중 GPU                                        | 동일                                                                                                                                                                     |
| 80B+ MoE Heretic             | 전체 가중치 동시 로드. 레이어 스트리밍 미지원(wontfix) | 서버급                                          | [heretic#135](https://github.com/p-e-w/heretic/issues/135)                                                                                                               |
| 추론 Q4 8B                   | ~6 GiB                                                 | ~10 GiB                                         | 커뮤니티 GGUF 표, 카탈로그 `vram`과 별개                                                                                                                                 |

문헌이 서로 어긋난다 (FAQ 7B min 16 vs 1.2 4-bit ~4.2). 코드는 **하한=4-bit 경로, 권장=BF16/FAQ** 로 표시하고 `estimated` 라벨을 붙인다. 이 세션 GPU 런 없음.

오늘자 주변: Qwen3.8-27B heretic/uncensored 변형(2026-08/09), Huihui 27B abliterated, orcarouter 27B-Uncensored. 카탈로그에 이미 일부 있음. **다운로드·실행 성공 아님.**

---

## 우리 제품 — 이 세션 전

`src/lib/recommendation.ts`:

- 워크로드 `inference \| lora \| qlora \| full`만. **heretic/abliterate 없음.**
- LoRA와 QLoRA가 **같은** `weights*1.35 + 4GiB` 식.
- `paramsOf = vram/2` → 27B 카탈로그(`vram: 24`)를 12B로 오인.
- 골든 워크로드(0.6B/4B heretic, 3B/7B QLoRA) 없음.
- 최소 vs 권장 구분 없음.
- UI는 추정 한 줄 + 적합 뱃지.

프론트: graphite 패널, 수동 GiB, 데스크톱 `hardwareProfile`. 웹은 VRAM 없음 → `unknown`. 맞음. 작업 드롭다운에 Heretic 없음.

파이프라인 실측: RTX 5070 Laptop **probe ≠** Heretic/LoRA 성공. E01 OPEN.

---

## 우리 제품 — 이 세션 analog

| 파일                                 | 변경                                                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/recommendation.ts`          | 워크로드 `heretic`. QLoRA ≠ LoRA ≠ Heretic 4-bit/BF16 ≠ full. `parametersB` / MoE `activeParametersB`. 골든 카탈로그. min/rec GiB. |
| `src/lib/recommendation.test.ts`     | 분리 부등식, 8GiB 4B vs 27B heretic, 골든 필터, MoE                                                                                |
| `src/components/Recommendations.tsx` | Heretic 옵션, 골든 목록, 최소·권장 줄                                                                                              |
| `src/lib/i18n.ts`                    | `rec_wl_heretic`, `rec_min_rec`, `rec_golden`, `rec_merge_ram` ko/en                                                               |
| `src/lib/studio.ts`                  | BASES `parametersB` + `derived`                                                                                                    |
| `WORKFLOW.md`                        | **W17** 추가. W01–W16 상태 유지                                                                                                    |
| `TODO-ROADMAP.md`                    | 관련 링크만. 01–20 상태 유지                                                                                                       |

닫힘: **R-001 analog** (식 분리 + UI). 닫히지 않음: GPU 런, 시간, OOM, KL/refusal.

---

## 새 ID (이 파일 원장)

| ID        | 층                         | 상태                      | 닫으려면                                                                               |
| --------- | -------------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| **R-001** | analog 추천 식             | IMPLEMENTED analog        | unit. native 아님                                                                      |
| **R-002** | UI 최소/권장/골든          | IMPLEMENTED analog        | 2026-09-12 built-server product-flow 8GiB 골든 목록 analog. Electron packaged E2E OPEN |
| **R-003** | 카탈로그 paramsB           | IMPLEMENTED analog        | Hub API 실시간 params 갱신 OPEN                                                        |
| **R-004** | Heretic 파이프 실측        | OPEN / E01                | 이 머신 4B `heretic --quantization bnb_4bit` 로그+VRAM                                 |
| **R-005** | QLoRA 7B 실측              | OPEN / E01                | 동일 카드 1 epoch 또는 명시적 skip                                                     |
| **R-006** | 병합 RAM 경고              | IMPLEMENTED analog        | unit ramFit tight. GPU/OS RAM 실측은 E01                                               |
| **R-007** | 80B+ MoE                   | IMPLEMENTED analog        | 추천 no-fit (`HERETIC_NO_STREAM_PARAMS_B`). 스트리밍 미구현 유지                       |
| **R-008** | 골든 0.6B/4B 스튜디오 적용 | IMPLEMENTED analog        | `goldenStudioPatch` + UI 버튼. runner/pack 실행 아님. E2E OPEN                         |
| **R-009** | 문헌 vs 카탈로그 드리프트  | IMPLEMENTED analog 스냅샷 | 2026-09-12 Hub API parent fetch `HUB-SNAPSHOT-20260912.json`. in-app 실시간 갱신 OPEN  |
| **R-010** | 프론트 밀도                | IMPLEMENTED analog        | Field htmlFor, overflow-x-hidden, 골든 목록 max-h. 모바일 E2E 미실시                   |

기존 유지 (이 작업으로 닫지 않음):

- 01–20: analog. native/E2E OPEN = **02, 13, 14, 16, 18, 20**
- W01–W16: 표는 대체로 OPEN. 본문 VERIFIED local과 어긋남. **W15 표 동기화 leftover**
- 에코시스템 미체크 ~67. C-001·C-008·E-001만 닫힘
- E01–E05, Q-003–Q-006

---

## 골든 워크로드 (추정. 실행 버튼 없음)

| id              | 최소 GiB | 권장 | 8 GiB 카드  | 12 GiB | 24 GiB |
| --------------- | -------- | ---- | ----------- | ------ | ------ |
| heretic-0.6b    | 4        | 8    | 가능        | 가능   | 가능   |
| heretic-4b      | 8        | 12   | 조건부/가능 | 가능   | 가능   |
| qlora-3b        | 6        | 10   | 가능        | 가능   | 가능   |
| qlora-7b        | 8        | 14   | 가능        | 가능   | 가능   |
| infer-8b-q4     | 6        | 10   | 가능        | 가능   | 가능   |
| lora-7b         | 16       | 24   | 불가        | 불가   | 가능   |
| heretic-8b-4bit | 16       | 24   | 불가        | 불가   | 가능   |
| qlora-14b       | 16       | 24   | 불가        | 불가   | 가능   |

RTX 5070 Laptop 8 GiB 가정 시: **4B Heretic 4-bit, 7B QLoRA, 8B Q4 추론** 을 제안. 27B Heretic/LoRA 7B는 no-fit. probe 이름만으로는 VRAM 확정 아님 → 수동 GiB 또는 `hardwareProfile`.

---

## 프론트/성능 (분석, 이번 턴 미개조)

- 추천 패널: 토큰 준수, 과한 glass 없음.
- 카탈로그 `title` 한글은 칩 overlay 밖 leftover (이전 세션).
- `rec_est_gib` 키 제거. 행은 `rec_min_rec`.
- 번들/axe/모바일: 18·W08·W10. 재측정 안 함.
- 파이프라인: 추천은 메모리 가이던스. pack/jobs/Heretic CLI 미연결 (R-008).

---

## 검증 계약

- analog close: `recommendation` unit + i18n 키 대칭 + UI 소스 매치.
- native close 금지 조건: Heretic/QLoRA 로그, Playwright 골든 목록, clean-install, `:8080` E2E.
- 이 문서의 표 GiB를 “우리 5070에서 측정됨”으로 인용 금지.
