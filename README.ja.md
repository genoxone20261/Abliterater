# Abliterater

**教育目的。** 拒否抑制（*abliteration*）を研究・防御し、**違法な悪用への対抗**のために**世界の関心**を求めます。攻撃の実行手順書ではありません。

英語: [README.md](./README.md) · 한국어: [README.ko.md](./README.ko.md)

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**貢献を歓迎します。** 第三者の**商用利用・違法利用・悪用はライセンスされません** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md)。PR は AGPL-3.0-or-later **および** その追加条件の許諾です。

![Abliterater workbench](./workbench.png)

## 言語

| 言語 | ファイル |
| --- | --- |
| English | [README.md](./README.md) |
| 한국어 | [README.ko.md](./README.ko.md) |
| 日本語 | [README.ja.md](./README.ja.md)（このファイル） |
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

アプリ UI は韓国語/英語トグルです。詳細: [USER-GUIDE.en.md](./USER-GUIDE.en.md)。

## できること

未処理の **Instruct** ベースを選び、Heretic / LoRA / 量子化の **pack ZIP** を組み立て、**自分の** GPU クラウド鍵で接続します。

| 画面 | 役割 |
| --- | --- |
| Workbench（タブ `1`） | Build · Explore · Connect |
| Research（タブ `2`） | arXiv と GitHub のリンク（`target=_blank`） |

既定ベースは `Qwen/Qwen3-4B-Instruct-2507`（作業用オリジナル）。heretic/GGUF 済みカードは **再利用レーン** であり既定ではありません。

## しないこと

重みのホスティング、代理 GPU レンタル、AGPL ツリーの `src/` vendor、著者 KDP PDF の同梱、`npm test` による native/GPU クローズ。`:8080` analog ≠ native close。

## クイックスタート

Node 24 が必要です。

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

`http://127.0.0.1:8080/`。`npm run typecheck && npm run lint && npm test && npm run ledger:status`

本番: `npm run build` のあと `HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs`。Docker: `docker compose up -d --build`。Windows NSIS は既定で未署名です。

## ライセンス

**AGPL-3.0-or-later + 追加条件。** GENOX / Juno Andy Cheong（`support@genox.one`）の**書面許可**なしに第三者商用利用はできません。違法利用・悪用はライセンスされません。AGPL のソース公開は禁止を解除しません。

## 一緒に貢献してください

未完成です。analog ウェブは使えます。native Electron / GPU golden / アプリ内 Hub は **OPEN**。証拠付き PR を歓迎します。マークダウンのセルだけを上げないでください。`analog npm test` ≠ native close。手順: [CONTRIBUTING.en.md](./CONTRIBUTING.en.md)。

鍵・`.env`・`docs/` 研究ダンプを git に入れないでください。AGPL ツールは pin-call のみ。

## 状態（完了ではない）

| 台帳 | まだ OPEN |
| --- | --- |
| 01–20 native | 02, 13, 14, 16, 18, 20 |
| R GPU | R-004, R-005 |
| R in-app Hub | R-009 |
| W | W01, W02, W06–W09, W11, W12, W14, W16 |
| C | C-002 … C-007 |

`analog IMPLEMENTED` ≠ native close。合算禁止。`npm run ledger:status`。

## 謝辞

pin-call / 引用しているすべてのリポジトリと論文の著者に **感謝します。** AGPL/GPL は `src/` に vendor しません。表: [USER-GUIDE.en.md](./USER-GUIDE.en.md#acknowledgments--repositories)。p-e-w/heretic、elder-plinius/OBLITERATUS、andyrdt/refusal_direction、FailSpy、Goekdeniz-Guelmez、heterodoxin、wuwangzhang1216、AIAnytime、jwest33、josepha-mayo、nanofatdog、AUGMXNT、ggml-org/llama.cpp、jim-plus、NousResearch、ant-research、ricyoung（引用のみ）。論文: Arditi ほか。学術 jailbreak 論文は**防御と理解**用であり攻撃手順ではありません。

## 後援 · 投資

**Sponsor (donation)** は贈与であり持分ではありません。Binance `110474712` / BSC `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4`（BSC のみ）。**Invest (inquiry)** は `support@genox.one`。証券の公募ではありません。全文: [SUPPORT.en.md](./SUPPORT.en.md)。

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
