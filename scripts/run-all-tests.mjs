#!/usr/bin/env node
/**
 * Windows npm does not expand glob stars in package.json test scripts.
 * Expand here, then hand the list to node --test.
 */
import { spawnSync } from "node:child_process";
import { globSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const scriptTests = globSync("scripts/**/*.test.mjs", { cwd: root }).sort();
const electronTests = globSync("electron/**/*.test.mjs", { cwd: root }).sort();
const sourceTests = globSync("src/**/*.test.ts", { cwd: root }).sort();
const directSourceTests = sourceTests.filter(
  (name) =>
    !name.endsWith("pack.assert.test.ts") &&
    !name.endsWith("gauntlet.test.ts") &&
    !name.endsWith("pack.manifest.test.ts"),
);
if (scriptTests.length === 0) {
  console.error("run-all-tests: no scripts/**/*.test.mjs");
  process.exit(1);
}
const args = [
  "--experimental-strip-types",
  "--test",
  "--test-concurrency=2",
  ...scriptTests,
  ...electronTests,
  ...directSourceTests,
];
const direct = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit" });
if ((direct.status ?? 1) !== 0) process.exit(direct.status ?? 1);
const aliased = sourceTests.filter((name) => !directSourceTests.includes(name));
const tsx = spawnSync(
  process.execPath,
  [join(root, "node_modules", "tsx", "dist", "cli.mjs"), "--test", ...aliased],
  {
    cwd: root,
    stdio: "inherit",
  },
);
process.exit(tsx.status ?? 1);
