import test from "node:test";
import assert from "node:assert/strict";
import {
  fillProviderPath,
  isLiveReadProvider,
  liveReadProviders,
  normalizeCredential,
  providerAdapter,
  resolveProviderId,
  uniqueConnectionOptions,
  usesMainProcessRead,
} from "./provider-registry.ts";

test("registry exposes list/read and user-key create for paste-key GPU clouds", () => {
  const a = providerAdapter("runpod");
  assert.equal(a.id, "runpod");
  assert.equal(a.operations.includes("list"), true);
  assert.equal(a.operations.includes("create"), true);
  assert.equal(a.createPath, "/pods");
  const vast = providerAdapter("vast");
  assert.equal(vast.status, "live-adapter");
  assert.equal(vast.baseUrl, "https://console.vast.ai/api/v0");
  assert.equal(vast.listPath, "/instances/");
  assert.equal(vast.operations.includes("create"), true);
  assert.equal(providerAdapter("modal").status, "catalog");
  assert.equal(providerAdapter("modal").operations.includes("list"), false);
  assert.equal(providerAdapter("modal").operations.includes("create"), false);
  assert.equal(providerAdapter("tensordock").status, "degraded");
  assert.throws(() => providerAdapter("banana-dev"));
});

test("credentials keep the provider-specific opaque value", () => {
  const raw = "  opaque key with spaces  ";
  const c = normalizeCredential("runpod", raw);
  assert.equal(c.token, raw);
});

test("credential boundary rejects control chars and never stores a key", () => {
  assert.throws(() => normalizeCredential("runpod", "bad\r\nAuthorization: ***"));
  assert.throws(() => normalizeCredential("runpod", ""));
  const c = normalizeCredential("lambda", " fixture-key ");
  assert.equal(c.provider, "lambda");
  assert.equal(c.token, " fixture-key ");
});

test("local probe adapters allow empty credential", () => {
  const c = normalizeCredential("localhost_ollama", "");
  assert.equal(c.provider, "localhost_ollama");
  assert.equal(c.token, "");
  assert.equal(providerAdapter("local").baseUrl, providerAdapter("localhost_ollama").baseUrl);
});

test("live read set includes runpod, lambda, vast, loopback — not Modal/SSH create", () => {
  const ids = liveReadProviders().map((p) => p.id);
  assert.ok(ids.includes("runpod"));
  assert.ok(ids.includes("lambda"));
  assert.ok(ids.includes("vast"));
  assert.ok(ids.includes("localhost_ollama"));
  assert.ok(ids.includes("shadeform"));
  assert.ok(ids.includes("massed-compute"));
  assert.ok(ids.includes("thunder-compute"));
  assert.ok(ids.includes("prime-intellect"));
  assert.ok(ids.includes("deep-infra-gpu"));
  assert.ok(ids.includes("digitalocean_gpu"));
  assert.ok(ids.includes("together-compute"));
  assert.equal(ids.includes("modal"), false);
  assert.equal(ids.includes("ssh"), false);
  assert.equal(ids.includes("jarvislabs"), false);
  assert.equal(providerAdapter("shadeform").authHeader, "x-api-key");
  assert.equal(providerAdapter("thunder-compute").operations.includes("read"), false);
  assert.equal(fillProviderPath("/instances/{id}/info", "12"), "/instances/12/info");
});

test("kebab/underscore catalog ids resolve to the live adapter without create", () => {
  assert.equal(resolveProviderId("localhost-ollama"), "localhost_ollama");
  assert.equal(resolveProviderId("localhost-lmstudio"), "localhost_lmstudio");
  assert.equal(resolveProviderId("vastai"), "vast");
  assert.equal(providerAdapter("localhost-ollama").id, "localhost_ollama");
  assert.equal(isLiveReadProvider("localhost-ollama"), true);
  assert.equal(isLiveReadProvider("localhost-lmstudio"), true);
  assert.equal(usesMainProcessRead("runpod"), true);
  assert.equal(usesMainProcessRead("shadeform"), true);
  assert.equal(usesMainProcessRead("digitalocean-gpu"), true);
  assert.equal(usesMainProcessRead("localhost-ollama"), false);
  assert.equal(usesMainProcessRead("modal"), false);
  assert.equal(resolveProviderId("digitalocean-gpu"), "digitalocean_gpu");
  const opts = uniqueConnectionOptions([
    { id: "localhost_ollama" },
    { id: "localhost-ollama" },
    { id: "runpod" },
  ]);
  assert.deepEqual(
    opts.map((row) => row.id),
    ["localhost_ollama", "runpod"],
  );
});
