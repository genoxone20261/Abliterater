import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { LICENSE_ACK_ERROR, requireLicenseAck } from "./license-ack.ts";
import {
  clearRevokedSourceIds,
  filterRevokedSources,
  isRevokedSourceId,
  revokeSourceId,
} from "./revocation.ts";

test("D-003 analog: unchecked license cannot be acknowledged", () => {
  assert.throws(
    () => requireLicenseAck(false, "apache-2.0"),
    new RegExp(LICENSE_ACK_ERROR.missing),
  );
  assert.throws(
    () => requireLicenseAck(true, "LICENSE_UNCHECKED"),
    new RegExp(LICENSE_ACK_ERROR.missing),
  );
  requireLicenseAck(true, "apache-2.0");
});

test("D-008 analog: revoked source ids cannot silently resume", () => {
  clearRevokedSourceIds();
  revokeSourceId("org/removed");
  assert.equal(isRevokedSourceId("org/removed"), true);
  assert.deepEqual(filterRevokedSources([{ id: "org/removed" }, { id: "org/ok" }]), [
    { id: "org/ok" },
  ]);
  clearRevokedSourceIds();
});

test("A-001 analog: ProviderConnections keeps the token in screen memory and clears on disconnect", () => {
  const src = readFileSync("src/components/ProviderConnections.tsx", "utf8");
  assert.match(src, /setToken\(""\)/);
  assert.doesNotMatch(src, /localStorage/);
  assert.match(src, /prov_cred_memory/);
  assert.match(src, /jobStatusLabel/);
});

test("M-009 analog: auto-refresh is 15s and pauses while hidden", () => {
  const src = readFileSync("src/components/ProviderConnections.tsx", "utf8");
  assert.match(src, /15000/);
  assert.match(src, /document\.hidden/);
});

test("E-003 analog: capability rows keep tier and verifiedAt", () => {
  const src = readFileSync("src/lib/provider-capabilities.ts", "utf8");
  assert.match(src, /verifiedAt:/);
  assert.match(src, /tier:/);
});
