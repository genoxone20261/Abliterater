export type MethodFamilyId = "reuse" | "edit" | "train" | "quant" | "infer";
export type RailState = "ok" | "warn" | "mute";

export const FOLDED_METHOD_IDS = ["failspy", "erisforge"] as const;

export const METHOD_FAMILIES: { id: MethodFamilyId; ids: readonly string[] }[] = [
  { id: "reuse", ids: [] },
  {
    id: "edit",
    ids: [
      "heretic",
      "apostate",
      "gabliteration",
      "abliterix",
      "unfetter",
      "deccp",
      "jwest",
      "jimplus",
      "llmabliterate",
      "obliteratus",
      "ablate",
      "domain-ablate",
      "failspy",
      "erisforge",
    ],
  },
  { id: "train", ids: ["sft-unc", "lora-dpo", "cpt", "dsmoe"] },
  { id: "quant", ids: ["quant", "exl2", "awq"] },
  { id: "infer", ids: ["cast", "rag-first", "mergekit", "eval-pack"] },
];

const FAMILY_BY_ID = new Map<string, MethodFamilyId>(
  METHOD_FAMILIES.flatMap((f) => f.ids.map((id) => [id, f.id] as const)),
);

export function methodFamilyOf(id: string): MethodFamilyId | null {
  return FAMILY_BY_ID.get(id) ?? null;
}

export function statusRail(input: {
  pull: string;
  dataUri: string;
  revision: string;
  license: string;
  sha256: string;
  methods: string[];
}): {
  base: { text: string; state: RailState };
  data: { text: string; state: RailState };
  method: { empty: boolean; ids: string[]; state: RailState };
  next: { state: "mute" };
} {
  const sha = (input.sha256 ?? "").trim();
  const uri = (input.dataUri ?? "").trim();
  const verified = /^[a-f0-9]{64}$/i.test(sha);
  const methods = input.methods.filter(Boolean);
  return {
    base: { text: (input.pull || "").trim() || "—", state: "ok" },
    data: {
      text: uri
        ? [uri, input.revision, input.license, verified ? sha.slice(0, 12) : ""]
            .filter(Boolean)
            .join(" · ")
        : "",
      state: uri && verified ? "ok" : "warn",
    },
    method: {
      empty: methods.length === 0,
      ids: methods,
      state: "ok",
    },
    next: { state: "mute" },
  };
}
