/** Size bands, Hub ranking, and reuse-vs-reprocess path advice. Pure. */

export const SIZE_BANDS = [
  { id: "nano", minB: 0, maxB: 1.5 },
  { id: "tiny", minB: 1.5, maxB: 4 },
  { id: "small", minB: 4, maxB: 9 },
  { id: "medium", minB: 9, maxB: 16 },
  { id: "large", minB: 16, maxB: 35 },
  { id: "xl", minB: 35, maxB: 80 },
  { id: "xxl", minB: 80, maxB: Number.POSITIVE_INFINITY },
] as const;

export type SizeBandId = (typeof SIZE_BANDS)[number]["id"];

export type DerivedKind = "base" | "abliterated" | "heretic" | "uncensored-sft" | "quantized";

export type PathAdvice = {
  kind: "reuse-gguf" | "reuse-weights" | "ablate" | "quant";
  methods: string[];
  outputs: string[];
  purpose: "abliterated" | "domain" | "pipeline";
};

export type HubLike = {
  id: string;
  downloads: number;
  likes: number;
  gguf: boolean;
  gated: boolean;
  lastModified?: string;
  tags?: string[];
};

export type HubBandPick = HubLike & {
  band: SizeBandId;
  parametersB: number;
  derived: DerivedKind;
  path: PathAdvice;
  score: number;
};

const VERSIONISH = new Set([2.5, 3, 3.5, 3.6, 3.8, 4]);
const MOE_ACTIVE = /(?:^|[-_./])[AE](\d+(?:\.\d+)?)[Bb](?:$|[-_./])/i;

export type ParamBreakdown = {
  activeB: number | null;
  totalB: number | null;
  source: "moe-active" | "named" | "none";
};

export function parseParamBreakdown(id: string): ParamBreakdown {
  const moe = MOE_ACTIVE.exec(id);
  const matches = [...id.matchAll(/(\d+(?:\.\d+)?)[Bb]\b/g)];
  const nums = matches.map((m) => Number(m[1])).filter((n) => Number.isFinite(n) && n > 0);
  if (moe) {
    const active = Number(moe[1]);
    if (!Number.isFinite(active) || active <= 0) {
      return { activeB: null, totalB: null, source: "none" };
    }
    const others = nums.filter((n) => n !== active);
    const total = others.length ? Math.max(...others) : active;
    return { activeB: active, totalB: total, source: "moe-active" };
  }
  if (!nums.length) return { activeB: null, totalB: null, source: "none" };
  const kept = nums.filter((n) => !(VERSIONISH.has(n) && nums.some((o) => o !== n && o >= 0.5)));
  const pool = kept.length ? kept : nums;
  const size = Math.max(...pool);
  return { activeB: size, totalB: size, source: "named" };
}

export function parseParamsB(id: string): number | null {
  return parseParamBreakdown(id).activeB;
}

export function sizeBandOf(paramsB: number): SizeBandId {
  for (const band of SIZE_BANDS) {
    if (paramsB >= band.minB && paramsB < band.maxB) return band.id;
  }
  return "xxl";
}

export function classifyDerived(id: string, tags: readonly string[] = []): DerivedKind {
  const blob = `${id} ${tags.join(" ")}`.toLowerCase();
  if (/\bheretic\b/.test(blob)) return "heretic";
  if (/abliterat/.test(blob)) return "abliterated";
  if (/uncensor|dolphin|decensor/.test(blob)) return "uncensored-sft";
  if (/gguf/.test(blob)) return "quantized";
  return "base";
}

export function alreadyUncensored(derived?: DerivedKind | string): boolean {
  return (
    derived === "heretic" ||
    derived === "abliterated" ||
    derived === "uncensored-sft" ||
    derived === "quantized"
  );
}

/** Catalog/Hub cards that are already processed — reuse, do not re-ablate. */
export function catalogIsReuse(model: { id?: string; name?: string; derived?: string }): boolean {
  if (alreadyUncensored(model.derived)) return true;
  return alreadyUncensored(classifyDerived(`${model.id ?? ""} ${model.name ?? ""}`));
}

export function recommendPath(opts: { derived?: DerivedKind | string; gguf: boolean }): PathAdvice {
  const done = alreadyUncensored(opts.derived);
  if (done && opts.gguf) {
    return { kind: "reuse-gguf", methods: [], outputs: ["ollama", "docker"], purpose: "pipeline" };
  }
  if (done) {
    return { kind: "reuse-weights", methods: [], outputs: ["merged-bf16"], purpose: "pipeline" };
  }
  if ((opts.derived ?? "base") === "base") {
    return { kind: "ablate", methods: ["heretic"], outputs: ["merged-bf16"], purpose: "abliterated" };
  }
  return { kind: "quant", methods: ["quant"], outputs: ["gguf-q4", "ollama"], purpose: "pipeline" };
}

export function hubPickScore(m: HubLike, now = Date.now()): number {
  const modified = m.lastModified ? Date.parse(m.lastModified) : NaN;
  const ageDays = Number.isFinite(modified) ? (now - modified) / 86_400_000 : 999;
  const recency = ageDays <= 7 ? 40 : ageDays <= 30 ? 12 : ageDays <= 90 ? 4 : 0;
  const gated = m.gated ? -40 : 0;
  const gguf = m.gguf ? 12 : 0;
  return Math.log1p(Math.max(0, m.downloads)) * 3 + m.likes * 0.04 + recency + gated + gguf;
}

export function keepHubCandidate(m: HubLike, now = Date.now()): boolean {
  if (!m.id || m.gated) return false;
  if (m.downloads >= 200 || m.likes >= 20) return true;
  const modified = m.lastModified ? Date.parse(m.lastModified) : NaN;
  const ageDays = Number.isFinite(modified) ? (now - modified) / 86_400_000 : 999;
  return ageDays <= 7 && m.downloads >= 10 && m.gguf;
}

export function pickTopPerBand(
  models: readonly HubLike[],
  perBand = 3,
  now = Date.now(),
): Record<SizeBandId, HubBandPick[]> {
  const empty = Object.fromEntries(SIZE_BANDS.map((b) => [b.id, [] as HubBandPick[]])) as Record<
    SizeBandId,
    HubBandPick[]
  >;
  const seen = new Set<string>();
  for (const raw of models) {
    if (!keepHubCandidate(raw, now) || seen.has(raw.id)) continue;
    const parametersB = parseParamsB(raw.id);
    if (parametersB == null) continue;
    seen.add(raw.id);
    const derived = classifyDerived(raw.id, raw.tags);
    const band = sizeBandOf(parametersB);
    empty[band].push({
      ...raw,
      band,
      parametersB,
      derived,
      path: recommendPath({ derived, gguf: raw.gguf }),
      score: hubPickScore(raw, now) + (derived === "base" ? 80 : 0),
    });
  }
  for (const band of SIZE_BANDS) {
    empty[band.id].sort((a, b) => b.score - a.score || b.downloads - a.downloads);
    empty[band.id] = empty[band.id].slice(0, perBand);
  }
  return empty;
}
