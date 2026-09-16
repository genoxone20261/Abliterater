import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { computeRuntimeKind } from "./provider-capabilities.ts";
import {
  COMPARE_PERF_AXES,
  COMPARE_SETUP_AXES,
  COMPARE_SUBJECTS,
  emptyCompareMatrix,
} from "./compare-protocol.ts";

test("C-004/C-005 compare matrix is unmeasured and does not invent numbers", () => {
  const matrix = emptyCompareMatrix();
  assert.deepEqual(
    [...COMPARE_SUBJECTS],
    ["abliterater-ssh", "skypilot", "dstack", "runpod-console"],
  );
  for (const subject of COMPARE_SUBJECTS) {
    for (const axis of [...COMPARE_SETUP_AXES, ...COMPARE_PERF_AXES]) {
      assert.equal(matrix[subject][axis].value, null);
      assert.equal(matrix[subject][axis].evidence, "unmeasured");
    }
  }
});

test("SkyPilot/dstack stay pack-only; RunPod create is user-key capability not C-005", () => {
  assert.equal(computeRuntimeKind("skypilot"), "pack-only");
  assert.equal(computeRuntimeKind("dstack"), "pack-only");
  assert.equal(computeRuntimeKind("runpod"), "create");
  const studio = readFileSync("src/lib/studio.ts", "utf8");
  assert.match(studio, /usd: 0/);
  assert.match(studio, /est: 0/);
});

test("ecosystem table C-002–C-007 stay OPEN (no analog promotion)", () => {
  const md = readFileSync("docs/maximum-completion/ECOSYSTEM-MASTER-TODO.md", "utf8");
  for (const id of ["C-002", "C-003", "C-004", "C-005", "C-006", "C-007"]) {
    assert.match(md, new RegExp(`\\| ${id} \\|[^\\n]*\\| OPEN`));
  }
  assert.match(md, /- \[ \] C-009 /);
});
