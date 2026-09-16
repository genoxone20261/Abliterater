# Abliterater

**Fines educativo.** Estudia la supresión de rechazos (*abliteration*) para que investigadores y defensores puedan **contrarrestar el uso ilegal**. Ese propósito necesita **atención mundial**. No es un manual de ataque.

English: [README.md](./README.md) · 한국어: [README.ko.md](./README.ko.md)

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**Las contribuciones son bienvenidas.** El **uso comercial, ilegal y abusivo de terceros no está licenciado** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md). Un PR es una concesión de AGPL-3.0-or-later **y** esos términos adicionales.

![Abliterater workbench](./workbench.png)

## Idiomas

| Idioma | Archivo |
| --- | --- |
| English | [README.md](./README.md) |
| 한국어 | [README.ko.md](./README.ko.md) |
| 日本語 | [README.ja.md](./README.ja.md) |
| 简体中文 | [README.zh-Hans.md](./README.zh-Hans.md) |
| 繁體中文 | [README.zh-Hant.md](./README.zh-Hant.md) |
| Español | [README.es.md](./README.es.md) (este archivo) |
| Français | [README.fr.md](./README.fr.md) |
| Deutsch | [README.de.md](./README.de.md) |
| Português (Brasil) | [README.pt-BR.md](./README.pt-BR.md) |
| Русский | [README.ru.md](./README.ru.md) |
| العربية | [README.ar.md](./README.ar.md) |
| Tiếng Việt | [README.vi.md](./README.vi.md) |
| Bahasa Indonesia | [README.id.md](./README.id.md) |

La UI de la app es coreano/inglés. Guía: [USER-GUIDE.en.md](./USER-GUIDE.en.md).

## Qué hace

Elige una base **Instruct no abliterada**, arma un **pack ZIP** Heretic / LoRA / cuantización y conecta **tus** claves de nube GPU.

| Superficie | Rol |
| --- | --- |
| Workbench (pestaña `1`) | Build · Explore · Connect |
| Research (pestaña `2`) | Enlaces arXiv y GitHub (`target=_blank`) |

Base por defecto: `Qwen/Qwen3-4B-Instruct-2507`. Las tarjetas heretic/GGUF ya procesadas son un **carril de reutilización**, no el valor por defecto.

## Qué no hace

No aloja pesos, no alquila GPU por ti, no vende árboles AGPL en `src/`, no empaqueta PDF KDP del autor, no cierra ledgers native/GPU porque `npm test` pasó. analog `:8080` ≠ native close.

## Inicio rápido

Hace falta Node 24.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

`http://127.0.0.1:8080/`. `npm run typecheck && npm run lint && npm test && npm run ledger:status`

Producción: `npm run build` luego `HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs`. Docker: `docker compose up -d --build`. NSIS de Windows va sin firmar por defecto.

## Licencia

**AGPL-3.0-or-later + términos adicionales.** Terceros **no** pueden usarlo comercialmente sin **permiso escrito** de GENOX / Juno Andy Cheong (`support@genox.one`). El uso ilegal y el abuso **no están licenciados**. Compartir fuente AGPL no anula esas prohibiciones.

## Contribuye con nosotros

No está terminado. La web analog funciona. Electron nativo / GPU golden / Hub en la app siguen **OPEN**. Queremos parches **juntos**. Envía evidencia, no una celda markdown volteada. analog `npm test` ≠ native close. [CONTRIBUTING.en.md](./CONTRIBUTING.en.md).

No subas claves, `.env` ni volcados `docs/`. Herramientas AGPL: solo pin-call.

## Estado (no hecho)

| Libro | Sigue OPEN |
| --- | --- |
| 01–20 native | 02, 13, 14, 16, 18, 20 |
| R GPU | R-004, R-005 |
| R in-app Hub | R-009 |
| W | W01, W02, W06–W09, W11, W12, W14, W16 |
| C | C-002 … C-007 |

`analog IMPLEMENTED` ≠ native close. No sumar. `npm run ledger:status`.

## Agradecimientos

**Gracias** a autores y mantenedores de cada repositorio y artículo que pin-llamamos o citamos. No vendoramos AGPL/GPL en `src/`. Tablas: [USER-GUIDE.en.md](./USER-GUIDE.en.md#acknowledgments--repositories). p-e-w/heretic, elder-plinius/OBLITERATUS, andyrdt/refusal_direction, FailSpy, Goekdeniz-Guelmez, heterodoxin, wuwangzhang1216, AIAnytime, jwest33, josepha-mayo, nanofatdog, AUGMXNT, ggml-org/llama.cpp, jim-plus, NousResearch, ant-research, ricyoung (solo cita). Artículos: Arditi et al. Los papers académicos de jailbreak son para **defensa y comprensión**, no manuales de ataque.

## Patrocinio · inversión

**Sponsor (donation)** es un regalo, no capital. Binance `110474712` / BSC `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` (solo BSC). **Invest (inquiry)**: `support@genox.one`. No es una oferta pública de valores. [SUPPORT.en.md](./SUPPORT.en.md).

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
