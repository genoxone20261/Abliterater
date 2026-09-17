# Abliterater

**教育目的。** 研究拒绝抑制（*abliteration*），以便研究者与防御者**应对非法滥用**。这需要**全世界的关注**。这不是攻击操作手册。

English: [README.md](./README.md) · 한국어: [README.ko.md](./README.ko.md)

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**欢迎贡献。** 第三方**商业使用、非法使用、滥用未被许可** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md)。PR 是对 AGPL-3.0-or-later **以及**附加条款的授予。

![Abliterater workbench](./workbench.png)

## 语言

| 语言 | 文件 |
| --- | --- |
| English | [README.md](./README.md) |
| 한국어 | [README.ko.md](./README.ko.md) |
| 日本語 | [README.ja.md](./README.ja.md) |
| 简体中文 | [README.zh-Hans.md](./README.zh-Hans.md)（本文件） |
| 繁體中文 | [README.zh-Hant.md](./README.zh-Hant.md) |
| Español | [README.es.md](./README.es.md) |
| Français | [README.fr.md](./README.fr.md) |
| Deutsch | [README.de.md](./README.de.md) |
| Português (Brasil) | [README.pt-BR.md](./README.pt-BR.md) |
| Русский | [README.ru.md](./README.ru.md) |
| العربية | [README.ar.md](./README.ar.md) |
| Tiếng Việt | [README.vi.md](./README.vi.md) |
| Bahasa Indonesia | [README.id.md](./README.id.md) |

应用 UI 为韩/英切换。详情: [USER-GUIDE.en.md](./USER-GUIDE.en.md)。

## 做什么

选择**尚未 abliteration** 的 Instruct 基座，组装 Heretic / LoRA / 量化 **pack ZIP**，用**你自己的** GPU 云密钥连接。

| 界面 | 作用 |
| --- | --- |
| Workbench（标签 `1`） | Build · Explore · Connect |
| Research（标签 `2`） | arXiv 与 GitHub 链接（`target=_blank`） |

默认基座 `Qwen/Qwen3-4B-Instruct-2507`。已处理的 heretic/GGUF 是**复用通道**，不是默认。

## 不做什么

不托管权重、不代租 GPU、不把 AGPL 树 vendor 进 `src/`、不随包装载作者 KDP PDF、不以 `npm test` 关闭 native/GPU 台账。`:8080` analog ≠ native close。

## 快速开始

需要 Node 24。

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

`http://127.0.0.1:8080/`。`npm run typecheck && npm run lint && npm test && npm run ledger:status`

生产: `npm run build` 后 `HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs`。Docker: `docker compose up -d --build`。Windows NSIS 默认未签名。

## 许可

**AGPL-3.0-or-later + 附加条款。** 未经 GENOX / Juno Andy Cheong（`support@genox.one`）**书面许可**，第三方不得商业使用。非法使用与滥用未被许可。AGPL 源码公开并不解除禁止。

## 一起贡献

尚未完成。analog 网页可用。native Electron / GPU golden / 应用内 Hub 仍为 **OPEN**。欢迎带证据的 PR。不要只改 markdown 单元格。`analog npm test` ≠ native close。[CONTRIBUTING.en.md](./CONTRIBUTING.en.md)。

不要把密钥、`.env`、`docs/` 研究转储提交进 git。AGPL 工具仅 pin-call。

## 状态（未完成）

| 台账 | 仍 OPEN |
| --- | --- |
| 01–20 native | 02, 13, 14, 16, 18, 20 |
| R GPU | R-004, R-005 |
| R in-app Hub | R-009 |
| W | W01, W02, W06–W09, W11, W12, W14, W16 |
| C | C-002 … C-007 |

`analog IMPLEMENTED` ≠ native close。禁止合计。`npm run ledger:status`。

## 致谢

感谢所有被 pin-call 或引用的仓库与论文作者。不把 AGPL/GPL vendor 进 `src/`。全表: [USER-GUIDE.en.md](./USER-GUIDE.en.md#acknowledgments--repositories)。p-e-w/heretic、elder-plinius/OBLITERATUS、andyrdt/refusal_direction、FailSpy、Goekdeniz-Guelmez、heterodoxin、wuwangzhang1216、AIAnytime、jwest33、josepha-mayo、nanofatdog、AUGMXNT、ggml-org/llama.cpp、jim-plus、NousResearch、ant-research、ricyoung（仅引用）。论文: Arditi 等。学术越狱论文用于**防御与理解**，不是攻击手册。

## 赞助 · 投资

**Sponsor (donation)** 是赠与，不是股权。Binance `110474712` / BSC `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4`（仅 BSC）。**Collaboration inquiry**：`support@genox.one`。不是证券公开发行。[SUPPORT.en.md](./SUPPORT.en.md)。

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
