import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("ProviderConnections Field labels bind htmlFor and map PROVIDER_ERROR", () => {
  const src = readFileSync("src/components/ProviderConnections.tsx", "utf8");
  for (const id of ["prov-provider", "prov-api-key", "prov-auto-refresh"]) {
    assert.match(src, new RegExp(`htmlFor="${id}"`));
    assert.match(src, new RegExp(`id="${id}"`));
  }
  assert.match(src, /PROVIDER_ERROR/);
  assert.match(src, /providerMessage/);
  assert.match(src, /prov_live/);
  assert.match(src, /setError\(providerMessage/);
  assert.doesNotMatch(src, /setError\(e instanceof Error \? e\.message/);
  assert.match(src, /prov_catalog_only/);
  assert.match(src, /isLiveReadProvider/);
  assert.match(src, /uniqueConnectionOptions/);
  assert.match(src, /p\.name/);
  assert.match(src, /p\.id/);
  assert.match(src, /prov_docs/);
  assert.match(src, /prov_docs_hint/);
  assert.match(src, /officialDocs/);
  assert.match(src, /noopener noreferrer/);
  assert.match(src, /prov_cred_memory/);
  assert.match(src, /prov_create_user/);
  assert.match(src, /prov_create_console/);
  assert.match(src, /pending/);
  assert.match(src, /createProviderJob/);
  assert.match(src, /<Dialog/);
  assert.match(src, /confirm_cancel/);
  assert.match(src, /htmlFor="prov-max-usd"/);
  assert.match(src, /htmlFor="prov-ack"/);
  assert.doesNotMatch(src, /\bconfirm\(/);
  assert.match(src, /jobStatusLabel/);
});
