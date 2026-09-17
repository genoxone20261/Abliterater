# Abliterater

**غرض تعليمي.** دراسة كبت الرفض (*abliteration*) حتى يتمكن الباحثون والمدافعون من **مواجهة الاستخدام غير القانوني**. ذلك يحتاج **اهتمامًا عالميًا**. هذا ليس دليل هجوم.

English: [README.md](./README.md) · 한국어: [README.ko.md](./README.ko.md)

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**المساهمات مرحّب بها.** **الاستخدام التجاري وغير القانوني وإساءة الاستخدام من طرف ثالث غير مرخَّص** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md). طلب السحب منحة لـ AGPL-3.0-or-later **و** هذه الشروط الإضافية.

![Abliterater workbench](./workbench.png)

## اللغات

| اللغة | الملف |
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
| Русский | [README.ru.md](./README.ru.md) |
| العربية | [README.ar.md](./README.ar.md) (هذا الملف) |
| Tiếng Việt | [README.vi.md](./README.vi.md) |
| Bahasa Indonesia | [README.id.md](./README.id.md) |

واجهة التطبيق كورية/إنجليزية. الدليل: [USER-GUIDE.en.md](./USER-GUIDE.en.md).

## ماذا يفعل

اختيار قاعدة **Instruct غير معالجة**، تجميع **pack ZIP** لـ Heretic / LoRA / التكميم، وربط **مفاتيحك** السحابية لوحدة GPU.

| السطح | الدور |
| --- | --- |
| Workbench (تبويب `1`) | Build · Explore · Connect |
| Research (تبويب `2`) | روابط arXiv وGitHub (`target=_blank`) |

القاعدة الافتراضية: `Qwen/Qwen3-4B-Instruct-2507`. بطاقات heretic/GGUF المعالجة مسبقًا **مسار إعادة استخدام** وليست الافتراضي.

## ماذا لا يفعل

لا يستضيف الأوزان، لا يستأجر GPU نيابة عنك، لا يضمّن أشجار AGPL في `src/`، لا يضمّن PDF مؤلف KDP، لا يغلق دفاتر native/GPU لأن `npm test` نجح. analog `:8080` ≠ native close.

## بداية سريعة

يلزم Node 24.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

`http://127.0.0.1:8080/`. `npm run typecheck && npm run lint && npm test && npm run ledger:status`

الإنتاج: `npm run build` ثم `HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs`. Docker: `docker compose up -d --build`. NSIS ويندوز غير موقَّع افتراضيًا.

## الرخصة

**AGPL-3.0-or-later + شروط إضافية.** لا يجوز للأطراف الثالثة الاستخدام التجاري دون **إذن كتابي** من GENOX / Juno Andy Cheong (`support@genox.one`). الاستخدام غير القانوني وإساءة الاستخدام **غير مرخَّصين**. مشاركة مصدر AGPL لا تلغي الحظر.

## ساهموا معنا

لم يكتمل. الويب analog يعمل. Electron الأصلي / GPU golden / Hub داخل التطبيق ما زالت **OPEN**. أرسلوا أدلة، لا خلية markdown مقلوبة. analog `npm test` ≠ native close. [CONTRIBUTING.en.md](./CONTRIBUTING.en.md).

لا تضعوا مفاتيح أو `.env` أو dumps في `docs/` داخل git. أدوات AGPL: pin-call فقط.

## الحالة (غير منتهٍ)

| الدفتر | ما زال OPEN |
| --- | --- |
| 01–20 native | 02, 13, 14, 16, 18, 20 |
| R GPU | R-004, R-005 |
| R in-app Hub | R-009 |
| W | W01, W02, W06–W09, W11, W12, W14, W16 |
| C | C-002 … C-007 |

`analog IMPLEMENTED` ≠ native close. لا تجمعوا. `npm run ledger:status`.

## شكر

**شكرًا** لمؤلفي ومشرفي كل مستودع وورقة نpin-call أو نقتبس. لا نُدخل AGPL/GPL إلى `src/`. الجداول: [USER-GUIDE.en.md](./USER-GUIDE.en.md#acknowledgments--repositories). p-e-w/heretic، elder-plinius/OBLITERATUS، andyrdt/refusal_direction، FailSpy، Goekdeniz-Guelmez، heterodoxin، wuwangzhang1216، AIAnytime، jwest33، josepha-mayo، nanofatdog، AUGMXNT، ggml-org/llama.cpp، jim-plus، NousResearch، ant-research، ricyoung (اقتباس فقط). الأوراق: Arditi وآخرون. أوراق jailbreak الأكاديمية لـ**الدفاع والفهم** وليست أدلة هجوم.

## رعاية · استثمار

**Sponsor (donation)** هدية وليست حصة. Binance `110474712` / BSC `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` (BSC فقط). **Collaboration inquiry**: `support@genox.one`. ليست طرحًا عامًا لأوراق مالية. [SUPPORT.en.md](./SUPPORT.en.md).

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
