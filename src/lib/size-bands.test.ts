import assert from "node:assert/strict";
import { test } from "node:test";
import {
  catalogIsReuse,
  classifyDerived,
  keepHubCandidate,
  parseParamBreakdown,
  parseParamsB,
  pickTopPerBand,
  recommendPath,
  sizeBandOf,
} from "./size-bands.ts";

test("parseParamsB prefers the size token over Qwen version numbers", () => {
  assert.equal(parseParamsB("Qwen3.8-27B-Uncensored-GGUF"), 27);
  assert.equal(parseParamsB("Qwen3.5-9B-The-Defiant"), 9);
  assert.equal(parseParamsB("Qwen2.5-Coder-3B-Instruct-heretic-GGUF"), 3);
  assert.equal(parseParamsB("Qwen3-4B-Instruct-2507-heretic-GGUF"), 4);
  assert.equal(parseParamsB("Qwen3.6-35B-A3B-Uncensored"), 3);
  assert.equal(parseParamsB("gemma-4-12b-heretic"), 12);
  assert.equal(parseParamsB("Huihui-DeepSeek-V4-Flash"), null);
});

test("parseParamsB treats E4B/A3B as active parameters", () => {
  assert.equal(parseParamsB("Gemma-4-E4B"), 4);
  assert.equal(parseParamsB("Qwen3.8-27B-A3B"), 3);
  const gemma = parseParamBreakdown("Gemma-4-E4B");
  assert.equal(gemma.activeB, 4);
  assert.equal(gemma.totalB, 4);
  assert.equal(gemma.source, "moe-active");
  const moe = parseParamBreakdown("Qwen3.8-27B-A3B");
  assert.equal(moe.activeB, 3);
  assert.equal(moe.totalB, 27);
  assert.equal(moe.source, "moe-active");
  const plain = parseParamBreakdown("Qwen3-4B-Instruct");
  assert.equal(plain.activeB, 4);
  assert.equal(plain.totalB, 4);
  assert.equal(plain.source, "named");
});

test("sizeBandOf buckets 4B as small and 35B as xl", () => {
  assert.equal(sizeBandOf(0.6), "nano");
  assert.equal(sizeBandOf(3), "tiny");
  assert.equal(sizeBandOf(4), "small");
  assert.equal(sizeBandOf(9), "medium");
  assert.equal(sizeBandOf(27), "large");
  assert.equal(sizeBandOf(35), "xl");
  assert.equal(sizeBandOf(122), "xxl");
});

test("recommendPath reuses GGUF heretic and does not re-ablate", () => {
  const reuse = recommendPath({ derived: "heretic", gguf: true });
  assert.equal(reuse.kind, "reuse-gguf");
  assert.deepEqual(reuse.methods, []);
  assert.deepEqual(reuse.outputs, ["ollama", "docker"]);
  const base = recommendPath({ derived: "base", gguf: false });
  assert.equal(base.kind, "ablate");
  assert.deepEqual(base.methods, ["heretic"]);
});

test("pickTopPerBand drops zero-download forks and keeps a 4B GGUF", () => {
  const now = Date.parse("2026-09-16T12:00:00Z");
  const bands = pickTopPerBand(
    [
      {
        id: "ijohn07/Ornith-1.0-9B-heretic-Q4_K_M-GGUF",
        downloads: 0,
        likes: 0,
        gguf: true,
        gated: false,
        lastModified: "2026-09-15T00:00:00Z",
        tags: ["gguf", "heretic"],
      },
      {
        id: "bartowski/p-e-w_Qwen3-4B-Instruct-2507-heretic-GGUF",
        downloads: 3285,
        likes: 12,
        gguf: true,
        gated: false,
        lastModified: "2025-11-17T00:00:00Z",
        tags: ["gguf", "heretic"],
      },
      {
        id: "JonathanColetti/Qwen3.8-27B-Uncensored-GGUF",
        downloads: 2_821_345,
        likes: 1122,
        gguf: true,
        gated: false,
        tags: ["gguf", "uncensored"],
      },
    ],
    3,
    now,
  );
  assert.equal(keepHubCandidate({ id: "x", downloads: 0, likes: 0, gguf: true, gated: false }, now), false);
  assert.equal(bands.small[0]?.id, "bartowski/p-e-w_Qwen3-4B-Instruct-2507-heretic-GGUF");
  assert.equal(bands.small[0]?.path.kind, "reuse-gguf");
  assert.equal(bands.large[0]?.id, "JonathanColetti/Qwen3.8-27B-Uncensored-GGUF");
  assert.equal(classifyDerived("foo-heretic-GGUF", ["gguf"]), "heretic");
  assert.equal(bands.medium.length, 0);
});

test("pickTopPerBand prefers an unabliterated instruct base over a heretic GGUF in the same band", () => {
  const now = Date.parse("2026-09-16T12:00:00Z");
  const bands = pickTopPerBand(
    [
      {
        id: "bartowski/p-e-w_Qwen3-4B-Instruct-2507-heretic-GGUF",
        downloads: 3285,
        likes: 12,
        gguf: true,
        gated: false,
        lastModified: "2025-11-17T00:00:00Z",
        tags: ["gguf", "heretic"],
      },
      {
        id: "Qwen/Qwen3-4B-Instruct-2507",
        downloads: 4100,
        likes: 80,
        gguf: false,
        gated: false,
        lastModified: "2026-09-01T00:00:00Z",
        tags: ["transformers", "text-generation"],
      },
    ],
    3,
    now,
  );
  assert.equal(bands.small[0]?.id, "Qwen/Qwen3-4B-Instruct-2507");
  assert.equal(bands.small[0]?.path.kind, "ablate");
  assert.equal(bands.small[1]?.id, "bartowski/p-e-w_Qwen3-4B-Instruct-2507-heretic-GGUF");
});

test("catalogIsReuse treats heretic/abliterated/uncensored names as reuse, official instruct as work", () => {
  assert.equal(catalogIsReuse({ id: "qwen3-4b", name: "Qwen/Qwen3-4B-Instruct-2507", derived: "base" }), false);
  assert.equal(
    catalogIsReuse({
      id: "qwen3-4b-h-gguf",
      name: "bartowski/p-e-w_Qwen3-4B-Instruct-2507-heretic-GGUF",
      derived: "heretic",
    }),
    true,
  );
  assert.equal(
    catalogIsReuse({
      id: "qwen122b",
      name: "HauhauCS/Qwen3.5-122B-A10B-Uncensored-HauhauCS-Aggressive",
    }),
    true,
  );
});
