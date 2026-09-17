# Abliterater

**Образовательная цель.** Изучать подавление отказов (*abliteration*), чтобы исследователи и защитники могли **противодействовать незаконному использованию**. Для этого нужно **внимание всего мира**. Это не боевой runbook.

English: [README.md](./README.md) · 한국어: [README.ko.md](./README.ko.md)

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**Вклады приветствуются.** **Коммерческое, незаконное и злоупотребляющее использование третьими лицами не лицензируется** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md). PR — это предоставление AGPL-3.0-or-later **и** этих дополнительных условий.

![Abliterater workbench](./workbench.png)

## Языки

| Язык | Файл |
| --- | --- |
| English | [README.md](./README.md) |
| 한국어 | [README.ko.md](./README.ko.md) |
| 日本語 | [README.ja.md](./README.ja.md) |
| 简体中文 | [README.zh-Hans.md](./README.zh-Hans.md) |
| 繁體中文 | [README.zh-Hant.md](./README.zh-Hant.md) |
| Español | [README.es.md](./README.es.md) |
| Français | [README.fr.md](./README.fr.md) |
| Deutsch | [README.de.md](./README.de.md) |
| Português (Brasil) | [README.pt-BR.md](./README.pt-BR.md) |
| Русский | [README.ru.md](./README.ru.md) (этот файл) |
| العربية | [README.ar.md](./README.ar.md) |
| Tiếng Việt | [README.vi.md](./README.vi.md) |
| Bahasa Indonesia | [README.id.md](./README.id.md) |

UI приложения — корейский/английский. Руководство: [USER-GUIDE.en.md](./USER-GUIDE.en.md).

## Что делает

Выбрать **не abliterated Instruct**-базу, собрать Heretic / LoRA / quant **pack ZIP**, подключить **свои** ключи GPU-облака.

| Поверхность | Роль |
| --- | --- |
| Workbench (вкладка `1`) | Build · Explore · Connect |
| Research (вкладка `2`) | Ссылки arXiv и GitHub (`target=_blank`) |

База по умолчанию: `Qwen/Qwen3-4B-Instruct-2507`. Уже обработанные heretic/GGUF — **полоса повторного использования**, не значение по умолчанию.

## Чего не делает

Не хостит веса, не арендует GPU за вас, не vendor AGPL в `src/`, не закрывает native/GPU журналы из-за `npm test`. analog `:8080` ≠ native close.

## Быстрый старт

Нужен Node 24.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

`http://127.0.0.1:8080/`. `npm run typecheck && npm run lint && npm test && npm run ledger:status`

Прод: `npm run build`, затем `HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs`. Docker: `docker compose up -d --build`. Windows NSIS по умолчанию без подписи.

## Лицензия

**AGPL-3.0-or-later + доп. условия.** Третьи лица **не** могут использовать коммерчески без **письменного разрешения** GENOX / Juno Andy Cheong (`support@genox.one`). Незаконное использование и злоупотребление **не лицензированы**. Публикация исходников по AGPL не снимает запреты.

## Внесите вклад вместе с нами

Не готово. Analog-веб работает. Native Electron / GPU golden / in-app Hub остаются **OPEN**. Присылайте доказательства, не перевёрнутую ячейку markdown. analog `npm test` ≠ native close. [CONTRIBUTING.en.md](./CONTRIBUTING.en.md).

Не кладите ключи, `.env` и дампы `docs/` в git. AGPL-инструменты только pin-call.

## Статус (не готово)

| Журнал | Ещё OPEN |
| --- | --- |
| 01–20 native | 02, 13, 14, 16, 18, 20 |
| R GPU | R-004, R-005 |
| R in-app Hub | R-009 |
| W | W01, W02, W06–W09, W11, W12, W14, W16 |
| C | C-002 … C-007 |

`analog IMPLEMENTED` ≠ native close. Не суммировать. `npm run ledger:status`.

## Благодарности

**Спасибо** авторам и сопровождающим каждого репозитория и статьи, которые мы pin-вызываем или цитируем. AGPL/GPL не vendor в `src/`. Таблицы: [USER-GUIDE.en.md](./USER-GUIDE.en.md#acknowledgments--repositories). p-e-w/heretic, elder-plinius/OBLITERATUS, andyrdt/refusal_direction, FailSpy, Goekdeniz-Guelmez, heterodoxin, wuwangzhang1216, AIAnytime, jwest33, josepha-mayo, nanofatdog, AUGMXNT, ggml-org/llama.cpp, jim-plus, NousResearch, ant-research, ricyoung (только цитата). Статьи: Arditi et al. Академические jailbreak-статьи — для **защиты и понимания**, не руководства по атаке.

## Спонсорство · инвестиции

**Sponsor (donation)** — дар, не доля. Binance `110474712` / BSC `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` (только BSC). **Collaboration inquiry**: `support@genox.one`. Это не публичное предложение ценных бумаг. [SUPPORT.en.md](./SUPPORT.en.md).

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
