import test from "node:test";
import assert from "node:assert/strict";
import { globSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("canonical npm test discovers every source test", () => {
  const runner = readFileSync(new URL("./run-all-tests.mjs", import.meta.url), "utf8");
  assert.match(runner, /src\/\*\*\/\*\.test\.ts/);
  assert.match(runner, /electron\/\*\*\/\*\.test\.mjs/);
  assert.doesNotMatch(runner, /const extra = \[/);
  assert.match(runner, /node_modules.*tsx/);
  assert.match(runner, /--test-concurrency=2/);
});

test("on-disk electron and src tests are covered; pack/gauntlet do not use npx", () => {
  const electron = globSync("electron/**/*.test.mjs", { cwd: root }).sort();
  const source = globSync("src/**/*.test.ts", { cwd: root }).sort();
  assert.ok(electron.length > 0, "electron tests missing");
  assert.ok(source.length > 0, "src tests missing");
  const runner = readFileSync(join(root, "scripts/run-all-tests.mjs"), "utf8");
  assert.match(runner, /electron\/\*\*\/\*\.test\.mjs/);
  assert.match(runner, /src\/\*\*\/\*\.test\.ts/);
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(pkg.scripts.test, "node scripts/run-all-tests.mjs");
  assert.doesNotMatch(pkg.scripts["test:pack"], /\bnpx\b/);
  assert.doesNotMatch(pkg.scripts["test:gauntlet"], /\bnpx\b/);
  assert.match(pkg.scripts["test:pack"], /node_modules\/tsx\/dist\/cli\.mjs/);
  assert.match(pkg.scripts["test:gauntlet"], /node_modules\/tsx\/dist\/cli\.mjs/);
  assert.equal(electron.length, globSync("electron/**/*.test.mjs", { cwd: root }).length);
});
