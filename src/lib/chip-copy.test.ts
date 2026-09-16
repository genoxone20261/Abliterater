import assert from "node:assert/strict";
import { test } from "node:test";
import { CHIP, chipCopy } from "./chip-copy.ts";

const PURPOSE_IDS = ["uncensored", "abliterated", "domain", "pipeline"] as const;
const DOMAIN_IDS = [
  "general",
  "math",
  "physics",
  "engineering",
  "biology",
  "biotech",
  "cyber-red",
  "cyber-blue",
  "military",
] as const;
const METHOD_IDS = [
  "heretic",
  "obliteratus",
  "failspy",
  "deccp",
  "erisforge",
  "gabliteration",
  "apostate",
  "abliterix",
  "ablate",
  "jwest",
  "jimplus",
  "llmabliterate",
  "unfetter",
  "cast",
  "sft-unc",
  "lora-dpo",
  "domain-ablate",
  "rag-first",
  "cpt",
  "dsmoe",
  "quant",
  "exl2",
  "awq",
  "mergekit",
  "eval-pack",
] as const;
const STORE_IDS = ["local", "s3", "gcs", "azure", "hf", "minio", "nfs"] as const;
const OUTPUT_IDS = [
  "sft-adapter",
  "merged-bf16",
  "gguf-q4",
  "gguf-q5",
  "gguf-q8",
  "ollama",
  "hf-private",
  "onnx",
  "openvino",
  "docker",
] as const;

test("chip dictionaries have identical keys", () => {
  assert.deepEqual(Object.keys(CHIP.ko).sort(), Object.keys(CHIP.en).sort());
});

test("English chip copy has no Hangul", () => {
  for (const [key, value] of Object.entries(CHIP.en)) {
    assert.equal(/[가-힣]/.test(value), false, key);
  }
});

test("every purpose/domain/method/store/output chip has overlay keys", () => {
  for (const id of PURPOSE_IDS) {
    assert.ok(chipCopy("purpose", id, "title", "", "en"), id);
    assert.ok(chipCopy("purpose", id, "blurb", "", "en"), id);
  }
  for (const id of DOMAIN_IDS) {
    assert.ok(chipCopy("domain", id, "title", "", "en"), id);
    assert.ok(chipCopy("domain", id, "note", "", "en"), id);
  }
  for (const id of METHOD_IDS) {
    assert.ok(chipCopy("method", id, "title", "", "en"), id);
    assert.ok(chipCopy("method", id, "blurb", "", "en"), id);
  }
  for (const id of STORE_IDS) {
    assert.ok(chipCopy("store", id, "title", "", "en"), id);
  }
  for (const id of OUTPUT_IDS) {
    assert.ok(chipCopy("output", id, "title", "", "en"), id);
  }
});
