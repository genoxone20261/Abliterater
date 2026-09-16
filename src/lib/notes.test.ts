import assert from "node:assert/strict";
import { test } from "node:test";
import { appendNote } from "./notes.ts";

test("appendNote joins clauses with a real newline and trims blanks", () => {
  assert.equal(appendNote("", "첫 절"), "첫 절");
  assert.equal(appendNote("첫 절", "둘째 절"), "첫 절\n둘째 절");
  assert.equal(appendNote("  첫 절  ", "  둘째  "), "첫 절\n둘째");
  assert.equal(appendNote("유지", "   "), "유지");
  assert.equal(appendNote("", ""), "");
});
