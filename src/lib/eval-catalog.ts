export type EvalCatalogKind = "train" | "eval";

export type EvalCatalogRow = {
  id: string;
  kind: EvalCatalogKind;
  license: string;
};

export const EVAL_CATALOG: readonly EvalCatalogRow[] = [
  { id: "Open-Orca/OpenOrca", kind: "train", license: "mit" },
  { id: "Open-Orca/SlimOrca", kind: "train", license: "mit" },
  { id: "cognitivecomputations/dolphin", kind: "train", license: "apache-2.0" },
  { id: "walledai/HarmBench", kind: "eval", license: "LICENSE_UNCHECKED" },
  { id: "walledai/StrongREJECT", kind: "eval", license: "LICENSE_UNCHECKED" },
  { id: "Paul/XSTest", kind: "eval", license: "LICENSE_UNCHECKED" },
  { id: "sorry-bench/sorry-bench", kind: "eval", license: "LICENSE_UNCHECKED" },
];

export function evalCatalogHit(id: string): {
  id: string;
  name: string;
  url: string;
  description: string;
  license: string;
  sha256: string;
  source: "hf-datasets";
} {
  const row = EVAL_CATALOG.find((r) => r.id === id);
  if (!row) throw new Error("EVAL_CATALOG_ID");
  return {
    id: row.id,
    name: row.id,
    url: `https://huggingface.co/datasets/${row.id}`,
    description: row.kind,
    license: row.license,
    sha256: "",
    source: "hf-datasets",
  };
}
