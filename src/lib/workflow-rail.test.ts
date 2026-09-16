import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync("src/styles.css", "utf8");

test("left workflow rail keeps stepper on screen: compact status, flex column, darker canvas", () => {
  assert.match(css, /--color-bg:\s*#050607/i);
  assert.match(css, /--color-bg-2:\s*#090a0c/i);
  assert.match(css, /--color-surface:\s*#101214/i);
  assert.match(css, /\.workflow-rail\s*\{[^}]*display:\s*flex/s);
  assert.match(css, /\.workflow-rail\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(css, /\.status-rail dd b\s*\{[^}]*text-overflow:\s*ellipsis/s);
  assert.match(css, /grid-template-columns:\s*14\.75rem minmax\(0,\s*1fr\) 22\.5rem/);
  assert.match(css, /\.stepper\s*\{[^}]*min-height:\s*0/s);
});
