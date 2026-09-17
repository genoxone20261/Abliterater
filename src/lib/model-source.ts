import { BASES, COMPUTES, METHODS, type StudioState } from "@/lib/studio";
import { alreadyUncensored } from "@/lib/size-bands";
import { t, type Locale } from "@/lib/i18n";
import { computeRuntimeKind } from "./provider-capabilities";

export const MODEL_SOURCES = [
  {
    id: "catalog",
    title: "카탈로그",
    blurb: "작업대에 올려 둔 검증 카드. Hub에서 받는다.",
  },
  {
    id: "hf",
    title: "Hugging Face",
    blurb: "Hub API로 검색하거나 레포 ID를 붙인다.",
  },
  {
    id: "local",
    title: "로컬 경로",
    blurb: "이 머신에 있는 HF 캐시·GGUF·safetensors.",
  },
  {
    id: "api",
    title: "OpenAI 호환 API",
    blurb: "Ollama / vLLM / LM Studio / 원격. 가중치 없음.",
  },
] as const;

export type ModelSourceId = (typeof MODEL_SOURCES)[number]["id"];

export const WEIGHT_METHODS = [
  "heretic",
  "failspy",
  "deccp",
  "erisforge",
  "gabliteration",
  "obliteratus",
  "apostate",
  "abliterix",
  "ablate",
  "jwest",
  "llmabliterate",
  "unfetter",
  "domain-ablate",
  "sft-unc",
  "lora-dpo",
  "cpt",
  "dsmoe",
  "quant",
  "cast",
] as const;

export type FlowStatus = "ok" | "warn" | "skip" | "block";

export type FlowStep = {
  id: string;
  title: string;
  status: FlowStatus;
  detail: string;
};

export function isModelSource(v: string | undefined): v is ModelSourceId {
  return MODEL_SOURCES.some((s) => s.id === v);
}

export function modelSourceOf(s: Pick<StudioState, "modelSource">): ModelSourceId {
  return isModelSource(s.modelSource) ? s.modelSource : "catalog";
}

