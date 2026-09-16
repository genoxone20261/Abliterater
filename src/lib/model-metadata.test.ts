import test from "node:test";
import assert from "node:assert/strict";
import { createMetadataCache, mapHfMetadata } from "./model-metadata.ts";

test("HF metadata preserves revision, license, size and access state", () => {
  const model = mapHfMetadata({
    id: "org/model",
    sha: "a".repeat(40),
    lastModified: "2026-01-01T00:00:00Z",
    private: true,
    gated: "auto",
    pipeline_tag: "text-generation",
    config: { model_type: "qwen2", num_parameters: 7000000000 },
    siblings: [{ rfilename: "model.safetensors", size: 14000000000 }, { rfilename: "README.md" }],
    cardData: { license: "apache-2.0" },
  });
  assert.equal(model.revision, "a".repeat(40));
  assert.equal(model.parametersB, 7);
  assert.equal(model.safetensorsBytes, 14000000000);
  assert.equal(model.license, "apache-2.0");
  assert.equal(model.access, "private-gated");
});

test("metadata cache caps entries and expires without persisting secrets", async () => {
  const cache = createMetadataCache({ maxEntries: 1, ttlMs: 1 });
  await cache.set("org/a", { id: "org/a", revision: "b".repeat(40) });
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(cache.get("org/a"), undefined);
  await cache.set("org/a", { id: "org/a", revision: "b".repeat(40) });
  await cache.set("org/b", { id: "org/b", revision: "c".repeat(40) });
  assert.equal(cache.get("org/a"), undefined);
});
