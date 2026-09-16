import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { CATALOG_AS_OF } from "./recommendation.ts";

test("R-009 analog: CATALOG_AS_OF is a snapshot date, not a live Hub client", () => {
  assert.match(CATALOG_AS_OF, /^\d{4}-\d{2}-\d{2}$/);
  assert.doesNotMatch(CATALOG_AS_OF, /live/i);
});

test("R-009 analog: BASES parametersB pins match the 2026-09-13 Hub analog table", () => {
  const studio = readFileSync("src/lib/studio.ts", "utf8");
  const pins: Array<[string, string]> = [
    ["qwen3-06b", "parametersB: 0.6"],
    ["qwen3-4b", "parametersB: 4"],
    ["qwen3-4b-h", "parametersB: 4"],
    ["qwen38-27b", "parametersB: 27"],
    ["orcarouter-27b", "parametersB: 27"],
    ["qwen122b", "parametersB: 122"],
    ["v4flash", "parametersB: 284"],
  ];
  for (const [id, pin] of pins) {
    const start = studio.indexOf(`id: "${id}"`);
    assert.ok(start >= 0, id);
    const slice = studio.slice(start, start + 280);
    assert.match(slice, new RegExp(pin.replace(".", "\\.")));
  }
  const moe = studio.indexOf('id: "qwen122b"');
  assert.match(studio.slice(moe, moe + 280), /activeParametersB: 10/);
});
