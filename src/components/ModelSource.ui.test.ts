import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("ModelSource cancels stale API list requests", () => {
  const src = readFileSync("src/components/ModelSource.tsx", "utf8");
  assert.match(src, /AbortController/);
  assert.match(src, /listCompatModelsClient\(baseUrl, apiKey, ctrl\.signal\)/);
  assert.match(src, /AbortError/);
});

test("ModelSource keeps API keys session-only and has no HF token field", () => {
  const src = readFileSync("src/components/ModelSource.tsx", "utf8");
  assert.match(src, /const \[apiKey, setApiKey\] = useState\(""\)/);
  assert.doesNotMatch(src, /hfToken/);
  assert.doesNotMatch(src, /setS\([\s\S]{0,200}apiKey/);
});

test("ModelSource Field labels bind htmlFor to input ids", () => {
  const src = readFileSync("src/components/ModelSource.tsx", "utf8");
  assert.match(src, /from "@\/components\/ui\/Field"/);
  for (const id of [
    "hfQuery",
    "hfRepo",
    "hfRevision",
    "localPath",
    "apiBaseUrl",
    "apiModel",
    "apiKey",
    "studio-base-vram",
  ]) {
    assert.match(src, new RegExp(`htmlFor="${id}"`));
    assert.match(src, new RegExp(`id="${id}"`));
  }
});

test("ModelSource maps hub/compat error codes through i18n", () => {
  const src = readFileSync("src/components/ModelSource.tsx", "utf8");
  assert.match(src, /COMPAT_ERROR/);
  assert.match(src, /HUB_ERROR/);
  assert.match(src, /inspectMessage/);
  assert.match(src, /apiListMessage/);
});

test("empty HF repo shows a block banner instead of painting BASE_MODEL", () => {
  const src = readFileSync("src/components/ModelSource.tsx", "utf8");
  assert.match(src, /data-hf-empty/);
  assert.match(src, /ms_hf_empty/);
  assert.match(src, /ms_hf_empty_catalog/);
  assert.match(src, /ms_hf_empty_paste/);
  assert.match(src, /src === "hf" && !s\.hfRepo\.trim\(\)/);
  assert.match(src, /hfRepoFromCatalog/);
  assert.match(src, /clipboard/);
});

test("catalog pick writes the Hub owner/name into hfRepo", () => {
  const src = readFileSync("src/components/ModelSource.tsx", "utf8");
  assert.match(src, /hfRepo: repo/);
  assert.match(src, /storeBaseUri: repo/);
  const lib = readFileSync("src/lib/model-source.ts", "utf8");
  assert.match(lib, /export function hfRepoFromCatalog/);
});
