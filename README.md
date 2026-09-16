# Abliterater

Open-source workbench: pick an **unabliterated Instruct** base, assemble a Heretic / LoRA / quant **pack ZIP**, and connect **your** GPU-cloud keys.

It does not host weights. It does not rent GPUs for you. A passing `npm test` is not a training run.

## Quick start

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:8080/`. Default catalog base is `Qwen/Qwen3-4B-Instruct-2507` (work original), method Heretic, output merged BF16. Already-processed heretic/GGUF cards are a reuse lane.

Desktop: `npm run electron:dev`. Pack after `npm run build`:

```bash
npm run electron:build:win    # NSIS + portable (Windows host)
npm run electron:build:linux  # AppImage (Linux host or CI)
npm run electron:build:mac    # DMG (macOS host or CI)
```

Windows NSIS is unsigned by default. macOS DMG is not produced on Windows.

## Status (not done)

Analog web workbench at Vite `:8080` is usable. **Native / live / GPU golden is not closed.**

| Ledger | Still OPEN |
| --- | --- |
| 01–20 native | 02, 13, 14, 16, 18, 20 |
| R GPU | R-004, R-005 |
| R in-app Hub live | R-009 |
| W table | W01, W02, W06, W07, W08, W09, W11, W12, W14, W16 |
| Ecosystem table | C-002 … C-007 |

`analog IMPLEMENTED` ≠ native close. A recipe in this README is not a golden GPU run and does not flip those rows.

Live ledger: `npm run ledger:status`.

## Deploy

Web (built server, no Vite):

```bash
npm ci
npm run build
HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs
```

Docker (this source, production server):

```bash
docker compose up -d --build
# http://127.0.0.1:8080/
```

GitHub Actions (`.github/workflows/`) run `npm test` on push and can pack Windows / Linux / macOS artifacts on tag or `workflow_dispatch`. Binaries belong in a **Release**, not in git.

## License

This project is licensed under **AGPL-3.0-or-later** **together with** additional terms:

- [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md) / [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md)
- Third parties may **not** use this software commercially without written permission from GENOX / Juno Andy Cheong.
- **Illegal use and abuse are forbidden** (including child-exploitation material, weapons assistance, unauthorized access, scams, malware, and using abliteration for mass harm).
- Full AGPL text and the additional terms: `LICENSE.md`.

User guide: [USER-GUIDE.ko.md](./USER-GUIDE.ko.md) · [USER-GUIDE.en.md](./USER-GUIDE.en.md).  
Contributing: [CONTRIBUTING.ko.md](./CONTRIBUTING.ko.md) · [CONTRIBUTING.en.md](./CONTRIBUTING.en.md).

## Connect accounts (other users)

Clone, `npm install`, then run `npm run dev` (web) or `npm run electron:dev` (desktop).

Live list/read adapters — paste your own key in **API 연결 · 인스턴스 모니터** (Provider Connections). Each row links that provider's official docs so you can mint a key in _their_ console. The token stays in that screen’s memory only. It is not written to localStorage, packs, ZIP, or diagnostics.

| Adapter                                                                                      | Auth                  | Where it works                                                                                                                                                    |
| -------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RunPod, Lambda Cloud, Vast.ai                                                                | API key (Bearer)      | Desktop IPC: `providerRead` + allowlisted `providerMutate`. Web: the provider must allow CORS. Create/stop after budget ack uses **your** key.                    |
| Shadeform                                                                                    | API key (`X-API-KEY`) | Same IPC / CORS rules. GET `/instances` and `/instances/{id}/info`.                                                                                               |
| Massed Compute, Prime Intellect, DeepInfra GPU, DigitalOcean Droplets, Together GPU Clusters | API key (Bearer)      | Same IPC / CORS rules. DigitalOcean lists every Droplet on the token, not GPU-only.                                                                               |
| Thunder Compute                                                                              | API key (Bearer)      | List only (`GET /instances/list` keyed map). Per-id read is not in the public GET contract.                                                                       |
| Ollama / LM Studio (loopback)                                                                | none                  | `127.0.0.1:11434` / `:1234` on this machine                                                                                                                       |
| Hugging Face Hub search                                                                      | none                  | Public Hub API. Gated/private repos are flagged; the app does not store `HF_TOKEN`.                                                                               |
| Modal, Azure ML, SSH, Jarvislabs, TensorDock, remaining catalog rows                         | —                     | Catalog / plan only. Jarvislabs is SDK-documented; there is no first-party REST list in those docs. The connection wizard’s OAuth/CLI steps are not a live login. |

create / stop / delete for RunPod, Lambda, and Vast.ai use **your** key after a budget acknowledgement in Provider Connections. This repository does not create GPUs on your behalf. Other live list adapters still create in that provider's console (official docs link). Listing or creating an instance is not a training or abliteration run.

Do not paste API keys into GitHub issues, chat, or commit them. `.env` is gitignored. `.env.example` has no provider secrets.

다른 사용자: 각자 계정 키를 앱 화면에서만 붙여넣으면 됩니다. 이 저장소에 개인 Azure/크레딧 가정은 없습니다.

## Windows installer (unsigned)

The NSIS and portable Windows builds are **unsigned by default**. You do not need to buy an Authenticode certificate to pack. `scripts/electron-build-current.mjs` sets `CSC_IDENTITY_AUTO_DISCOVERY=false` unless `CSC_LINK` or `WIN_CSC_LINK` is already in the environment, so a leftover cert in the Windows store is not used.

SmartScreen may show **Unknown publisher**. That is expected for unsigned open-source builds.

To sign your own build after buying a certificate: set `CSC_LINK` (or `WIN_CSC_LINK`) to the PFX and rebuild. Ledger **E03** (clean-VM install + Authenticode verify + uninstall residual) stays `BLOCKED_EXTERNAL` without that purchased cert and a clean VM. This pin is not E03 verified.

Windows 설치본은 기본 미서명입니다. 코드사인 인증서를 사지 않아도 빌드됩니다. SmartScreen의 ‘알 수 없는 게시자’는 미서명 OSS에서 정상입니다.

## Repository policy

- Heretic: AGPL-3.0, call-only, no vendor into src/.
- OBLITERATUS: AGPL-3.0, call-only, no vendor into src/.
- abliterix: AGPL-3.0-or-later, call-only, no vendor into src/.
- llama.cpp: MIT, pinned clone only, not vendored.
- gabliteration / apostate / ablate / jwest / LLM-abliterate / unfetter: call-only pins recorded in source.
- FailSpy/abliterator: analog path only; no upstream CLI.
- ricyoung/abliteration-comparison: citation-only; no code or data port.

## Live dependency pins

- p-e-w/heretic: `3521f86`
- elder-plinius/OBLITERATUS: `205d28a1`
- wuwangzhang1216/abliterix: `5d58cea9`
- ggml-org/llama.cpp: `5cdd3d1`
- AIAnytime/ablate: `6b89bea`
- heterodoxin/apostate: `be36269d`
- Goekdeniz-Guelmez/gabliteration: `1498fc7`
- jwest33/abliterator: `6ca3356`
- josepha-mayo/model-unfetter: `4c9548c`
- AUGMXNT/deccp: `1a6d557`
- andyrdt/refusal_direction: `9d852fa`
- jim-plus/llm-abliteration: `ca6e223`
- nanofatdog/LLM-abliterate: `f01cec9`

Each pin is mirrored in `src/lib/runners.ts` constants and enforced by
`pack.assert.test.ts` ("no stale SHAs in runners.ts constants") which fails
the build when an obsolete SHA leaks back into source.

## Test commands

- `npm test` — `scripts/run-all-tests.mjs`
- `npm run test:pack` — pack + stale-SHA guard
- `npm run test:gauntlet` — presets / auditWorkflow / StudioState
- `npm run test:all` — all three

---

## 라이선스 매트릭스

| 라이선스   | 저장소 목록                                                         | 비고                                |
| ---------- | ------------------------------------------------------------------- | ----------------------------------- |
| AGPL       | heretic, OBLITERATUS, abliterix                                     | subprocess 호출만, 코드 vendor 금지 |
| MIT        | FailSpy, gabliteration, apostate, ablate, jwest, AUGMXNT, llama.cpp | -                                   |
| Apache-2.0 | refusal_direction, nanofatdog, model-unfetter, kimi-k3              | -                                   |
| NONE       | ricyoung                                                            | 인용만                              |

## Support

Voluntary. Binance ID `110474712`. BSC `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4`. Wrong chain cannot be recovered. Details in the user guide.
