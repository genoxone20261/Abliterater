import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  formatLedgerReport,
  parseEcosystem,
  parseRoadmap,
  parseWorkflowW,
  parseWorkloadR,
  reportLedgers,
} from "./ledger-status.ts";

test("roadmap remaining-native is OPEN in status or verification, never a cross-ledger sum", () => {
  const md = `
| ID | Category | Priority | Severity | Problem | Solution | Files | Dependencies | Complexity | Verification method | Status | I,V,R,D |
| 01  | Security | P0 | Critical | x | y | z | none | M | boundary | IMPLEMENTED | 5,5,5,5 |
| 02  | Security | P0 | High | keys | session | ModelSource | 01 | S | browser storage | IMPLEMENTED analog + web. Electron packaged OPEN | 5,5,5,4 |
| 14  | Security | P1 | High | nav | allowlist | electron | 13 | M | policy unit (desktop launch still OPEN) | IMPLEMENTED analog | 5,4,5,3 |
`;
  const r = parseRoadmap(md);
  assert.deepEqual(r.ids, ["01", "02", "14"]);
  assert.deepEqual(r.remainingNative, ["02", "14"]);
  assert.deepEqual(r.analogImplemented, ["01", "02", "14"]);
  const json = JSON.stringify(
    reportLedgers({ roadmap: md, workload: "", workflow: "", ecosystem: "" }),
  );
  assert.equal(json.includes('"neverSum":true'), true);
  assert.equal(/\b"total"\s*:/.test(json), false);
});

test("R GPU vs in-app live stay separate lists", () => {
  const md = `
| ID | 층 | 상태 | 닫으려면 |
| **R-001** | analog 추천 식 | IMPLEMENTED analog | unit. native 아님 |
| **R-004** | Heretic 파이프 실측 | OPEN / E01 | 이 머신 4B heretic 로그+VRAM |
| **R-005** | QLoRA 7B 실측 | OPEN / E01 | 동일 카드 1 epoch |
| **R-009** | 문헌 vs 카탈로그 드리프트 | IMPLEMENTED analog 스냅샷 | Hub API. in-app 실시간 갱신 OPEN |
`;
  const r = parseWorkloadR(md);
  assert.deepEqual(r.remainingGpu, ["R-004", "R-005"]);
  assert.deepEqual(r.remainingInAppLive, ["R-009"]);
  assert.ok(r.analogImplemented.includes("R-001"));
  assert.ok(r.analogImplemented.includes("R-009"));
});

test("W table OPEN excludes analog IMPLEMENTED only", () => {
  const md = `
| ID / 기존 연결 | 우선순위 | 문제 | 해결 | 의존성 | 검증 | 상태 |
| W01 / 06,10 | P0 | SSR | hydration | 없음 M | prod 탭 | IN_PROGRESS |
| W03 / 03–05 | P1 | 저장 | schema | W01 M | CRUD | IMPLEMENTED 일부 |
| W15 / 20 | P2 | docs | 원장 동기화 | 전체 S | docs | IMPLEMENTED analog |
| W17 / rec min-spec | P1 | 추천 | 문헌 하한 | W01 M | unit | IMPLEMENTED analog |
`;
  const r = parseWorkflowW(md);
  assert.deepEqual(r.remainingTableOpen, ["W01", "W03"]);
  assert.deepEqual(r.analogImplemented, ["W15", "W17"]);
});

test("ecosystem unchecked checkboxes and table OPEN are separate", () => {
  const md = `
- [x] C-008 P1: index
- [ ] C-009 P1: adapters
- [ ] E-002 P0: schema
| ID | 우선순위 | 발견 | 방법 | 상태 |
| C-001 | P0 | SSH dash | 제한 | IMPLEMENTED; 아래 실행 증거로 확정 |
| C-002 | P0 | SSH not live | E2E | OPEN |
`;
  const r = parseEcosystem(md);
  assert.deepEqual(r.remainingUnchecked, ["C-009", "E-002"]);
  assert.deepEqual(r.remainingTableOpen, ["C-002"]);
  assert.ok(r.closed.includes("C-008"));
  assert.ok(r.closed.includes("C-001"));
});

test("live ledgers parse and formatter never sums", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
  const docs = {
    roadmap: readFileSync(join(root, "docs/maximum-completion/TODO-ROADMAP.md"), "utf8"),
    workload: readFileSync(
      join(root, "docs/maximum-completion/TODO-WORKLOAD-SPEC-20260912.md"),
      "utf8",
    ),
    workflow: readFileSync(join(root, "docs/maximum-completion/WORKFLOW.md"), "utf8"),
    ecosystem: readFileSync(join(root, "docs/maximum-completion/ECOSYSTEM-MASTER-TODO.md"), "utf8"),
  };
  const report = reportLedgers(docs);
  assert.equal(report.neverSum, true);
  assert.equal(report.ledgers["roadmap-01-20"].ids.length, 20);
  assert.ok(report.ledgers["roadmap-01-20"].remainingNative.includes("02"));
  assert.ok(report.ledgers["r-workload"].remainingGpu.includes("R-004"));
  assert.ok(report.ledgers["r-workload"].remainingGpu.includes("R-005"));
  assert.ok(report.ledgers["r-workload"].remainingInAppLive.includes("R-009"));
  assert.ok(report.ledgers["workflow-w"].analogImplemented.includes("W17"));
  const text = formatLedgerReport(report);
  assert.match(text, /합산 금지/);
  assert.doesNotMatch(text, /총합|합계\s*:/);
});