export function normalizeHfRepo(raw: string): string {
  let t = (raw ?? "").trim();
  t = t.replace(/^https?:\/\/huggingface\.co\//i, "");
  t = t.replace(/^hf:\/\//i, "");
  t = t.split(/[?#]/, 1)[0] ?? t;
  t = t.replace(/\/tree\/.*$/i, "").replace(/\/blob\/.*$/i, "");
  t = t.replace(/\/resolve\/.*$/i, "");
  t = t.replace(/\/+$/, "");
  return t;
}

export function isHfRepoId(id: string): boolean {
  return /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/.test(id);
}

/** Catalog card `name` is the Hub id (owner/name). Empty if the card is not a repo. */
export function hfRepoFromCatalog(baseId: string): string {
  const card = BASES.find((b) => b.id === baseId);
  const repo = normalizeHfRepo(card?.name ?? "");
  return isHfRepoId(repo) ? repo : "";
}

export function baseVramGb(s: StudioState): number {
  const n = parseFloat(s.baseVram || "");
  if (Number.isFinite(n) && n > 0) return n;
  return BASES.find((b) => b.id === s.base)?.vram ?? 12;
}

export function resolveBasePull(s: StudioState): string {
  const src = modelSourceOf(s);
  if (src === "hf") {
    const repo = normalizeHfRepo(s.hfRepo || s.storeBaseUri || "");
    return repo || "BASE_MODEL";
  }
  if (src === "local") {
    const path = (s.localPath || s.storeBaseUri || "").trim();
    return path || "./base";
  }
  if (src === "api") {
    const name = (s.apiModel || "").trim();
    return name || "api-model";
  }
  const catalog = BASES.find((b) => b.id === s.base);
  if (catalog) return catalog.name;
  const uri = (s.storeBaseUri || "").trim();
  if (uri) return uri;
  return s.base || "BASE_MODEL";
}

export function resolveStore(s: StudioState): { store: string; uri: string } {
  const src = modelSourceOf(s);
  if (src === "hf") {
    return { store: "hf", uri: normalizeHfRepo(s.hfRepo || s.storeBaseUri || "") };
  }
  if (src === "local") {
    return { store: "local", uri: (s.localPath || s.storeBaseUri || "").trim() };
  }
  if (src === "api") {
    return { store: s.storeBase || "hf", uri: (s.storeBaseUri || "").trim() };
  }
  return { store: s.storeBase || "hf", uri: (s.storeBaseUri || "").trim() };
}

export function looksGguf(s: StudioState): boolean {
  const blob = `${resolveBasePull(s)} ${s.hfRepo ?? ""} ${s.localPath ?? ""} ${s.storeBaseUri ?? ""}`;
  return /gguf/i.test(blob);
}

export function weightMethodsOf(s: Pick<StudioState, "methods">): string[] {
  return (s.methods ?? []).filter((id) => (WEIGHT_METHODS as readonly string[]).includes(id));
}

export function auditWorkflow(s: StudioState, locale: Locale = "ko"): FlowStep[] {
  const src = modelSourceOf(s);
  const pull = resolveBasePull(s);
  const store = resolveStore(s);
  const compute = COMPUTES.find((c) => c.id === s.compute);
  const methods = METHODS.filter((m) => (s.methods ?? []).includes(m.id));
  const weights = weightMethodsOf(s);
  const steps: FlowStep[] = [];
  const tx = (key: Parameters<typeof t>[0], vars: Record<string, string> = {}) =>
    Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), t(key, locale));

  if (src === "catalog") {
    const card = BASES.find((b) => b.id === s.base);
    steps.push({
      id: "base",
      title: t("step_base", locale),
      status: card ? "ok" : "block",
      detail: card
        ? tx("wf_base_catalog_ok", { name: card.name })
        : t("wf_base_catalog_block", locale),
    });
  } else if (src === "hf") {
    const ok = isHfRepoId(pull);
    steps.push({
      id: "base",
      title: t("step_base", locale),
      status: ok ? "ok" : "block",
      detail: ok
        ? tx("wf_base_hf_ok", { pull, rev: s.hfRevision ? ` @ ${s.hfRevision}` : "" })
        : t("wf_base_hf_block", locale),
    });
  } else if (src === "local") {
    const ok = pull.length > 1 && pull !== "./base";
    steps.push({
      id: "base",
      title: t("step_base", locale),
      status: ok ? "ok" : "block",
      detail: ok ? tx("wf_base_local_ok", { pull }) : t("wf_base_local_block", locale),
    });
  } else {
    const url = (s.apiBaseUrl || "").trim();
    const model = (s.apiModel || "").trim();
    const ok = /^https?:\/\//i.test(url) && model.length > 0;
    steps.push({
      id: "base",
      title: t("step_base", locale),
      status: ok ? "ok" : "block",
      detail: ok ? tx("wf_base_api_ok", { url, model }) : t("wf_base_api_block", locale),
    });
  }

  if (src === "api" && weights.length) {
    steps.push({
      id: "methods",
      title: t("step_methods", locale),
      status: "skip",
      detail: tx("wf_methods_api_skip", { weights: weights.join(", ") }),
    });
  } else if (!methods.length) {
    steps.push({
      id: "methods",
      title: t("step_methods", locale),
      status: "warn",
      detail: t("wf_methods_warn", locale),
    });
  } else {
    steps.push({
      id: "methods",
      title: t("step_methods", locale),
      status: "ok",
      detail: methods.map((m) => m.id).join(", "),
    });
  }

  if (s.domain === "math" && (s.methods ?? []).includes("heretic")) {
    steps.push({
      id: "math",
      title: t("step_math", locale),
      status: "warn",
      detail: t("wf_math_warn", locale),
    });
  }

  const computeOk = !!compute;
  const runtime = compute ? computeRuntimeKind(compute.id) : null;
  const computeDetail = !compute
    ? t("wf_compute_block", locale)
    : runtime === "pack-only"
      ? tx("wf_compute_pack_only", { id: compute.id })
      : runtime === "create"
        ? tx("wf_compute_create", { id: compute.id })
        : `${compute.id}`;
  const computeStatus: FlowStatus = !computeOk ? "block" : runtime === "pack-only" ? "warn" : "ok";

  steps.push({
    id: "compute",
    title: t("step_compute", locale),
    status: computeStatus,
    detail: computeDetail,
  });

  if (src === "api") {
    steps.push({
      id: "fetch",
      title: t("step_fetch", locale),
      status: "skip",
      detail: t("wf_fetch_api", locale),
    });
  } else if (src === "local") {
    steps.push({
      id: "fetch",
      title: t("step_fetch", locale),
      status: store.uri ? "ok" : "block",
      detail: store.uri
        ? tx("wf_fetch_local_ok", { uri: store.uri })
        : t("wf_fetch_local_block", locale),
    });
  } else {
    const repo = store.uri || pull;
    steps.push({
      id: "fetch",
      title: t("step_fetch", locale),
      status: repo && repo !== "BASE_MODEL" ? "ok" : "block",
      detail: tx("wf_fetch_hub", { repo: repo || "?" }),
    });
  }

  if (src === "api") {
    steps.push({
      id: "train",
      title: t("step_train", locale),
      status: "skip",
      detail: t("wf_train_api", locale),
    });
    steps.push({
      id: "quant",
      title: t("step_quant", locale),
      status: "skip",
      detail: t("wf_quant_api", locale),
    });
  } else {
    const train = weights.filter((id) => id !== "quant");
    const card = src === "catalog" ? BASES.find((b) => b.id === s.base) : undefined;
    const blob = `${pull} ${s.hfRepo ?? ""} ${s.localPath ?? ""}`;
    const derived = card && "derived" in card ? card.derived : undefined;
    const done =
      alreadyUncensored(derived) ||
      /heretic|abliterat|uncensor|dolphin|decensor/i.test(blob);
    steps.push({
      id: "train",
      title: t("step_train", locale),
      status: train.length && !done ? "ok" : "skip",
      detail: done
        ? t("wf_train_already", locale)
        : train.length
          ? tx("wf_train_ok", { train: train.join(", ") })
          : t("wf_train_skip", locale),
    });
    const wantQ = (s.methods ?? []).includes("quant") && !looksGguf(s);
    steps.push({
      id: "quant",
      title: t("step_quant", locale),
      status: wantQ ? "ok" : "skip",
      detail: looksGguf(s)
        ? t("wf_quant_gguf", locale)
        : wantQ
          ? t("wf_quant_ok", locale)
          : t("wf_quant_skip", locale),
    });
  }

  steps.push({
    id: "eval",
    title: t("step_eval", locale),
    status: "ok",
    detail: src === "api" ? t("wf_eval_api", locale) : t("wf_eval_local", locale),
  });

  const packBits = [
    "run.sh / run.ps1",
    s.compute.startsWith("azure") ? "az-startup + azure-job.yml" : null,
    (s.outputs ?? []).includes("docker") ? "docker-compose.yml" : null,
    (s.outputs ?? []).includes("ollama") ? "Modelfile" : null,
  ].filter(Boolean);
  steps.push({
    id: "pack",
    title: t("step_pack", locale),
    status: "ok",
    detail: tx("wf_pack", { bits: packBits.join(" · ") }),
  });

  return steps;
}

export function flowHasBlock(steps: FlowStep[]): boolean {
  return steps.some((s) => s.status === "block");
}
