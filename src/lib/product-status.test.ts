import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { CAPABILITY_SCHEMA_KEYS, PRODUCT_STATUS } from "./product-status.ts";

test("U-003 analog: product status labels are the six explicit states", () => {
  assert.deepEqual(
    [...PRODUCT_STATUS],
    ["connected", "provisioned", "running", "completed", "failed", "cleanup_verified"],
  );
});

test("E-002 analog: capability schema declares regions/hardware/spot/idleShutdown without filling live rows", () => {
  const src = readFileSync("src/lib/provider-capabilities.ts", "utf8");
  for (const key of CAPABILITY_SCHEMA_KEYS) {
    assert.match(src, new RegExp(key));
  }
  assert.match(src, /regions\?:/);
  assert.match(src, /idleShutdown\?:/);
});
