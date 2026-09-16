import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

test("Windows pack is unsigned unless CSC_LINK/WIN_CSC_LINK is set", () => {
  const script = readFileSync(join(root, "..", "scripts", "electron-build-current.mjs"), "utf8");
  assert.match(script, /CSC_IDENTITY_AUTO_DISCOVERY/);
  assert.match(script, /CSC_LINK/);
  assert.match(script, /WIN_CSC_LINK/);
  const win = pkg.build?.win ?? {};
  assert.equal(win.certificateFile, undefined);
  assert.equal(win.certificateSha1, undefined);
  assert.notEqual(win.signDlls, true);
});

test("electron-builder extraResources pin web output, built-server, license", () => {
  const extras = pkg.build?.extraResources;
  assert.ok(Array.isArray(extras), "extraResources missing");
  const froms = extras.map((entry) => entry.from);
  assert.ok(froms.includes("../.vercel/output"), froms.join(","));
  assert.ok(froms.includes("../scripts/built-server.mjs"), froms.join(","));
  assert.ok(froms.includes("../LICENSE.md"), froms.join(","));
});

test("electron preload contract: main loads preload.cjs with providerRead", () => {
  const main = readFileSync(join(root, "main/main.mjs"), "utf8");
  const cjs = readFileSync(join(root, "main/preload.cjs"), "utf8");
  const mjs = readFileSync(join(root, "main/preload.mjs"), "utf8");
  assert.match(main, /preload:\s*join\(here,\s*"preload\.cjs"\)/);
  assert.equal(/preload:\s*join\(here,\s*"preload\.mjs"\)/.test(main), false);
  const files = pkg.build?.files;
  assert.ok(Array.isArray(files) && files.includes("main/preload.cjs"));
  for (const key of [
    "providerRead",
    "providerMutate",
    "sshPlan",
    "workspaceGet",
    "workspaceSelect",
    "hardwareProfile",
  ]) {
    assert.match(cjs, new RegExp(key));
    assert.match(mjs, new RegExp(key));
  }
});
