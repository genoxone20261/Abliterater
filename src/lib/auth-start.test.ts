import assert from "node:assert/strict";
import { test } from "node:test";
import { PROVIDER_CAPABILITIES } from "./provider-capabilities.ts";
import { uniqueConnectionOptions } from "./provider-registry.ts";
import { authStartLinks } from "./auth-start.ts";

test("authStartLinks splits api-key vs oauth2 vs cloud-cli and does not paste Azure", () => {
  const api = authStartLinks("api-key");
  const oauth = authStartLinks("oauth2");
  const cli = authStartLinks("cloud-cli");
  assert.ok(api.every((row) => row.kind === "api-console"));
  assert.ok(oauth.every((row) => row.kind === "oauth-authorize"));
  assert.ok(cli.every((row) => row.kind === "cli-docs"));
  assert.ok(api.some((row) => row.id === "runpod"));
  assert.ok(api.some((row) => row.id === "huggingface"));
  assert.ok(api.some((row) => row.id === "kaggle"));
  assert.equal(
    api.some((row) => row.id === "azure" || row.id === "azure-ml" || row.id === "azure-vm"),
    false,
  );
  assert.equal(api.some((row) => row.id === "aws-ec2" || row.id === "gcp-gce"), false);
  assert.ok(oauth.some((row) => row.id === "azure"));
  assert.ok(oauth.some((row) => row.id === "huggingface"));
  assert.ok(oauth.some((row) => row.id === "github"));
  assert.ok(cli.some((row) => row.id === "azure" || row.id === "azure-ml"));
  assert.equal(oauth.some((row) => row.id === "runpod"), false);
  for (const row of [...api, ...oauth, ...cli]) {
    assert.match(row.url, /^https:\/\//);
    assert.ok(row.name.trim());
  }
  const azureOauth = oauth.find((row) => row.id === "azure");
  assert.match(azureOauth?.url ?? "", /login\.microsoftonline\.com/);
  for (const cap of uniqueConnectionOptions(PROVIDER_CAPABILITIES)) {
    if (!cap.officialDocs.startsWith("https://")) continue;
    if (cap.auth.includes("manual")) continue;
    const ids = {
      api: new Set(api.map((row) => row.id)),
      oauth: new Set(oauth.map((row) => row.id)),
      cli: new Set(cli.map((row) => row.id)),
    };
    if (cap.auth.includes("api-key")) assert.ok(ids.api.has(cap.id), `api-key missing ${cap.id}`);
    if (cap.auth.includes("oauth2")) assert.ok(ids.oauth.has(cap.id), `oauth2 missing ${cap.id}`);
    if (cap.auth.includes("cloud-cli")) assert.ok(ids.cli.has(cap.id), `cloud-cli missing ${cap.id}`);
  }
});
