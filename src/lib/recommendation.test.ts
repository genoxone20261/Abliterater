import test from "node:test";
import assert from "node:assert/strict";
import {
  estimateModelMemory,
  recommendForHardware,
  normalizeHardwareProfile,
  suggestGoldenWorkloads,
  goldenStudioPatch,
  GOLDEN_WORKLOADS,
  GiB,
} from "./recommendation.ts";

const MODELS = [
  { id: "foundation-sec", name: "Foundation Sec", vram: 8 },
  { id: "orcarouter-27b", name: "Unknown provenance model", vram: 24 },
] as const;

const eightGb = normalizeHardwareProfile({
  gpus: [{ vendor: "nvidia", name: "RTX", memoryBytes: 8 * GiB, memoryEvidence: "manual" }],
});
const twelveGb = normalizeHardwareProfile({
  gpus: [{ vendor: "nvidia", name: "RTX", memoryBytes: 12 * GiB, memoryEvidence: "observed" }],
  memory: { totalBytes: 64 * GiB },
});

test("model memory estimates separate inference, qlora, lora, heretic and full", () => {
  const sevenB = estimateModelMemory({ parametersB: 7, contextTokens: 4096 });
  assert.ok(sevenB.inferenceBytes < sevenB.qloraBytes);
  assert.ok(sevenB.qloraBytes < sevenB.loraBytes);
  assert.ok(sevenB.loraBytes < sevenB.fullFinetuneBytes);
  assert.ok(sevenB.heretic4bitBytes < sevenB.hereticBf16Bytes);
  assert.ok(sevenB.inferenceQ4Bytes < sevenB.inferenceBf16Bytes);
  assert.equal(sevenB.evidence, "estimated");
});

test("recommendations fit local observed VRAM and block redundant ablation", () => {
  const recs = recommendForHardware({ hardware: twelveGb, models: MODELS, workload: "inference" });
  assert.ok(recs.some((r) => r.model.id === "foundation-sec" && r.fit === "fit"));
  const derived = recommendForHardware({
    hardware: twelveGb,
    models: [
      { id: "documented-derived", name: "Documented model", vram: 8, derived: "abliterated" },
    ],
    workload: "inference",
  });
  assert.equal(derived[0].operations.ablation, "redundant");
  assert.equal(recs.find((r) => r.model.id === "orcarouter-27b")?.operations.ablation, "unknown");
});

test("unknown hardware never pretends support", () => {
  const recs = recommendForHardware({
    hardware: normalizeHardwareProfile(null),
    models: MODELS,
    workload: "qlora",
  });
  assert.ok(recs.every((r) => r.fit === "unknown"));
  assert.ok(recs.every((r) => r.golden === null));
});

test("lora and qlora no longer share the same required bytes", () => {
  const [lora] = recommendForHardware({
    hardware: twelveGb,
    models: [{ id: "m7", name: "7B", vram: 14, parametersB: 7 }],
    workload: "lora",
  });
  const [qlora] = recommendForHardware({
    hardware: twelveGb,
    models: [{ id: "m7", name: "7B", vram: 14, parametersB: 7 }],
    workload: "qlora",
  });
  assert.ok(qlora.requiredBytes != null && lora.requiredBytes != null);
  assert.ok(qlora.requiredBytes < lora.requiredBytes);
  assert.equal(qlora.fit, "fit");
  assert.notEqual(lora.fit, "fit");
});

test("8 GiB heretic: 4B min-path can fit, 27B does not", () => {
  const recs = recommendForHardware({
    hardware: eightGb,
    models: [
      { id: "q4", name: "4B", vram: 8, parametersB: 4, derived: "base" },
      { id: "q27", name: "27B", vram: 24, parametersB: 27, derived: "base" },
    ],
    workload: "heretic",
  });
  assert.equal(recs.find((r) => r.model.id === "q4")?.fit, "fit");
  assert.equal(recs.find((r) => r.model.id === "q27")?.fit, "no-fit");
  assert.equal(recs[0].operations.ablation, "supported");
  assert.ok(recs[0].recommendedBytes != null && recs[0].requiredBytes != null);
  assert.ok(recs[0].recommendedBytes > recs[0].requiredBytes);
});

test("MoE heretic uses total params; inference may use active experts", () => {
  const moe = {
    id: "m122",
    name: "122A10",
    vram: 96,
    parametersB: 122,
    activeParametersB: 10,
  };
  const inf = recommendForHardware({
    hardware: twelveGb,
    models: [moe],
    workload: "inference",
  })[0];
  const her = recommendForHardware({
    hardware: twelveGb,
    models: [moe],
    workload: "heretic",
  })[0];
  assert.ok(inf.requiredBytes != null && her.requiredBytes != null);
  assert.ok(inf.requiredBytes < her.requiredBytes);
  assert.equal(her.fit, "no-fit");
});

