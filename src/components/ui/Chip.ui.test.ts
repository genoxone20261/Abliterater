import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Chip exposes pressed state for keyboard and AT", () => {
  const src = readFileSync("src/components/ui/Chip.tsx", "utf8");
  assert.match(src, /aria-pressed=\{on\}/);
  assert.match(src, /data-on=\{on\}/);
  assert.match(src, /type="button"/);
});
