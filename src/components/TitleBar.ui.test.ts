import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("TitleBar window controls are no-drag so Electron delivers clicks", () => {
  const src = readFileSync("src/components/TitleBar.tsx", "utf8");
  assert.match(src, /WebkitAppRegion:\s*"drag"/);
  assert.match(src, /WebkitAppRegion:\s*"no-drag"/);
  assert.match(src, /onClick=\{onMinimize\}/);
  assert.match(src, /onClick=\{onMaximize\}/);
  assert.match(src, /onClick=\{onClose\}/);
});
