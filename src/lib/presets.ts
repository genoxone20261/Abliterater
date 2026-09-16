import type { StudioState } from "@/lib/studio";

export type Preset = {
  id: string;
  title: string;
  titleEn: string;
  blurb: string;
  blurbEn: string;
  meta: string;
  metaEn: string;
  patch: Partial<StudioState>;
};

/** Vendor-neutral starting points. They never assume a paid cloud account or a specific GPU. */
export const PRESETS: Preset[] = [
  {
    id: "method-compare",
    title: "Abliteration 방법 비교",
    titleEn: "Abliteration method comparison",
    blurb: "동일 베이스에 Heretic·Gabliteration·양자화를 묶어 비교 가능한 팩을 만든다.",
    blurbEn: "Bundle Heretic, Gabliteration, and quantization around the same base for comparison.",
    meta: "목표 방법 비교 · 산출물 BF16 / Q4",
    metaEn: "Goal Method comparison · Output BF16 / Q4",
    patch: {
      purpose: "abliterated",
      domain: "general",
      methods: ["heretic", "gabliteration", "quant"],
      base: "qwen3-4b",
      modelSource: "catalog",
      compute: "local-cuda",
      outputs: ["merged-bf16", "gguf-q4", "docker"],
    },
  },
  {
    id: "domain-lora",
    title: "분야 LoRA 파이프라인",
    titleEn: "Domain LoRA pipeline",
    blurb: "RAG 검증 뒤 LoRA와 양자화로 이어지는 공급자 독립 시작점이다.",
    blurbEn: "A provider-neutral path from RAG validation to LoRA and quantization.",
    meta: "목표 분야 적응 · 산출물 LoRA / Q4",
    metaEn: "Goal Domain adaptation · Output LoRA / Q4",
    patch: {
      purpose: "domain",
      domain: "engineering",
      methods: ["rag-first", "lora-dpo", "quant"],
      base: "qwen3-4b",
      modelSource: "catalog",
      compute: "local-cuda",
      outputs: ["sft-adapter", "gguf-q4", "docker"],
    },
  },
  {
    id: "local-gguf",
    title: "로컬 GGUF 빠른 시작",
    titleEn: "Local GGUF quick start",
    blurb: "이미 heretic된 4B GGUF를 받아 Ollama·Docker에 붙인다. 재ablation·재양자화 없음.",
    blurbEn: "Pull an already-heretic 4B GGUF into Ollama and Docker. No re-ablation or re-quant.",
    meta: "목표 로컬 추론 · 받아 쓰기",
    metaEn: "Goal Local inference · reuse weights",
    patch: {
      purpose: "pipeline",
      domain: "general",
      methods: [],
      base: "qwen3-4b-h-gguf",
      modelSource: "catalog",
      compute: "local-cuda",
      outputs: ["ollama", "docker"],
    },
  },
];

export function applyPreset(id: string): Partial<StudioState> {
  const found = PRESETS.find((preset) => preset.id === id);
  if (!found) return {};
  const patch = { ...found.patch };
  if (patch.methods) patch.methods = [...patch.methods];
  if (patch.outputs) patch.outputs = [...patch.outputs];
  return patch;
}
