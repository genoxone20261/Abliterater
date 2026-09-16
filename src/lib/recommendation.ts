export type Workload = "inference" | "heretic" | "qlora" | "lora" | "full";
export type HardwareProfile = {
  gpus?: Array<{
    vendor?: string;
    name?: string;
    memoryBytes?: number | null;
    memoryEvidence?: string;
  }>;
  memory?: { totalBytes?: number };
};
export type ModelCandidate = {
  id: string;
  name: string;
  vram: number;
  rec?: readonly string[];
  derived?: "base" | "abliterated" | "heretic" | "uncensored-sft" | "quantized";
  parametersB?: number;
  activeParametersB?: number;
};
export type GoldenWorkload = {
  id: string;
  method: Workload;
  paramsB: number;
  minGiB: number;
  recGiB: number;
  evidence: "estimated";
};
export type GoldenStudioPatch = {
  base: string;
  purpose: "abliterated" | "domain" | "pipeline";
  methods: string[];
  modelSource: "catalog";
  outputs: string[];
};
export type Recommendation = {
  model: ModelCandidate;
  fit: "fit" | "conditional" | "no-fit" | "unknown";
  requiredBytes: number | null;
  recommendedBytes: number | null;
  availableBytes: number | null;
  mergeRamBytes: number | null;
  ramFit: "ok" | "tight" | "unknown";
  evidence: "observed" | "estimated" | "unknown";
  reason: string;
  operations: { ablation: "supported" | "redundant" | "unknown" };
  golden: GoldenWorkload | null;
};

export const GiB = 1024 ** 3;
/** Literature catalog date. Not a live Hub pull. */
export const CATALOG_AS_OF = "2026-09-12";
/** Heretic loads all experts; p-e-w/heretic#135 wontfix. */
export const HERETIC_NO_STREAM_PARAMS_B = 80;

/** Catalog of tiny/smoke jobs. Values are literature floors, not this-machine runs. */
export const GOLDEN_WORKLOADS: readonly GoldenWorkload[] = [
  {
    id: "heretic-0.6b",
    method: "heretic",
    paramsB: 0.6,
    minGiB: 4,
    recGiB: 8,
    evidence: "estimated",
  },
  { id: "heretic-4b", method: "heretic", paramsB: 4, minGiB: 8, recGiB: 12, evidence: "estimated" },
  { id: "qlora-3b", method: "qlora", paramsB: 3, minGiB: 6, recGiB: 10, evidence: "estimated" },
  { id: "qlora-7b", method: "qlora", paramsB: 7, minGiB: 8, recGiB: 14, evidence: "estimated" },
  { id: "lora-7b", method: "lora", paramsB: 7, minGiB: 16, recGiB: 24, evidence: "estimated" },
  {
    id: "infer-8b-q4",
    method: "inference",
    paramsB: 8,
    minGiB: 6,
    recGiB: 10,
    evidence: "estimated",
  },
  {
    id: "heretic-8b-4bit",
    method: "heretic",
    paramsB: 8,
    minGiB: 16,
    recGiB: 24,
    evidence: "estimated",
  },
  { id: "qlora-14b", method: "qlora", paramsB: 14, minGiB: 16, recGiB: 24, evidence: "estimated" },
];

export function normalizeHardwareProfile(value: unknown): HardwareProfile {
  if (!value || typeof value !== "object") return {};
  const rec = value as Record<string, unknown>;
  const memory =
    rec.memory && typeof rec.memory === "object" ? (rec.memory as Record<string, unknown>) : {};
  const gpus = Array.isArray(rec.gpus)
    ? rec.gpus.flatMap((gpu) => {
        if (!gpu || typeof gpu !== "object") return [];
        const g = gpu as Record<string, unknown>;
        return [
          {
            vendor: typeof g.vendor === "string" ? g.vendor : "unknown",
            name: typeof g.name === "string" ? g.name : "unknown",
            memoryBytes:
              typeof g.memoryBytes === "number" && Number.isFinite(g.memoryBytes)
                ? g.memoryBytes
                : null,
            memoryEvidence: typeof g.memoryEvidence === "string" ? g.memoryEvidence : "unknown",
          },
        ];
      })
    : [];
  return {
    gpus,
    memory: {
      totalBytes:
        typeof memory.totalBytes === "number" && Number.isFinite(memory.totalBytes)
          ? memory.totalBytes
          : undefined,
    },
  };
}

export function paramsOf(model: ModelCandidate, workload: Workload = "inference") {
  if (
    (workload === "inference" || workload === "qlora") &&
    typeof model.activeParametersB === "number" &&
    model.activeParametersB > 0
  ) {
    return model.activeParametersB;
  }
  if (typeof model.parametersB === "number" && model.parametersB > 0) return model.parametersB;
  return model.vram / 2;
}

/**
 * Estimated VRAM (and merge RAM) in bytes.
 * Sources mixed 2026-09-12: Heretic tutorial ~2.5 GiB/B BF16 process;
 * Heretic 1.2 4-bit ~0.6 GiB/B; LlamaFactory QLoRA-4 7B~6 / LoRA-16 7B~16;
 * merge RAM ~3× paramsB GiB. Not a this-session GPU run.
 */
