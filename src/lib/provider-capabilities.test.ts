import test from "node:test";
import assert from "node:assert/strict";
import {
  PROVIDER_CAPABILITIES,
  validateBudget,
  BUDGET_ERROR,
  capabilityOf,
  computeRuntimeKind,
} from "./provider-capabilities.ts";
import { isLiveReadProvider, uniqueConnectionOptions } from "./provider-registry.ts";

test("capability matrix is explicit and does not overclaim lifecycle-live", () => {
  assert.equal(PROVIDER_CAPABILITIES.find((x) => x.id === "runpod")?.tier, "auth-contract");
  assert.equal(PROVIDER_CAPABILITIES.find((x) => x.id === "runpod")?.create, true);
  assert.equal(PROVIDER_CAPABILITIES.find((x) => x.id === "lambda")?.create, true);
  assert.equal(PROVIDER_CAPABILITIES.find((x) => x.id === "vast")?.create, true);
  assert.notEqual(PROVIDER_CAPABILITIES.find((x) => x.id === "runpod")?.tier, "lifecycle-live");
  assert.equal(PROVIDER_CAPABILITIES.find((x) => x.id === "modal")?.create, false);
  assert.ok(PROVIDER_CAPABILITIES.every((x) => x.officialDocs.startsWith("https://")));
  assert.ok(PROVIDER_CAPABILITIES.every((x) => !x.officialDocs.includes("google.com/search")));
});

test("budget guard requires acknowledgement and hard limits", () => {
  assert.match(
    validateBudget({
      maxUsd: 10,
      maxMinutes: 60,
      estimatedUsdPerHour: 2,
      acknowledged: false,
    }).join(" "),
    new RegExp(BUDGET_ERROR.ack),
  );
  assert.deepEqual(
    validateBudget({ maxUsd: 10, maxMinutes: 60, estimatedUsdPerHour: 2, acknowledged: true }),
    [],
  );
  assert.match(
    validateBudget({ maxUsd: 1, maxMinutes: 60, estimatedUsdPerHour: 2, acknowledged: true }).join(
      " ",
    ),
    new RegExp(BUDGET_ERROR.over),
  );
});

test("capabilityOf resolves localhost underscore/hyphen aliases", () => {
  assert.equal(capabilityOf("localhost-ollama")?.id, "localhost-ollama");
  assert.ok(capabilityOf("localhost_ollama"));
});

test("connection select collapses hyphen/underscore live aliases", () => {
  const opts = uniqueConnectionOptions(PROVIDER_CAPABILITIES);
  const ids = opts.map((row) => row.id);
  assert.equal(
    ids.filter((id) => id === "localhost_ollama" || id === "localhost-ollama").length,
    1,
  );
  assert.ok(opts.some((row) => row.id === "runpod" && isLiveReadProvider(row.id)));
  assert.ok(opts.some((row) => row.id === "vast" && isLiveReadProvider(row.id)));
  assert.ok(opts.some((row) => row.id === "shadeform" && isLiveReadProvider(row.id)));
  assert.ok(opts.some((row) => row.id === "massed-compute" && isLiveReadProvider(row.id)));
  assert.ok(opts.some((row) => isLiveReadProvider(row.id) && row.id.includes("lmstudio")));
  assert.ok(opts.some((row) => row.id === "digitalocean-gpu" && isLiveReadProvider(row.id)));
  assert.ok(opts.some((row) => row.id === "together-compute" && isLiveReadProvider(row.id)));
  assert.equal(capabilityOf("shadeform")?.list, true);
  assert.equal(capabilityOf("thunder-compute")?.read, false);
  assert.equal(capabilityOf("jarvislabs")?.list, false);
});

test("computeRuntimeKind is local/create/pack-only without claiming submit", () => {
  assert.equal(computeRuntimeKind("local-cuda"), "local");
  assert.equal(computeRuntimeKind("localhost-ollama"), "local");
  assert.equal(computeRuntimeKind("localhost_ollama"), "local");
  assert.equal(computeRuntimeKind("runpod"), "create");
  assert.equal(computeRuntimeKind("lambda"), "create");
  assert.equal(computeRuntimeKind("vast"), "create");
  assert.equal(computeRuntimeKind("skypilot"), "pack-only");
  assert.equal(capabilityOf("runpod")?.create, true);
  assert.equal(capabilityOf("modal")?.create, false);
});
