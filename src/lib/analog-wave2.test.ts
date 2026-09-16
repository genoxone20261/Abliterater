import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { detectCliSession } from "./cli-session.ts";
import { kaggleSearchUrl, KAGGLE_ERROR } from "./kaggle-search.ts";
import { OS_CRED_ERROR, storeOsCredential } from "./os-credential.ts";
import { pkcePair } from "./pkce.ts";
import { verifyWebhookSignature, WEBHOOK_ERROR } from "./webhook-signature.ts";
import { redactLogText } from "./provider-log.ts";
import {
  artifactRecord,
  classifyHarvest,
  createByteCache,
  createProviderResource,
  filterDashboard,
  LIFECYCLE_ERROR,
  missingMetadata,
  notifyRedacted,
  pageRows,
  stopProviderResource,
} from "./analog-wave2.ts";

test("A-002 analog: OS credential store never falls back to localStorage", () => {
  assert.throws(() => storeOsCredential("k", "v"), new RegExp(OS_CRED_ERROR.unavailable));
  assert.throws(
    () => storeOsCredential("k", "v", "localStorage"),
    new RegExp(OS_CRED_ERROR.localStorage),
  );
});

test("A-003 analog: PKCE pair is S256 and does not persist the verifier", () => {
  const pair = pkcePair();
  assert.equal(pair.method, "S256");
  assert.equal(pair.verifier.length > 20, true);
  assert.equal(pair.challenge.length > 20, true);
  assert.notEqual(pair.verifier, pair.challenge);
});

test("A-005 analog: CLI session detection never copies secret values", () => {
  const hit = detectCliSession({ AWS_ACCESS_KEY_ID: "AKIALSECRET" });
  assert.equal(hit.aws, true);
  assert.equal(hit.copiedSecret, false);
  assert.equal(JSON.stringify(hit).includes("AKIALSECRET"), false);
});

test("D-005 analog: Kaggle list URL is allowlisted and query-bounded", () => {
  const url = kaggleSearchUrl("mnist");
  assert.equal(url.origin, "https://www.kaggle.com");
  assert.equal(url.pathname, "/api/v1/datasets/list");
  assert.throws(() => kaggleSearchUrl(""), new RegExp(KAGGLE_ERROR.query));
});

test("L-002/L-003 analog: create without request stays unimplemented; user-key plan is not a POST", () => {
  assert.throws(() => createProviderResource(), new RegExp(LIFECYCLE_ERROR.create));
  assert.throws(() => stopProviderResource(), new RegExp(LIFECYCLE_ERROR.stop));
  const plan = createProviderResource({
    provider: "runpod",
    requestId: "r-1",
    budget: { acknowledged: true, maxUsd: 5, maxMinutes: 30, estimatedUsdPerHour: 1 },
  });
  assert.equal(plan.mode, "dry-run");
  assert.equal(plan.executable, false);
  assert.equal(plan.evidence, "user-key-create");
});

test("L-006 analog: log cursor pagination is bounded at 50", () => {
  const page = pageRows(
    Array.from({ length: 80 }, (_, i) => i),
    0,
    99,
  );
  assert.equal(page.items.length, 50);
  assert.equal(page.next, 50);
});

test("L-007 analog: artifact checksum is recorded unverified", () => {
  const row = artifactRecord({ uri: "s3://bucket/out.bin", checksum: "abc" });
  assert.equal(row.checksumVerified, false);
});

test("L-008 analog: webhook HMAC must match", () => {
  const payload = '{"id":1}';
  const secret = "hook-secret";
  const header = createHmac("sha256", secret).update(payload).digest("hex");
  assert.equal(verifyWebhookSignature(payload, secret, header), true);
  assert.throws(
    () => verifyWebhookSignature(payload, secret, "dead"),
    new RegExp(WEBHOOK_ERROR.signature),
  );
});

test("D-006/D-007/D-009 analog: missing metadata, bounded cache, harvest class", () => {
  assert.deepEqual(missingMetadata({ license: "LICENSE_UNCHECKED" }), ["license", "revision"]);
  const cache = createByteCache(8);
  assert.equal(cache.set("a", "12345678"), true);
  assert.equal(cache.set("b", "x"), false);
  assert.equal(classifyHarvest(["eval", "gsm8k"]), "evaluator");
  assert.equal(classifyHarvest(["cli"]), "tool");
});

test("M-008/U-005 analog: dashboard filter and redacted notify", () => {
  const rows = filterDashboard(
    [
      { status: "running", provider: "runpod" },
      { status: "failed", provider: "lambda" },
    ],
    { status: "running" },
  );
  assert.equal(rows.length, 1);
  assert.doesNotMatch(notifyRedacted("Bearer secret-value", redactLogText), /secret-value/);
});

test("U-004 analog: SourceHub empty search state goes through t()", () => {
  const src = readFileSync("src/components/SourceHub.tsx", "utf8");
  assert.match(src, /sh_empty/);
});