test("golden workloads filter by card VRAM and stay estimated", () => {
  const eight = suggestGoldenWorkloads(8 * GiB);
  assert.ok(eight.some((g) => g.id === "heretic-0.6b"));
  assert.ok(eight.some((g) => g.id === "qlora-7b"));
  assert.ok(!eight.some((g) => g.id === "lora-7b"));
  assert.ok(eight.every((g) => g.evidence === "estimated"));
  assert.equal(suggestGoldenWorkloads(null).length, 0);
  assert.equal(suggestGoldenWorkloads(0).length, 0);
  assert.equal(GOLDEN_WORKLOADS.length, 8);
});

test("heretic merge RAM is separate from VRAM fit and can be tight", () => {
  const tight = recommendForHardware({
    hardware: normalizeHardwareProfile({
      gpus: [{ vendor: "nvidia", name: "RTX", memoryBytes: 24 * GiB }],
      memory: { totalBytes: 16 * GiB },
    }),
    models: [{ id: "q27", name: "27B", vram: 24, parametersB: 27, derived: "base" }],
    workload: "heretic",
  })[0];
  assert.equal(tight.ramFit, "tight");
  assert.ok(tight.mergeRamBytes != null && tight.mergeRamBytes > 16 * GiB);
  const infer = recommendForHardware({
    hardware: twelveGb,
    models: [{ id: "q4", name: "4B", vram: 8, parametersB: 4, derived: "base" }],
    workload: "inference",
  })[0];
  assert.equal(infer.mergeRamBytes, null);
  assert.equal(infer.ramFit, "unknown");
});

test("golden studio patch prefers unabliterated nearest base and is not a runner", () => {
  const models = [
    { id: "qwen3-4b-h", name: "heretic 4B", vram: 8, parametersB: 4, derived: "heretic" as const },
    { id: "qwen3-4b", name: "base 4B", vram: 8, parametersB: 4, derived: "base" as const },
    { id: "qwen3-06b", name: "base 0.6B", vram: 4, parametersB: 0.6, derived: "base" as const },
  ];
  const four = goldenStudioPatch(
    GOLDEN_WORKLOADS.find((g) => g.id === "heretic-4b")!,
    models,
  );
  assert.equal(four?.base, "qwen3-4b");
  assert.equal(four?.purpose, "abliterated");
  assert.deepEqual(four?.methods, ["heretic"]);
  assert.equal(four?.modelSource, "catalog");
  const tiny = goldenStudioPatch(
    GOLDEN_WORKLOADS.find((g) => g.id === "heretic-0.6b")!,
    models,
  );
  assert.equal(tiny?.base, "qwen3-06b");
  const infer = goldenStudioPatch(
    GOLDEN_WORKLOADS.find((g) => g.id === "infer-8b-q4")!,
    models,
  );
  assert.equal(infer?.base, "qwen3-4b-h");
  assert.deepEqual(infer?.methods, []);
  assert.deepEqual(infer?.outputs, ["ollama", "docker"]);
  const qlora = goldenStudioPatch(
    GOLDEN_WORKLOADS.find((g) => g.id === "qlora-7b")!,
    models,
  );
  assert.equal(qlora?.purpose, "domain");
  assert.deepEqual(qlora?.methods, ["lora-dpo"]);
  assert.equal(goldenStudioPatch(GOLDEN_WORKLOADS[0], []), null);
});

test("80B+ heretic is no-fit even when 4-bit math would fit the card", () => {
  const card = normalizeHardwareProfile({
    gpus: [{ vendor: "nvidia", name: "H200", memoryBytes: 141 * GiB }],
  });
  const her = recommendForHardware({
    hardware: card,
    models: [{ id: "m122", name: "122A10", vram: 96, parametersB: 122, activeParametersB: 10 }],
    workload: "heretic",
  })[0];
  const inf = recommendForHardware({
    hardware: card,
    models: [{ id: "m122", name: "122A10", vram: 96, parametersB: 122, activeParametersB: 10 }],
    workload: "inference",
  })[0];
  assert.equal(her.fit, "no-fit");
  assert.match(her.reason, /streaming unsupported/);
  assert.equal(inf.fit, "fit");
});

test("284B GGUF catalog heretic stays no-fit on 80 GiB", () => {
  const [row] = recommendForHardware({
    hardware: normalizeHardwareProfile({
      gpus: [{ memoryBytes: 80 * GiB }],
    }),
    models: [
      { id: "v4flash", name: "V4 Flash", vram: 80, parametersB: 284, derived: "abliterated" },
    ],
    workload: "heretic",
  });
  assert.equal(row.fit, "no-fit");
  assert.equal(row.operations.ablation, "redundant");
});
