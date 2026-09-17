# Abliterater

**教育目的。** 研究拒絕抑制（*abliteration*），以便研究者與防禦者**應對非法濫用**。這需要**全世界的關注**。這不是攻擊操作手冊。

English: [README.md](./README.md) · 한국어: [README.ko.md](./README.ko.md)

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**歡迎貢獻。** 第三方**商業使用、非法使用、濫用未被授權** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md)。PR 是對 AGPL-3.0-or-later **以及**附加條款的授予。

![Abliterater workbench](./workbench.png)

## 語言

| 語言 | 檔案 |
| --- | --- |
| English | [README.md](./README.md) |
| 한국어 | [README.ko.md](./README.ko.md) |
| 日本語 | [README.ja.md](./README.ja.md) |
| 简体中文 | [README.zh-Hans.md](./README.zh-Hans.md) |
| 繁體中文 | [README.zh-Hant.md](./README.zh-Hant.md)（本檔） |
| Español | [README.es.md](./README.es.md) |
| Français | [README.fr.md](./README.fr.md) |
| Deutsch | [README.de.md](./README.de.md) |
| Português (Brasil) | [README.pt-BR.md](./README.pt-BR.md) |
| Русский | [README.ru.md](./README.ru.md) |
| العربية | [README.ar.md](./README.ar.md) |
| Tiếng Việt | [README.vi.md](./README.vi.md) |
| Bahasa Indonesia | [README.id.md](./README.id.md) |

應用 UI 為韓/英切換。詳情: [USER-GUIDE.en.md](./USER-GUIDE.en.md)。

## 做什麼

選擇**尚未 abliteration** 的 Instruct 基座，組裝 Heretic / LoRA / 量化 **pack ZIP**，用**你自己的** GPU 雲金鑰連線。

| 介面 | 作用 |
| --- | --- |
| Workbench（分頁 `1`） | Build · Explore · Connect |
| Research（分頁 `2`） | arXiv 與 GitHub 連結（`target=_blank`） |

預設基座 `Qwen/Qwen3-4B-Instruct-2507`。已處理的 heretic/GGUF 是**重用通道**，不是預設。

## 不做什麼

不託管權重、不代租 GPU、不把 AGPL 樹 vendor 進 `src/`、不隨包裝載作者 KDP PDF、不以 `npm test` 關閉 native/GPU 帳本。`:8080` analog ≠ native close。

## 快速開始

需要 Node 24。

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

`http://127.0.0.1:8080/`。`npm run typecheck && npm run lint && npm test && npm run ledger:status`

生產: `npm run build` 後 `HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs`。Docker: `docker compose up -d --build`。Windows NSIS 預設未簽署。

## 授權

**AGPL-3.0-or-later + 附加條款。** 未經 GENOX / Juno Andy Cheong（`support@genox.one`）**書面許可**，第三方不得商業使用。非法使用與濫用未被授權。AGPL 源碼公開並不解除禁止。

## 一起貢獻

尚未完成。analog 網頁可用。native Electron / GPU golden / 應用內 Hub 仍為 **OPEN**。歡迎帶證據的 PR。不要只改 markdown 儲存格。`analog npm test` ≠ native close。[CONTRIBUTING.en.md](./CONTRIBUTING.en.md)。

不要把金鑰、`.env`、`docs/` 研究傾印提交進 git。AGPL 工具僅 pin-call。

## 狀態（未完成）

| 帳本 | 仍 OPEN |
| --- | --- |
| 01–20 native | 02, 13, 14, 16, 18, 20 |
| R GPU | R-004, R-005 |
| R in-app Hub | R-009 |
| W | W01, W02, W06–W09, W11, W12, W14, W16 |
| C | C-002 … C-007 |

`analog IMPLEMENTED` ≠ native close。禁止加總。`npm run ledger:status`。

## 致謝

感謝所有被 pin-call 或引用的倉庫與論文作者。不把 AGPL/GPL vendor 進 `src/`。全表: [USER-GUIDE.en.md](./USER-GUIDE.en.md#acknowledgments--repositories)。p-e-w/heretic、elder-plinius/OBLITERATUS、andyrdt/refusal_direction、FailSpy、Goekdeniz-Guelmez、heterodoxin、wuwangzhang1216、AIAnytime、jwest33、josepha-mayo、nanofatdog、AUGMXNT、ggml-org/llama.cpp、jim-plus、NousResearch、ant-research、ricyoung（僅引用）。論文: Arditi 等。學術越獄論文用於**防禦與理解**，不是攻擊手冊。

## 贊助 · 投資

**Sponsor (donation)** 是贈與，不是股權。Binance `110474712` / BSC `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4`（僅 BSC）。**Collaboration inquiry**：`support@genox.one`。不是證券公開發行。[SUPPORT.en.md](./SUPPORT.en.md)。

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
