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
test("dockerignore and gitignore keep research dumps and KDP reports out of image/git", () => {
  const docker = read(".dockerignore");
  const git = read(".gitignore");
  assert.match(docker, /public\/reports/);
  assert.match(docker, /docs\/research/);
  assert.match(git, /public\/reports/);
  assert.match(git, /docs\/research/);
});
test("README does not point at session research dumps", () => {
  assert.doesNotMatch(read("README.md"), /research20260905_master_todo/);
  assert.doesNotMatch(read("README.md"), /docs\/research-/);
});
test("production build omits author KDP reports from output and extraResources", () => {
  assert.match(read("package.json"), /omit-kdp-from-output/);
  assert.match(read("scripts/omit-kdp-from-output.mjs"), /static\/reports/);
  const extras = JSON.parse(read("electron/package.json")).build.extraResources;
  const web = extras.find((e) => e.from === "../.vercel/output");
  assert.ok(web?.filter?.some((f) => f.includes("reports")));
});
