# Abliterater

**Mục đích giáo dục.** Nghiên cứu ức chế từ chối (*abliteration*) để nhà nghiên cứu và phòng thủ **đối phó sử dụng bất hợp pháp**. Mục đích đó cần **sự chú ý toàn cầu**. Đây không phải sổ tay tấn công.

English: [README.md](./README.md) · 한국어: [README.ko.md](./README.ko.md)

[![CI](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml/badge.svg)](https://github.com/genoxone20261/Abliterater_public/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later + AUP](https://img.shields.io/badge/license-AGPL--3.0--or--later%20%2B%20AUP-1C1D1F)](./LICENSE.md)

**Hoan nghênh đóng góp.** **Sử dụng thương mại, bất hợp pháp và lạm dụng của bên thứ ba không được cấp phép** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md). PR là cấp AGPL-3.0-or-later **và** các điều khoản bổ sung đó.

![Abliterater workbench](./workbench.png)

## Ngôn ngữ

| Ngôn ngữ | Tệp |
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
| العربية | [README.ar.md](./README.ar.md) |
| Tiếng Việt | [README.vi.md](./README.vi.md) (tệp này) |
| Bahasa Indonesia | [README.id.md](./README.id.md) |

UI ứng dụng là Hàn/Anh. Hướng dẫn: [USER-GUIDE.en.md](./USER-GUIDE.en.md).

## Việc nó làm

Chọn nền **Instruct chưa abliterate**, ghép **pack ZIP** Heretic / LoRA / lượng tử, kết nối khóa đám mây GPU **của bạn**.

| Mặt | Vai trò |
| --- | --- |
| Workbench (tab `1`) | Build · Explore · Connect |
| Research (tab `2`) | Liên kết arXiv và GitHub (`target=_blank`) |

Nền mặc định: `Qwen/Qwen3-4B-Instruct-2507`. Thẻ heretic/GGUF đã xử lý là **làn tái sử dụng**, không phải mặc định.

## Việc nó không làm

Không host trọng số, không thuê GPU hộ, không vendor cây AGPL vào `src/`, không đóng sổ native/GPU vì `npm test` đạt. analog `:8080` ≠ native close.

## Bắt đầu nhanh

Cần Node 24.

```bash
git clone https://github.com/genoxone20261/Abliterater_public.git
cd Abliterater_public
npm ci
npm run dev
```

`http://127.0.0.1:8080/`. `npm run typecheck && npm run lint && npm test && npm run ledger:status`

Sản xuất: `npm run build` rồi `HOST=0.0.0.0 PORT=8080 node scripts/built-server.mjs`. Docker: `docker compose up -d --build`. NSIS Windows mặc định chưa ký.

## Giấy phép

**AGPL-3.0-or-later + điều khoản bổ sung.** Bên thứ ba **không** được dùng thương mại nếu không có **giấy phép viết** từ GENOX / Juno Andy Cheong (`support@genox.one`). Dùng bất hợp pháp và lạm dụng **không được cấp phép**. Chia sẻ nguồn AGPL không gỡ lệnh cấm.

## Đóng góp cùng chúng tôi

Chưa xong. Web analog dùng được. Electron native / GPU golden / Hub trong app vẫn **OPEN**. Gửi bằng chứng, không lật ô markdown. analog `npm test` ≠ native close. [CONTRIBUTING.en.md](./CONTRIBUTING.en.md).

Không đưa khóa, `.env`, dump `docs/` vào git. Công cụ AGPL: chỉ pin-call.

## Trạng thái (chưa xong)

| Sổ | Vẫn OPEN |
| --- | --- |
| 01–20 native | 02, 13, 14, 16, 18, 20 |
| R GPU | R-004, R-005 |
| R in-app Hub | R-009 |
| W | W01, W02, W06–W09, W11, W12, W14, W16 |
| C | C-002 … C-007 |

`analog IMPLEMENTED` ≠ native close. Không cộng. `npm run ledger:status`.

## Cảm ơn

**Cảm ơn** tác giả và người duy trì mọi kho và bài chúng tôi pin-call hoặc trích dẫn. Không vendor AGPL/GPL vào `src/`. Bảng: [USER-GUIDE.en.md](./USER-GUIDE.en.md#acknowledgments--repositories). p-e-w/heretic, elder-plinius/OBLITERATUS, andyrdt/refusal_direction, FailSpy, Goekdeniz-Guelmez, heterodoxin, wuwangzhang1216, AIAnytime, jwest33, josepha-mayo, nanofatdog, AUGMXNT, ggml-org/llama.cpp, jim-plus, NousResearch, ant-research, ricyoung (chỉ trích dẫn). Bài: Arditi et al. Bài jailbreak học thuật để **phòng thủ và hiểu**, không phải sổ tay tấn công.

## Tài trợ · đầu tư

**Sponsor (donation)** là quà, không phải cổ phần. Binance `110474712` / BSC `0xB8c48E65D440fe7Ee0025ebD88Da3094272977F4` (chỉ BSC). **Collaboration inquiry**: `support@genox.one`. Không phải chào bán chứng khoán ra công chúng. [SUPPORT.en.md](./SUPPORT.en.md).

---

GENOX · Juno Andy Cheong · [support@genox.one](mailto:support@genox.one) · https://github.com/genoxone20261
