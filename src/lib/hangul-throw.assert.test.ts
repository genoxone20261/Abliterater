import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !name.includes(".test.")) out.push(p);
  }
  return out;
}

test("lib/component throws do not embed Hangul", () => {
  const hangul = /[\uac00-\ud7a3]/;
  const hits: string[] = [];
  for (const file of [...walk("src/lib"), ...walk("src/components")]) {
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      if (line.includes("throw new Error") && hangul.test(line)) hits.push(`${file}:${i + 1}`);
    });
  }
  assert.deepEqual(hits, []);
});
