import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { detectCliSessionAtHome } from "./cli-session-disk.ts";
import { CLI_LOGIN_ERROR, cliLoginSpec } from "./cli-login.ts";

test("CLI disk probe sees profile files and never copies their bytes", () => {
  const home = join(tmpdir(), `ablit-cli-${Date.now()}`);
  mkdirSync(join(home, ".azure"), { recursive: true });
  writeFileSync(join(home, ".azure", "azureProfile.json"), '{"subscriptions":[{"id":"SECRET-SUB"}]}');
  const hit = detectCliSessionAtHome({}, home);
  assert.equal(hit.azure, true);
  assert.equal(hit.aws, false);
  assert.equal(hit.copiedSecret, false);
  assert.equal(JSON.stringify(hit).includes("SECRET-SUB"), false);
});

test("CLI login specs are official commands, not API-key consoles", () => {
  assert.equal(cliLoginSpec("azure").command, "az login");
  assert.match(cliLoginSpec("azure").docs, /^https:\/\/learn\.microsoft\.com\//);
  assert.equal(cliLoginSpec("aws").command, "aws sso login");
  assert.equal(cliLoginSpec("gcp").command, "gcloud auth login");
  assert.throws(() => cliLoginSpec("runpod"), new RegExp(CLI_LOGIN_ERROR.kind));
});
