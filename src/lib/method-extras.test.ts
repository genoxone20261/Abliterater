import assert from "node:assert/strict";
import { test } from "node:test";
import {
  apostateCli,
  awqCli,
  evalPackManifest,
  exl2Cli,
  mergekitCli,
} from "./method-extras.ts";

test("apostateCli keeps diode default and adds KCRN as --method kcrn", () => {
  assert.equal(
    apostateCli("sh", "diode"),
    'apostate ablate --model "${WORK:-./base}" --out ./apostate-out',
  );
  assert.match(apostateCli("sh", "kcrn"), /--method kcrn/);
  assert.doesNotMatch(apostateCli("sh", "diode"), /--method kcrn/);
});

test("mergekit/EXL2/AWQ/eval-pack are pin-call lines and do not vendor AGPL", () => {
  assert.match(mergekitCli("sh"), /mergekit-yaml/);
  assert.match(exl2Cli("sh"), /exllama/);
  assert.match(awqCli("sh"), /autoawq|awq/i);
  assert.match(evalPackManifest(), /HarmBench/);
  assert.match(evalPackManifest(), /StrongREJECT/);
  assert.match(evalPackManifest(), /search != download/);
});
