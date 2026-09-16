import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("BenchRunner reports clipboard errors and heuristic scoring copy", () => {
  const src = readFileSync("src/components/BenchRunner.tsx", "utf8");
  assert.match(src, /clipboardError/);
  assert.match(src, /bench_clip_unavailable/);
  assert.match(src, /bench_clip_denied/);
  assert.match(src, /bench_blurb2/);
  assert.match(src, /disabled=\{!responses\.some/);
  assert.match(src, /setReport\(null\)/);
});
