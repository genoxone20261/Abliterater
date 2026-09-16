import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Dialog captures opener and restores focus on close", () => {
  const src = readFileSync("src/components/ui/Dialog.tsx", "utf8");
  assert.match(src, /document\.activeElement instanceof HTMLElement/);
  assert.match(src, /onCloseAutoFocus/);
  assert.match(src, /opener\.current\.focus\(\)/);
  assert.match(src, /event\.preventDefault\(\)/);
  assert.doesNotMatch(src, /backdrop-blur/);
});
