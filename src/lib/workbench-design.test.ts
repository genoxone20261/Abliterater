import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("src/styles.css", "utf8");
const home = readFileSync("src/routes/index.tsx", "utf8");

// 소스 회귀 가드. 실제 줄바꿈/키 입력/포커스는 Browser DevTools에서 별도 검증한다.
test("keyboard hints use indivisible key groups, not a squeezed sentence", () => {
  assert.match(css, /\.shortcut-group\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(css, /kbd\.kbd\s*\{[^}]*flex-shrink:\s*0/s);
  assert.doesNotMatch(home, /t\("kbd_switch"/);
  assert.doesNotMatch(home, /t\("kbd_save_dot"/);
  assert.match(home, /className="shortcut-trigger/);
});

test("graphite panels are opaque with high contrast body text", () => {
  assert.match(css, /--color-fg:\s*#f5f7fa/i);
  assert.match(css, /--color-bg:\s*#050607/i);
  assert.match(css, /--color-surface:\s*#101214/i);
  assert.match(css, /--color-muted:\s*#bdc6d2/i);
});
