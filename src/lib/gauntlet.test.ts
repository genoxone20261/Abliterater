/**
 * Abliterater gauntlet — covers presets, model-source.auditWorkflow,
 * and studio.DEFAULT_STATE. Each test is self-contained and needs no network.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { auditWorkflow, flowHasBlock } from "./model-source.ts";
import { BASES, DEFAULT_STATE } from "./studio.ts";

// ─── Pin SHA cross-consistency (runners ↔ catalog) ───────────────────────

test("pin SHAs are cross-consistent across runners and catalog", () => {
  const runners = readFileSync("src/lib/runners.ts", "utf8");
  const catalog = readFileSync("src/lib/catalog.ts", "utf8");

  // Only include pins that are actually mirrored in catalog.ts.
  // pack.ts has its own dedicated stale-SHA guard in pack.assert.test.ts.
  const sharedPins = [
    ["heretic", "3521f864"],
    ["OBLITERATUS", "205d28a1"],
    ["ablate", "6b89bea1"],
    ["model-unfetter", "4c9548c2"],
    ["gabliteration", "1498fc7"],
    ["jwest", "6ca3356"],
    ["deccp", "1a6d557"],
    ["llm-abliterate", "f01cec9"],
  ] as const;

  for (const [name, prefix] of sharedPins) {
    assert.ok(runners.includes(prefix), `runners.ts missing pin ${name} ${prefix}`);
    assert.ok(catalog.includes(prefix), `catalog.ts missing pin ${name} ${prefix}`);
  }
});

test("no bare 'git clone --depth 1' unpinned patterns in pack sources", () => {
  const pack = readFileSync("src/lib/pack.ts", "utf8");
  // The repo disallows unpinned floating master clones (was the llama.cpp
  // security issue prior to SHA pinning — see 00_master_todo §9)
  const depth1Clones = pack.match(/git\s+clone\s+--depth\s+1\s+https:\/\/github\.com/gi);
  assert.equal(depth1Clones, null, `unpinned --depth 1 clones found: ${depth1Clones?.join(", ")}`);
});

// ─── Presets ──────────────────────────────────────────────────────────────

test("DEFAULT_STATE.modelSource is a valid string", () => {
  assert.equal(typeof DEFAULT_STATE.modelSource, "string");
  assert.ok(DEFAULT_STATE.modelSource.length > 0);
});

test("DEFAULT_STATE.compute is local, not Azure-centered", () => {
  assert.equal(DEFAULT_STATE.compute, "local-cuda");
  assert.equal("azureCpu" in DEFAULT_STATE, false);
  assert.equal("azureRegion" in DEFAULT_STATE, false);
  assert.equal("azureSpot" in DEFAULT_STATE, false);
  assert.equal("azureCredit" in DEFAULT_STATE, false);
});

test("DEFAULT_STATE.methods and outputs are arrays", () => {
  assert.ok(Array.isArray(DEFAULT_STATE.methods));
  assert.ok(Array.isArray(DEFAULT_STATE.outputs));
});

test("DEFAULT_STATE.base is set", () => {
  assert.equal(typeof DEFAULT_STATE.base, "string");
  assert.ok(DEFAULT_STATE.base.length > 0);
});

test("DEFAULT_STATE starts on an unabliterated catalog base for Heretic work", () => {
  const card = BASES.find((b) => b.id === DEFAULT_STATE.base);
  assert.ok(card, DEFAULT_STATE.base);
  assert.doesNotMatch(`${card.id} ${card.name}`, /heretic|abliterat|uncensor/i);
  assert.ok(DEFAULT_STATE.methods.includes("heretic"));
  assert.equal(DEFAULT_STATE.purpose, "abliterated");
});

test("DEFAULT_STATE.purpose is one of allowed", () => {
  const allowed = ["uncensored", "abliterated", "domain", "pipeline"];
  assert.ok(allowed.includes(DEFAULT_STATE.purpose));
});

// ─── auditWorkflow ─────────────────────────────────────────────────────────

test("auditWorkflow returns array of steps", () => {
  const result = auditWorkflow({ ...DEFAULT_STATE });
  assert.ok(Array.isArray(result));
  assert.ok(result.length >= 3);
});

test("auditWorkflow — hf source, no repo → block", () => {
  const result = auditWorkflow({
    ...DEFAULT_STATE,
    modelSource: "hf",
    base: "qwen3-4b-h",
    hfRepo: "",
  });
  const block = result.find((s) => s.status === "block");
  assert.ok(block, "HF without hfRepo must block");
});

test("auditWorkflow — api source needs apiBaseUrl + apiModel", () => {
  const result = auditWorkflow({
    ...DEFAULT_STATE,
    modelSource: "api",
    base: "qwen3-4b-h",
    apiBaseUrl: "",
    apiModel: "",
  });
  const block = result.find((s) => s.status === "block");
  assert.ok(block, "API source without base+model must block");
});

test("auditWorkflow — local source needs localPath", () => {
  const result = auditWorkflow({
    ...DEFAULT_STATE,
    modelSource: "local",
    base: "qwen3-4b-h",
    localPath: "",
  });
  const block = result.find((s) => s.status === "block");
  assert.ok(block, "local source without path must block");
});

test("auditWorkflow — valid catalog flow → no blocks", () => {
  const result = auditWorkflow({ ...DEFAULT_STATE });
  assert.equal(
    result.filter((s) => s.status === "block").length,
    0,
    "valid catalog flow must not block",
  );
  assert.ok(!flowHasBlock(result), "flowHasBlock must be false");
});

test("auditWorkflow — heretic method without base → block", () => {
  const result = auditWorkflow({
    ...DEFAULT_STATE,
    methods: ["heretic"],
    base: "",
  });
  const block = result.find((s) => s.status === "block");
  assert.ok(block, "heretic without base must block");
});

test("auditWorkflow — returns array with all expected step ids", () => {
  const result = auditWorkflow({ ...DEFAULT_STATE });
  const ids = result.map((s) => s.id);
  assert.ok(ids.includes("base"), "must include base step");
  assert.ok(ids.includes("pack"), "must include pack step");
});

test("auditWorkflow — api source skips train and quant", () => {
  const result = auditWorkflow({
    ...DEFAULT_STATE,
    modelSource: "api",
    base: "qwen3-4b-h",
    apiBaseUrl: "http://127.0.0.1:11434/v1",
    apiModel: "llama3",
  });
  const train = result.find((s) => s.id === "train");
  const quant = result.find((s) => s.id === "quant");
  assert.equal(train?.status, "skip");
  assert.equal(quant?.status, "skip");
});

test("auditWorkflow — all step ids are unique", () => {
  const result = auditWorkflow({ ...DEFAULT_STATE });
  const ids = result.map((s) => s.id);
  const unique = new Set(ids);
  assert.equal(unique.size, ids.length, "step ids must be unique");
});

test("auditWorkflow — empty base for catalog source → block", () => {
  const result = auditWorkflow({
    ...DEFAULT_STATE,
    modelSource: "catalog",
    base: "",
  });
  const block = result.find((s) => s.status === "block");
  assert.ok(block, "catalog without base must block");
});

test("auditWorkflow — flowHasBlock returns boolean", () => {
  const result = auditWorkflow({ ...DEFAULT_STATE });
  assert.equal(typeof flowHasBlock(result), "boolean");
});

test("auditWorkflow — valid local flow with localPath", () => {
  const result = auditWorkflow({
    ...DEFAULT_STATE,
    modelSource: "local",
    base: "qwen3-4b-h",
    localPath: "/data/models/llama3",
  });
  const block = result.find((s) => s.status === "block");
  assert.ok(!block, "valid local flow should not block");
});

test("auditWorkflow — valid API flow with http base and model", () => {
  const result = auditWorkflow({
    ...DEFAULT_STATE,
    modelSource: "api",
    base: "qwen3-4b-h",
    apiBaseUrl: "http://127.0.0.1:11434/v1",
    apiModel: "llama3:8b",
  });
  const block = result.find((s) => s.status === "block");
  assert.ok(!block, "valid API flow should not block");
});

test("auditWorkflow English copy has no Hangul", () => {
  const result = auditWorkflow({ ...DEFAULT_STATE }, "en");
  for (const step of result) {
    assert.equal(
      /[가-힣]/.test(`${step.title}\n${step.detail}`),
      false,
      `${step.id}: ${step.detail}`,
    );
  }
});

test("auditWorkflow — remote compute without create is warn not ok", () => {
  const result = auditWorkflow({ ...DEFAULT_STATE, compute: "modal" }, "en");
  const step = result.find((s) => s.id === "compute");
  assert.equal(step?.status, "warn");
  assert.match(step?.detail ?? "", /modal/);
  assert.equal(/[가-힣]/.test(step?.detail ?? ""), false);
  assert.equal(flowHasBlock(result), false);
});

test("auditWorkflow — RunPod user-key create is ok not a live submit claim", () => {
  const result = auditWorkflow({ ...DEFAULT_STATE, compute: "runpod" }, "en");
  const step = result.find((s) => s.id === "compute");
  assert.equal(step?.status, "ok");
  assert.match(step?.detail ?? "", /runpod/);
  assert.equal(/[가-힣]/.test(step?.detail ?? ""), false);
});
