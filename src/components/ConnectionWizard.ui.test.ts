import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("U-001 analog: ConnectionWizard splits API key paste, OAuth PKCE start, and CLI session", () => {
  const src = readFileSync("src/components/ConnectionWizard.tsx", "utf8");
  assert.match(src, /htmlFor="wiz-auth"/);
  assert.match(src, /wizardSteps\(auth\)/);
  assert.match(src, /listProviderJobs/);
  assert.match(src, /setApiKeyMemory/);
  assert.match(src, /id="wiz-api-key"/);
  assert.match(src, /id="wiz-auth-status"/);
  assert.match(src, /wiz_api_connect/);
  assert.match(src, /wiz_oauth_start/);
  assert.match(src, /buildOauthAuthorizeUrl/);
  assert.match(src, /cliLoginSpec/);
  assert.match(src, /btn-primary/);
  assert.match(src, /input-shell/);
  assert.doesNotMatch(src, /localStorage/);
  assert.doesNotMatch(src, /querySelectorAll\('\[role="status"\]'\)/);
});

test("U-002 analog: JobCommandCenter enumerates views without claiming live jobs", () => {
  const src = readFileSync("src/components/JobCommandCenter.tsx", "utf8");
  assert.match(src, /COMMAND_CENTER_VIEWS/);
  assert.match(src, /cmd_live_open/);
  assert.match(src, /data-view=\{view\}/);
});

test("Studio mounts wizard and command center next to provider connections", () => {
  const src = readFileSync("src/components/Studio.tsx", "utf8");
  assert.match(src, /ConnectionWizard/);
  assert.match(src, /JobCommandCenter/);
});
