import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("02 analog: persist-reject E2E script and jobs.ts share secret key names", () => {
  const jobs = readFileSync("src/lib/jobs.ts", "utf8");
  const script = readFileSync("scripts/persist-reject-e2e.mjs", "utf8");
  for (const key of ["apiKey", "hfToken", "HF_TOKEN", "token", "password", "openaiKey"]) {
    assert.match(jobs, new RegExp(`"${key}"`));
  }
  for (const key of ["apiKey", "hfToken", "HF_TOKEN", "openaiKey", "password"]) {
    assert.match(script, new RegExp(`"${key}"`));
  }
  assert.match(script, /data-hydrated/);
  assert.match(script, /localStorage/);
});

test("13 analog: electron-builder extraResources still pin web output, built-server, license", () => {
  const src = readFileSync("electron/packaging.test.mjs", "utf8");
  assert.match(src, /extraResources/);
  assert.match(src, /\.\.\/\.vercel\/output/);
  assert.match(src, /\.\.\/scripts\/built-server\.mjs/);
  assert.match(src, /\.\.\/LICENSE\.md/);
});

test("14 analog: main process still calls isAllowedAppNavigation", () => {
  const main = readFileSync("electron/main/main.mjs", "utf8");
  assert.match(main, /isAllowedAppNavigation/);
  assert.match(main, /will-navigate/);
});
