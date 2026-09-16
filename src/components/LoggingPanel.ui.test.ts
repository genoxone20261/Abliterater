import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("LoggingPanel surfaces storage-unavailable without blocking the studio", () => {
  const src = readFileSync("src/components/LoggingPanel.tsx", "utf8");
  assert.match(src, /loggingAvailable/);
  assert.match(src, /log_unavailable/);
  assert.match(src, /role="alert"/);
  assert.match(src, /ablit-provider-log/);
  assert.match(src, /log_caption/);
  assert.match(src, /log_col_provider/);
  assert.match(src, /log_stat_ok/);
  assert.match(src, /log_clear_confirm/);
  assert.match(src, /pendingClear/);
  assert.match(src, /<Dialog/);
  assert.doesNotMatch(src, /onClick=\{onClear\}/);
});
