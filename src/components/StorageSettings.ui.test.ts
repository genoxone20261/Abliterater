import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("StorageSettings maps WORKSPACE_ERROR codes through i18n", () => {
  const src = readFileSync("src/components/StorageSettings.tsx", "utf8");
  assert.match(src, /WORKSPACE_ERROR/);
  assert.match(src, /workspaceMessage/);
  assert.match(src, /ws_err_data/);
  assert.match(src, /setError\(workspaceMessage/);
  assert.doesNotMatch(src, /setError\(reason instanceof Error \? reason\.message/);
});
