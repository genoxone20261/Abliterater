# Abliterater

**Bildungszweck.** Ablehnungsunterdrückung (*abliteration*) erforschen, damit Forschung und Abwehr **illegalem Missbrauch begegnen** können. Dafür braucht es **weltweite Aufmerksamkeit**. Das ist kein Angriffs-Runbook.

English: [README.md](./README.md) · 한국어: [README.ko.md](./README.ko.md)

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**Beiträge sind willkommen.** Drittseitige **kommerzielle, illegale und missbräuchliche Nutzung ist nicht lizenziert** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md). Ein PR ist eine Einräumung von AGPL-3.0-or-later **und** diesen Zusatzbedingungen.

![Abliterater workbench](./workbench.png)

## Sprachen

| Sprache | Datei |
| --- | --- |
| English | [README.md](./README.md) |
| 한국어 | [README.ko.md](./README.ko.md) |
| 日本語 | [README.ja.md](./README.ja.md) |
| 简体中文 | [README.zh-Hans.md](./README.zh-Hans.md) |
| 繁體中文 | [README.zh-Hant.md](./README.zh-Hant.md) |
| Español | [README.es.md](./README.es.md) |
| Français | [README.fr.md](./README.fr.md) |
| Deutsch | [README.de.md](./README.de.md) (diese Datei) |
| Português (Brasil) | [README.pt-BR.md](./README.pt-BR.md) |
| Русский | [README.ru.md](./README.ru.md) |
| العربية | [README.ar.md](./README.ar.md) |
| Tiếng Việt | [README.vi.md](./README.vi.md) |
| Bahasa Indonesia | [README.id.md](./README.id.md) |

Die App-UI ist Koreanisch/Englisch. Anleitung: [USER-GUIDE.en.md](./USER-GUIDE.en.md).

## Was es tut

Eine **nicht abliterierte Instruct**-Basis wählen, ein Heretic-/LoRA-/Quant-**Pack-ZIP** bauen, **eigene** GPU-Cloud-Schlüssel verbinden.

| Fläche | Rolle |
| --- | --- |
| Workbench (Tab `1`) | Build · Explore · Connect |
| Research (Tab `2`) | arXiv- und GitHub-Links (`target=_blank`) |

Standardbasis: `Qwen/Qwen3-4B-Instruct-2507`. Fertige heretic/GGUF-Karten sind eine **Wiederverwendungsspur**, nicht der Default.

## Was es nicht tut

Keine Gewichte hosten, keine GPUs für Sie mieten, keine AGPL-Bäume in `src/` vendorn, keine Autor-KDP-PDFs ausliefern, keine native/GPU-Ledger schließen, weil `npm test` grün ist. analog `:8080` ≠ native close.

## Schnellstart

Node 24 nötig.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

`http://127.0.0.1:8080/`. `npm run typecheck && npm run lint && npm test && npm run ledger:status`

Produktion: `npm run build`, dann `HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs`. Docker: `docker compose up -d --build`. Windows-NSIS standardmäßig unsigniert.

## Lizenz

**AGPL-3.0-or-later + Zusatzbedingungen.** Dritte dürfen es **nicht** kommerziell nutzen ohne **schriftliche Erlaubnis** von GENOX / Juno Andy Cheong (`support@genox.one`). Illegale Nutzung und Missbrauch sind **nicht lizenziert**. AGPL-Quellenfreigabe hebt die Verbote nicht auf.

## Tragen Sie mit uns bei

Nicht fertig. Analog-Web nutzbar. Natives Electron / GPU-Golden / In-App-Hub bleiben **OPEN**. Belege schicken, keine umgedrehte Markdown-Zelle. analog `npm test` ≠ native close. [CONTRIBUTING.en.md](./CONTRIBUTING.en.md).

Keine Schlüssel, `.env` oder `docs/`-Dumps in git. AGPL-Tools nur pin-call.

## Status (nicht fertig)

| Ledger | Noch OPEN |
| --- | --- |
| 01–20 native | 02, 13, 14, 16, 18, 20 |
| R GPU | R-004, R-005 |
| R in-app Hub | R-009 |
| W | W01, W02, W06–W09, W11, W12, W14, W16 |
| C | C-002 … C-007 |

`analog IMPLEMENTED` ≠ native close. Nicht summieren. `npm run ledger:status`.

## Danksagung

**Danke** an Autorinnen und Maintainer jedes Repos und Papers, das wir pin-callen oder zitieren. Kein AGPL/GPL-Vendor in `src/`. Tabellen: [USER-GUIDE.en.md](./USER-GUIDE.en.md#acknowledgments--repositories). p-e-w/heretic, elder-plinius/OBLITERATUS, andyrdt/refusal_direction, FailSpy, Goekdeniz-Guelmez, heterodoxin, wuwangzhang1216, AIAnytime, jwest33, josepha-mayo, nanofatdog, AUGMXNT, ggml-org/llama.cpp, jim-plus, NousResearch, ant-research, ricyoung (nur Zitat). Papers: Arditi et al. Akademische Jailbreak-Papers dienen **Abwehr und Verständnis**, nicht als Angriffsmanual.

## Sponsoring · Investition

**Sponsor (donation)** ist ein Geschenk, kein Eigenkapital. Binance `110474712` / BSC `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` (nur BSC). **Invest (inquiry)**: `support@genox.one`. Kein öffentliches Wertpapierangebot. [SUPPORT.en.md](./SUPPORT.en.md).

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
