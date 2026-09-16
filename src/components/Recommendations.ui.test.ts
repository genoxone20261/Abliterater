import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Recommendations Field labels bind htmlFor to input ids", () => {
  const src = readFileSync("src/components/Recommendations.tsx", "utf8");
  for (const id of ["rec-manual-vram", "rec-workload"]) {
    assert.match(src, new RegExp(`htmlFor="${id}"`));
    assert.match(src, new RegExp(`id="${id}"`));
  }
  assert.match(src, /data-live-extract-btn/);
  assert.match(src, /data-climax-ranks/);
  assert.match(src, /data-hub-bands/);
});
