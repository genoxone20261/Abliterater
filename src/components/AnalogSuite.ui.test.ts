import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("AnalogSuite slot Field labels bind htmlFor to input ids", () => {
  const src = readFileSync("src/components/AnalogSuite.tsx", "utf8");
  assert.match(src, /htmlFor=\{`as-slot-\$\{slot\.id\}`\}/);
  assert.match(src, /id=\{`as-slot-\$\{slot\.id\}`\}/);
  assert.match(src, /from "@\/components\/ui\/Field"/);
});
