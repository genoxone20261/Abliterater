export type EcosystemCategory = "compute" | "dataset" | "method";
export type EcosystemSupport = "catalog";
export type EcosystemSource = {
  id: string;
  name: string;
  category: EcosystemCategory;
  support: EcosystemSupport;
  url: string;
  docs: string;
  summary: string;
  access: string[];
  workloads: string[];
  limitations: string;
  checkedAt: string;
};

function isSource(value: unknown): value is EcosystemSource {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.name === "string" &&
    (row.category === "compute" || row.category === "dataset" || row.category === "method") &&
    typeof row.url === "string" &&
    typeof row.docs === "string" &&
    typeof row.summary === "string" &&
    Array.isArray(row.access) &&
    Array.isArray(row.workloads) &&
    typeof row.limitations === "string" &&
    typeof row.checkedAt === "string"
  );
}

const rawSources = [
  { category: "compute", path: "compute-sources.json" },
  { category: "dataset", path: "dataset-sources.json" },
  { category: "method", path: "method-sources.json" },
] as const;

/** Build-time catalog. This is deliberately catalog-only; provisioners need credentials and budgets. */
export const ecosystemSources: EcosystemSource[] = [
  ...computeSources.map((row) => validateEcosystemSource(row, "compute")),
  ...datasetSources.map((row) => validateEcosystemSource(row, "dataset")),
  ...methodSources.map((row) => validateEcosystemSource(row, "method")),
];

export const ecosystemCatalogManifest = rawSources;

export const ECOSYSTEM_ERROR = {
  invalid: "ECOSYSTEM_SOURCE_INVALID",
} as const;

export function validateEcosystemSource(
  value: unknown,
  category: EcosystemCategory,
): EcosystemSource {
  if (!isSource(value) || value.category !== category) throw new Error(ECOSYSTEM_ERROR.invalid);
  return { ...value, support: "catalog" };
}
import computeSources from "../data/compute-sources.json" with { type: "json" };
import datasetSources from "../data/dataset-sources.json" with { type: "json" };
import methodSources from "../data/method-sources.json" with { type: "json" };