export function estimateModelMemory(model: { parametersB: number; contextTokens?: number }) {
  const p = Math.max(0.1, model.parametersB);
  const kv = Math.max(0.5, (model.contextTokens || 4096) / 4096) * Math.max(0.4, p / 7) * GiB;
  const inferenceQ4Bytes = (p * 0.7 + 1.5) * GiB + kv;
  const inferenceBytes = inferenceQ4Bytes;
  const inferenceBf16Bytes = (p * 2.2 + 2) * GiB + kv;
  const heretic4bitBytes = (p * 0.7 + 2) * GiB + kv;
  const hereticBf16Bytes = (p * 2.5 + 2) * GiB + kv;
  const qloraBytes = (p * 0.85 + 2) * GiB + kv;
  const loraBytes = (p * 2.2 + 4) * GiB + kv;
  const fullFinetuneBytes = (p * 16 + 8) * GiB + kv;
  const mergeRamBytes = p * 3 * GiB;
  return {
    inferenceBytes,
    inferenceQ4Bytes,
    inferenceBf16Bytes,
    heretic4bitBytes,
    hereticBf16Bytes,
    qloraBytes,
    loraBytes,
    fullFinetuneBytes,
    mergeRamBytes,
    evidence: "estimated" as const,
  };
}

function pairForWorkload(
  estimate: ReturnType<typeof estimateModelMemory>,
  workload: Workload,
): { min: number; rec: number } {
  switch (workload) {
    case "inference":
      return { min: estimate.inferenceQ4Bytes, rec: estimate.inferenceBf16Bytes };
    case "heretic":
      return { min: estimate.heretic4bitBytes, rec: estimate.hereticBf16Bytes };
    case "qlora":
      return { min: estimate.qloraBytes, rec: estimate.qloraBytes * 1.35 };
    case "lora":
      return { min: estimate.loraBytes, rec: estimate.loraBytes * 1.25 };
    default:
      return { min: estimate.fullFinetuneBytes, rec: estimate.fullFinetuneBytes * 1.15 };
  }
}

/** Unknown VRAM must not claim “this card can attempt”. */
export function suggestGoldenWorkloads(availableBytes: number | null): GoldenWorkload[] {
  if (availableBytes === null || availableBytes <= 0) return [];
  return GOLDEN_WORKLOADS.filter((g) => availableBytes >= g.minGiB * GiB);
}

/**
 * Studio settings only. Does not start Heretic/QLoRA/pack.
 * Prefers an unabliterated catalog base nearest to the golden size.
 */
export function goldenStudioPatch(
  g: GoldenWorkload,
  models: readonly ModelCandidate[],
): GoldenStudioPatch | null {
  if (!models.length) return null;
  const purpose: GoldenStudioPatch["purpose"] =
    g.method === "heretic" ? "abliterated" : g.method === "inference" ? "pipeline" : "domain";
  const methods =
    g.method === "heretic" ? ["heretic"] : g.method === "inference" ? [] : ["lora-dpo"];
  const outputs =
    g.method === "inference"
      ? ["ollama", "docker"]
      : g.method === "heretic"
        ? ["merged-bf16"]
        : ["sft-adapter"];
  const scored = models.map((m) => {
    const p = typeof m.parametersB === "number" && m.parametersB > 0 ? m.parametersB : m.vram / 2;
    const alreadyDone =
      m.derived === "heretic" ||
      m.derived === "abliterated" ||
      m.derived === "uncensored-sft" ||
      m.derived === "quantized";
    const derivedPenalty = g.method === "heretic" && alreadyDone ? 1000 : 0;
    const reuseBonus = g.method === "inference" && alreadyDone ? -1000 : 0;
    return { m, score: Math.abs(p - g.paramsB) + derivedPenalty + reuseBonus };
  });
  scored.sort((a, b) => a.score - b.score);
  return {
    base: scored[0].m.id,
    purpose,
    methods,
    modelSource: "catalog",
    outputs,
  };
}

export function recommendForHardware({
  hardware,
  models,
  workload,
}: {
  hardware: HardwareProfile;
  models: readonly ModelCandidate[];
  workload: Workload;
}): Recommendation[] {
  const available = hardware.gpus?.length
    ? Math.max(...hardware.gpus.map((g) => g.memoryBytes || 0))
    : null;
  const ram = hardware.memory?.totalBytes ?? null;
  const goldens = suggestGoldenWorkloads(available);
  return models.map((model) => {
    const estimate = estimateModelMemory({ parametersB: paramsOf(model, workload) });
    const { min, rec } = pairForWorkload(estimate, workload);
    const totalParams =
      typeof model.parametersB === "number" && model.parametersB > 0
        ? model.parametersB
        : model.vram / 2;
    const hereticNoStream = workload === "heretic" && totalParams >= HERETIC_NO_STREAM_PARAMS_B;
    const fit =
      available === null || available <= 0
        ? "unknown"
        : hereticNoStream
          ? "no-fit"
          : available >= min * 1.1
            ? "fit"
            : available >= min * 0.85
              ? "conditional"
              : "no-fit";
    const ablation =
      model.derived === "abliterated" ||
      model.derived === "heretic" ||
      model.derived === "uncensored-sft"
        ? "redundant"
        : model.derived === "base"
          ? "supported"
          : "unknown";
    const mergeRamBytes =
      workload === "heretic" || workload === "lora" || workload === "full"
        ? estimate.mergeRamBytes
        : null;
    const ramFit =
      mergeRamBytes == null || ram == null || ram <= 0
        ? "unknown"
        : ram >= mergeRamBytes
          ? "ok"
          : "tight";
    const golden =
      goldens.find((g) => g.method === workload) ??
      goldens.find((g) => g.method === "heretic") ??
      goldens[0] ??
      null;
    return {
      model,
      fit,
      requiredBytes: min,
      recommendedBytes: rec,
      availableBytes: available,
      mergeRamBytes,
      ramFit,
      evidence: available ? "estimated" : "unknown",
      reason: hereticNoStream
        ? "Heretic loads all experts; layer streaming unsupported (estimated)"
        : available
          ? `${(min / GiB).toFixed(1)} GiB min / ${(rec / GiB).toFixed(1)} GiB recommended (estimated)`
          : "observed VRAM unavailable",
      operations: { ablation },
      golden,
    };
  });
}
