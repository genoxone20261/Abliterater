import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Dockerfile runtime stage binds 0.0.0.0 and does not copy source or Vite", () => {
  const src = readFileSync("Dockerfile", "utf8");
  const runtime = src.split("AS runtime")[1] ?? "";
  assert.ok(runtime.length > 0, "runtime stage missing");
  assert.match(runtime, /ENV HOST=0\.0\.0\.0/);
  assert.match(runtime, /CMD \["node", "scripts\/built-server\.mjs"\]/);
  assert.match(runtime, /COPY --from=build \/app\/\.vercel\/output/);
  assert.match(runtime, /COPY --from=build \/app\/scripts\/built-server\.mjs/);
  assert.doesNotMatch(runtime, /npm run dev/);
  assert.doesNotMatch(runtime, /\bvite\b/);
  assert.doesNotMatch(runtime, /COPY \. \./);
  assert.doesNotMatch(runtime, /COPY src/);
});
