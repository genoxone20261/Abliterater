import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const commands = [
  ["test", process.execPath, ["scripts/run-all-tests.mjs"]],
  ["typecheck", process.execPath, ["node_modules/typescript/bin/tsc", "--noEmit"]],
  ["lint", process.execPath, ["node_modules/eslint/bin/eslint.js", "."]],
];
const results = [];
mkdirSync(resolve(root, "artifacts/workflow"), { recursive: true });
for (const [name, cmd, args] of commands) {
  const startedAt = new Date().toISOString();
  const r = spawnSync(cmd, args, { cwd: root, encoding: "utf8", timeout: 180000 });
  const log = resolve(root, `artifacts/workflow/${name}.log`);
  writeFileSync(log, `${r.stdout || ""}\n${r.stderr || ""}`);
  results.push({
    name,
    command: [cmd, ...args],
    startedAt,
    exit: r.status,
    error: r.error?.message,
    log,
  });
  if (r.status !== 0) break;
}
const verdict = {
  at: new Date().toISOString(),
  ok: results.length === commands.length && results.every((r) => r.exit === 0),
  scope: "source gates only; build/browser/desktop remain independent",
  results,
};
writeFileSync(
  resolve(root, "artifacts/workflow/source-gates.json"),
  JSON.stringify(verdict, null, 2),
);
console.log(JSON.stringify(verdict, null, 2));
process.exitCode = verdict.ok ? 0 : 1;
