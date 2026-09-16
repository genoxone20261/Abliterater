import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Field binds htmlFor and skips aria-labelledby when the child already has an id", () => {
  const src = readFileSync("src/components/ui/Field.tsx", "utf8");
  assert.match(src, /htmlFor \? \(/);
  assert.match(src, /<label htmlFor=\{htmlFor\}/);
  assert.match(src, /htmlFor && !children\.props\.id/);
  assert.match(src, /id: htmlFor/);
  assert.match(src, /children\.props\.id \|\| children\.props\["aria-labelledby"\]/);
});
