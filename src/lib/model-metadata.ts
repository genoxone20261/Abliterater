export type ModelMetadata = {
  id: string;
  revision: string | null;
  revisionImmutable: boolean;
  lastModified: string | null;
  parametersB: number | null;
  safetensorsBytes: number | null;
  license: string;
  access: "public" | "gated" | "private" | "private-gated";
  modelType: string | null;
  pipeline: string | null;
  quantization: string | null;
  evidence: "provider-metadata";
};
const text = (value: unknown, max = 200) => (typeof value === "string" ? value.slice(0, max) : "");
const rec = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
export function mapHfMetadata(raw: unknown): ModelMetadata {
  const row = rec(raw);
  const config = rec(row.config);
  const card = rec(row.cardData);
  const siblings = Array.isArray(row.siblings) ? row.siblings.map(rec) : [];
  const safetensorsBytes = siblings.reduce(
    (sum, file) =>
      /\.safetensors$/i.test(text(file.rfilename)) &&
      typeof file.size === "number" &&
      Number.isFinite(file.size)
        ? sum + file.size
        : sum,
    0,
  );
  const parameters =
    typeof config.num_parameters === "number" && Number.isFinite(config.num_parameters)
      ? config.num_parameters
      : null;
  const revision = /^[a-f0-9]{40}$/i.test(text(row.sha, 80)) ? text(row.sha, 80) : null;
  const privateModel = row.private === true;
  const gated = row.gated === true || (typeof row.gated === "string" && row.gated !== "false");
  return {
    id: text(row.id || row.modelId),
    revision,
    revisionImmutable: Boolean(revision),
    lastModified: text(row.lastModified) || null,
    parametersB: parameters === null ? null : parameters / 1e9,
    safetensorsBytes: safetensorsBytes || null,
    license: text(card.license) || "unknown",
    access:
      privateModel && gated
        ? "private-gated"
        : privateModel
          ? "private"
          : gated
            ? "gated"
            : "public",
    modelType: text(config.model_type) || null,
    pipeline: text(row.pipeline_tag) || null,
    quantization: text(rec(config.quantization_config).quant_method) || null,
    evidence: "provider-metadata",
  };
}
export function createMetadataCache({ maxEntries = 100, ttlMs = 300_000 } = {}) {
  const values = new Map<string, { value: unknown; expires: number }>();
  return {
    get(key: string) {
      const hit = values.get(key);
      if (!hit || hit.expires <= Date.now()) {
        values.delete(key);
        return undefined;
      }
      return hit.value;
    },
    async set(key: string, value: unknown) {
      values.delete(key);
      values.set(key, { value, expires: Date.now() + ttlMs });
      while (values.size > maxEntries) values.delete(values.keys().next().value!);
    },
  };
}
