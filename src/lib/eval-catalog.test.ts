import assert from "node:assert/strict";
import { test } from "node:test";
import { EVAL_CATALOG, evalCatalogHit } from "./eval-catalog.ts";

test("eval catalog pins train and eval HF ids without claiming a download", () => {
  const ids = EVAL_CATALOG.map((row) => row.id);
  assert.ok(ids.includes("Open-Orca/OpenOrca"));
  assert.ok(ids.includes("Open-Orca/SlimOrca"));
  assert.ok(ids.includes("cognitivecomputations/dolphin"));
  assert.ok(ids.includes("walledai/HarmBench"));
  assert.ok(ids.includes("walledai/StrongREJECT"));
  assert.ok(ids.includes("Paul/XSTest"));
  assert.ok(ids.includes("sorry-bench/sorry-bench"));
  const hit = evalCatalogHit("Open-Orca/OpenOrca");
  assert.equal(hit.source, "hf-datasets");
  assert.match(hit.url, /huggingface\.co\/datasets\/Open-Orca\/OpenOrca/);
  assert.equal(hit.sha256, "");
});
