import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("SourceHub query Field binds htmlFor", () => {
  const src = readFileSync("src/components/SourceHub.tsx", "utf8");
  assert.match(src, /from "@\/components\/ui\/Field"/);
  assert.match(src, /htmlFor="source-query"/);
  assert.match(src, /id="source-query"/);
  assert.match(src, /SOURCE_ERROR/);
  assert.match(src, /LICENSE_UNCHECKED/);
  assert.match(src, /sh_src_openml/);
  assert.match(src, /sh_src_zenodo/);
  assert.match(src, /sh_src_kaggle/);
  assert.match(src, /kaggleHit/);
  assert.match(src, /listKaggle/);
  assert.match(src, /htmlFor="kaggle-user"/);
  assert.match(src, /htmlFor="kaggle-key"/);
  assert.match(src, /id="kaggle-user"/);
  assert.match(src, /id="kaggle-key"/);
  assert.match(src, /sh_kaggle_docs/);
  assert.match(src, /kaggle.com\/settings/);
  assert.doesNotMatch(src, /localStorage/);
  assert.match(src, /EVAL_CATALOG/);
  assert.match(src, /data-eval-catalog/);
  assert.match(src, /SOURCE_ERROR\.retry/);
  assert.doesNotMatch(src, /return code \|\| t\("sh_err_search"/);
  assert.match(src, /return t\("sh_err_search"/);
});
