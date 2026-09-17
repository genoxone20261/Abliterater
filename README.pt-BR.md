# Abliterater

**Fim educacional.** Estudar a supressão de recusas (*abliteration*) para que pesquisa e defesa possam **contrapor o uso ilegal**. Esse propósito precisa de **atenção mundial**. Não é um manual de ataque.

English: [README.md](./README.md) · 한국어: [README.ko.md](./README.ko.md)

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**Contribuições são bem-vindas.** Uso **comercial, ilegal e abusivo por terceiros não é licenciado** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md). Um PR é uma concessão de AGPL-3.0-or-later **e** desses termos adicionais.

![Abliterater workbench](./workbench.png)

## Idiomas

| Idioma | Arquivo |
| --- | --- |
| English | [README.md](./README.md) |
| 한국어 | [README.ko.md](./README.ko.md) |
| 日本語 | [README.ja.md](./README.ja.md) |
| 简体中文 | [README.zh-Hans.md](./README.zh-Hans.md) |
| 繁體中文 | [README.zh-Hant.md](./README.zh-Hant.md) |
| Español | [README.es.md](./README.es.md) |
| Français | [README.fr.md](./README.fr.md) |
| Deutsch | [README.de.md](./README.de.md) |
| Português (Brasil) | [README.pt-BR.md](./README.pt-BR.md) (este arquivo) |
| Русский | [README.ru.md](./README.ru.md) |
| العربية | [README.ar.md](./README.ar.md) |
| Tiếng Việt | [README.vi.md](./README.vi.md) |
| Bahasa Indonesia | [README.id.md](./README.id.md) |

A UI do app é coreano/inglês. Guia: [USER-GUIDE.en.md](./USER-GUIDE.en.md).

## O que faz

Escolher uma base **Instruct não abliterada**, montar um **pack ZIP** Heretic / LoRA / quantização e ligar **as suas** chaves de nuvem GPU.

| Superfície | Papel |
| --- | --- |
| Workbench (aba `1`) | Build · Explore · Connect |
| Research (aba `2`) | Links arXiv e GitHub (`target=_blank`) |

Base padrão: `Qwen/Qwen3-4B-Instruct-2507`. Cartões heretic/GGUF já processados são **faixa de reuso**, não o padrão.

## O que não faz

Não hospeda pesos, não aluga GPU por você, não vendor AGPL em `src/`, não envia PDF KDP do autor, não fecha ledgers native/GPU porque `npm test` passou. analog `:8080` ≠ native close.

## Início rápido

Precisa de Node 24.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

`http://127.0.0.1:8080/`. `npm run typecheck && npm run lint && npm test && npm run ledger:status`

Produção: `npm run build` depois `HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs`. Docker: `docker compose up -d --build`. NSIS Windows não assinado por padrão.

## Licença

**AGPL-3.0-or-later + termos adicionais.** Terceiros **não** podem usar comercialmente sem **permissão escrita** de GENOX / Juno Andy Cheong (`support@genox.one`). Uso ilegal e abuso **não são licenciados**. Compartilhar fonte AGPL não revoga essas proibições.

## Contribua conosco

Não está pronto. A web analog funciona. Electron nativo / GPU golden / Hub no app continuam **OPEN**. Envie evidência, não uma célula markdown virada. analog `npm test` ≠ native close. [CONTRIBUTING.en.md](./CONTRIBUTING.en.md).

Não coloque chaves, `.env` nem dumps `docs/` no git. Ferramentas AGPL: só pin-call.

## Estado (não feito)

| Livro | Ainda OPEN |
| --- | --- |
| 01–20 native | 02, 13, 14, 16, 18, 20 |
| R GPU | R-004, R-005 |
| R in-app Hub | R-009 |
| W | W01, W02, W06–W09, W11, W12, W14, W16 |
| C | C-002 … C-007 |

`analog IMPLEMENTED` ≠ native close. Não somar. `npm run ledger:status`.

## Agradecimentos

**Obrigado** às autoras e mantenedores de cada repositório e artigo que pin-chamamos ou citamos. Não vendoramos AGPL/GPL em `src/`. Tabelas: [USER-GUIDE.en.md](./USER-GUIDE.en.md#acknowledgments--repositories). p-e-w/heretic, elder-plinius/OBLITERATUS, andyrdt/refusal_direction, FailSpy, Goekdeniz-Guelmez, heterodoxin, wuwangzhang1216, AIAnytime, jwest33, josepha-mayo, nanofatdog, AUGMXNT, ggml-org/llama.cpp, jim-plus, NousResearch, ant-research, ricyoung (só citação). Artigos: Arditi et al. Papers acadêmicos de jailbreak são para **defesa e compreensão**, não manuais de ataque.

## Patrocínio · investimento

**Sponsor (donation)** é um presente, não equity. Binance `110474712` / BSC `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` (somente BSC). **Collaboration inquiry**: `support@genox.one`. Não é oferta pública de valores. [SUPPORT.en.md](./SUPPORT.en.md).

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
