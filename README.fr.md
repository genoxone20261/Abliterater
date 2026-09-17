# Abliterater

**But éducatif.** Étudier la suppression des refus (*abliteration*) pour que chercheurs et défenseurs puissent **contrer l’usage illégal**. Cela demande **l’attention mondiale**. Ce n’est pas un mode d’emploi d’attaque.

English: [README.md](./README.md) · 한국어: [README.ko.md](./README.ko.md)

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**Les contributions sont les bienvenues.** L’**usage commercial, illégal et abusif par des tiers n’est pas licencié** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md). Une PR est une concession AGPL-3.0-or-later **et** ces termes additionnels.

![Abliterater workbench](./workbench.png)

## Langues

| Langue | Fichier |
| --- | --- |
| English | [README.md](./README.md) |
| 한국어 | [README.ko.md](./README.ko.md) |
| 日本語 | [README.ja.md](./README.ja.md) |
| 简体中文 | [README.zh-Hans.md](./README.zh-Hans.md) |
| 繁體中文 | [README.zh-Hant.md](./README.zh-Hant.md) |
| Español | [README.es.md](./README.es.md) |
| Français | [README.fr.md](./README.fr.md) (ce fichier) |
| Deutsch | [README.de.md](./README.de.md) |
| Português (Brasil) | [README.pt-BR.md](./README.pt-BR.md) |
| Русский | [README.ru.md](./README.ru.md) |
| العربية | [README.ar.md](./README.ar.md) |
| Tiếng Việt | [README.vi.md](./README.vi.md) |
| Bahasa Indonesia | [README.id.md](./README.id.md) |

L’UI de l’app est coréen/anglais. Guide : [USER-GUIDE.en.md](./USER-GUIDE.en.md).

## Ce que ça fait

Choisir une base **Instruct non abliterée**, assembler un **pack ZIP** Heretic / LoRA / quantification, connecter **vos** clés cloud GPU.

| Surface | Rôle |
| --- | --- |
| Workbench (onglet `1`) | Build · Explore · Connect |
| Research (onglet `2`) | Liens arXiv et GitHub (`target=_blank`) |

Base par défaut : `Qwen/Qwen3-4B-Instruct-2507`. Les cartes heretic/GGUF déjà traitées sont une **voie de réutilisation**, pas la valeur par défaut.

## Ce que ça ne fait pas

Pas d’hébergement de poids, pas de location GPU à votre place, pas de vendor AGPL dans `src/`, pas de PDF KDP auteur dans le produit, pas de clôture native/GPU parce que `npm test` passe. analog `:8080` ≠ native close.

## Démarrage rapide

Node 24 requis.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

`http://127.0.0.1:8080/`. `npm run typecheck && npm run lint && npm test && npm run ledger:status`

Production : `npm run build` puis `HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs`. Docker : `docker compose up -d --build`. NSIS Windows non signé par défaut.

## Licence

**AGPL-3.0-or-later + termes additionnels.** Les tiers **ne** peuvent pas l’utiliser commercialement sans **autorisation écrite** de GENOX / Juno Andy Cheong (`support@genox.one`). Usage illégal et abus **non licenciés**. Le partage de sources AGPL n’annule pas ces interdits.

## Contribuez avec nous

Pas terminé. Le web analog fonctionne. Electron natif / GPU golden / Hub in-app restent **OPEN**. Envoyez des preuves, pas une cellule markdown retournée. analog `npm test` ≠ native close. [CONTRIBUTING.en.md](./CONTRIBUTING.en.md).

Pas de clés, `.env`, ni dumps `docs/` dans git. Outils AGPL : pin-call seulement.

## Statut (pas fini)

| Journal | Encore OPEN |
| --- | --- |
| 01–20 native | 02, 13, 14, 16, 18, 20 |
| R GPU | R-004, R-005 |
| R in-app Hub | R-009 |
| W | W01, W02, W06–W09, W11, W12, W14, W16 |
| C | C-002 … C-007 |

`analog IMPLEMENTED` ≠ native close. Ne pas sommer. `npm run ledger:status`.

## Remerciements

**Merci** aux auteurs et mainteneurs de chaque dépôt et article pin-appelé ou cité. Pas de vendor AGPL/GPL dans `src/`. Tables : [USER-GUIDE.en.md](./USER-GUIDE.en.md#acknowledgments--repositories). p-e-w/heretic, elder-plinius/OBLITERATUS, andyrdt/refusal_direction, FailSpy, Goekdeniz-Guelmez, heterodoxin, wuwangzhang1216, AIAnytime, jwest33, josepha-mayo, nanofatdog, AUGMXNT, ggml-org/llama.cpp, jim-plus, NousResearch, ant-research, ricyoung (citation seulement). Articles : Arditi et al. Les papiers académiques de jailbreak sont pour la **défense et la compréhension**, pas des manuels d’attaque.

## Parrainage · investissement

**Sponsor (donation)** est un don, pas du capital. Binance `110474712` / BSC `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` (BSC seulement). **Collaboration inquiry** : `support@genox.one`. Pas une offre publique de titres. [SUPPORT.en.md](./SUPPORT.en.md).

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
