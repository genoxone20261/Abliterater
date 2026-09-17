# Security

Abliterater is an **educational** workbench. Illegal use and abuse are **not licensed** — [ACCEPTABLE-USE.en.md](./ACCEPTABLE-USE.en.md) / [ACCEPTABLE-USE.ko.md](./ACCEPTABLE-USE.ko.md).

## Report a vulnerability

Do **not** attach API keys, tokens, `.env` files, or personal data to a public GitHub issue.

Email **support@genox.one** with:

- What you found
- How to reproduce it (no live secrets)
- Affected version / commit if you know it

We will answer from that address. Do not expect a bounty unless we write one down.

## Product boundary

- Keys stay in screen memory. They must not land in localStorage, pack ZIPs, logs, or git.
- `docs/` session dumps are not part of the public tree.
- analog `npm test` pass is not a native Electron or GPU-golden close.
