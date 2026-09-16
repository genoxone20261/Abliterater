import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

test("styles.css ships one variable WOFF2, not four static TTF faces", () => {
  const css = readFileSync("src/styles.css", "utf8");
  const faces = css.match(/@font-face\s*\{[^}]+\}/g) ?? [];
  assert.equal(faces.length, 1, `expected 1 @font-face, got ${faces.length}`);
  assert.match(faces[0] ?? "", /NotoSansKR-Variable\.woff2/);
  assert.match(faces[0] ?? "", /font-weight:\s*100 900/);
  assert.doesNotMatch(css, /\.ttf/);
});

test("public/fonts analog payload is the variable WOFF2 only", () => {
  const dir = "public/fonts";
  const names = readdirSync(dir).filter((name) => statSync(join(dir, name)).isFile());
  assert.deepEqual(names.sort(), ["NotoSansKR-Variable.woff2"]);
  const bytes = statSync(join(dir, "NotoSansKR-Variable.woff2")).size;
  assert.ok(bytes > 100_000, `woff2 missing or tiny: ${bytes}`);
  assert.ok(bytes < 8_000_000, `woff2 larger than analog budget: ${bytes}`);
});
