import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

test("arbitrary model endpoints are browser-only, never unauthenticated server proxies", () => {
  assert.doesNotMatch(read("src/lib/model-hub.ts"), /export const listCompatModels\s*=/);
  assert.doesNotMatch(read("src/components/ModelSource.tsx"), /listCompatModels\(\{/);
});
test("provider keys are not automatically persisted in localStorage", () => {
  assert.doesNotMatch(read("src/components/ModelSource.tsx"), /writeLocal\(API_KEY_KEY/);
  assert.doesNotMatch(read("src/components/ModelSource.tsx"), /ablit\.hf-token|TOKEN_KEY/);
});
test("workbench pack and chrome do not ship author KDP reports", () => {
  assert.doesNotMatch(read("src/lib/pack.ts"), /public\/reports/);
  assert.doesNotMatch(read("src/routes/index.tsx"), /\/reports\//);
  assert.doesNotMatch(read("src/lib/pack.ts"), /abliteration-report\.pdf/);
});
