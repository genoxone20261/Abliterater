import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { formatLedgerReport, reportLedgers } from "../src/lib/ledger-status.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const report = reportLedgers({
  roadmap: readFileSync(resolve(root, "src/data/TODO-ROADMAP.md"), "utf8"),
  workload: readFileSync(resolve(root, "src/data/TODO-WORKLOAD-SPEC-20260912.md"), "utf8"),
  workflow: readFileSync(resolve(root, "src/data/WORKFLOW.md"), "utf8"),
  ecosystem: readFileSync(resolve(root, "src/data/ECOSYSTEM-MASTER-TODO.md"), "utf8"),
});
const outDir = resolve(root, "artifacts/workflow");
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "ledger-status.json"), JSON.stringify(report, null, 2));
const text = formatLedgerReport(report);
writeFileSync(resolve(outDir, "ledger-status.txt"), `${text}\n`);
console.log(text);
