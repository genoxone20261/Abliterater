import test from "node:test";
import assert from "node:assert/strict";
import { exitCodeFor } from "./browser-smoke-verdict.mjs";

test("HTTP 200 from a different application fails the product smoke gate", () => {
  assert.equal(exitCodeFor({ desktop: { status: 200, appIdentity: false } }), 1);
});
test("horizontal overflow fails the product smoke gate", () => {
  assert.equal(
    exitCodeFor({ mobile: { status: 200, appIdentity: true, horizontalOverflow: true } }),
    1,
  );
});
