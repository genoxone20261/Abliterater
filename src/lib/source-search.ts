import { sha256FromSiblings } from "./provenance.ts";

export const SOURCE_ERROR = {
  query: "SOURCE_QUERY_LEN",
  kind: "SOURCE_KIND",
  schema: "SOURCE_SCHEMA",
  http: "SOURCE_HTTP",
  retry: "SOURCE_RETRY",
  body: "SOURCE_BODY",
  size: "SOURCE_SIZE",
  network: "SOURCE_NETWORK",
} as const;

export const LICENSE_UNCHECKED = "LICENSE_UNCHECKED";

export type SearchSource = "hf-datasets" | "hf-models" | "github" | "openml" | "zenodo";
export type SourceHit = {
  id: string;
  name: string;
  url: string;
  description: string;
  license: string;
  updated?: string;
  revision?: string;
  sha256?: string;
};
export type SourceSearchResult = { source: SearchSource; fetchedAt: string; items: SourceHit[] };

const text = (v: unknown, limit = 400): string => (typeof v === "string" ? v.slice(0, limit) : "");
const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

function openmlName(query: string): string {
  const safe = query
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9._-]/g, "");
  if (!safe) throw new Error(SOURCE_ERROR.query);
  return safe.slice(0, 80);
}

export function searchUrl(source: SearchSource, query: string): URL {
  if (!query.trim() || query.length > 160) throw new Error(SOURCE_ERROR.query);
  if (source === "openml") {
    return new URL(
      `https://www.openml.org/api/v1/json/data/list/limit/20/data_name/${encodeURIComponent(openmlName(query))}`,
    );
  }
  const bases: Record<Exclude<SearchSource, "openml">, string> = {
    "hf-datasets": "https://huggingface.co/api/datasets",
    "hf-models": "https://huggingface.co/api/models",
    github: "https://api.github.com/search/repositories",
    zenodo: "https://zenodo.org/api/records",
  };
  if (!Object.hasOwn(bases, source)) throw new Error(SOURCE_ERROR.kind);
  const url = new URL(bases[source]);
  if (source === "zenodo") {
    url.searchParams.set("q", query.trim());
    url.searchParams.set("size", "20");
    return url;
  }
  url.searchParams.set(source === "github" ? "q" : "search", query.trim());
  url.searchParams.set(source === "github" ? "per_page" : "limit", "20");
  if (source !== "github") {
    url.searchParams.set("sort", "downloads");
    url.searchParams.set("direction", "-1");
  }
  return url;
}

function rowsOf(source: SearchSource, raw: unknown): unknown[] {
  if (source === "github") {
    const items = record(raw).items;
    if (!Array.isArray(items)) throw new Error(SOURCE_ERROR.schema);
    return items;
  }
  if (source === "openml") {
    const dataset = record(record(raw).data).dataset;
    if (!Array.isArray(dataset)) throw new Error(SOURCE_ERROR.schema);
    return dataset;
  }
  if (source === "zenodo") {
    const hits = record(record(raw).hits).hits;
    if (!Array.isArray(hits)) throw new Error(SOURCE_ERROR.schema);
    return hits;
  }
  if (!Array.isArray(raw)) throw new Error(SOURCE_ERROR.schema);
  return raw;
}

export function mapSourceResults(source: SearchSource, raw: unknown): SourceHit[] {
  const rows = rowsOf(source, raw);
  const seen = new Set<string>();
  return rows.slice(0, 20).flatMap((value) => {
    const row = record(value);
    const meta = record(row.metadata);
    const rawId =
      source === "github" ? row.full_name : source === "openml" ? (row.did ?? row.id) : row.id;
    const id =
      typeof rawId === "number"
        ? String(rawId)
        : text(rawId, source === "openml" || source === "zenodo" ? 40 : 200);
    if (!/^[\w.-]+(?:\/[\w.-]+)?$/.test(id) || seen.has(id)) return [];
    seen.add(id);
    const tags = Array.isArray(row.tags) ? row.tags : [];
    const license =
      source === "github"
        ? text(record(row.license).spdx_id)
        : source === "zenodo"
          ? text(record(meta.license).id)
          : source === "openml"
            ? text(row.licence ?? row.license)
            : text(tags.find((t) => typeof t === "string" && t.startsWith("license:"))).replace(
                /^license:/,
                "",
              );
    const name =
      source === "openml"
        ? text(row.name, 200) || id
        : source === "zenodo"
          ? text(meta.title, 200) || id
          : id;
    return [
      {
        id,
        name,
        url:
          source === "github"
            ? `https://github.com/${id}`
            : source === "openml"
              ? `https://www.openml.org/d/${id}`
              : source === "zenodo"
                ? `https://zenodo.org/records/${id}`
                : `https://huggingface.co/${source === "hf-datasets" ? "datasets/" : ""}${id}`,
        description: text(source === "zenodo" ? meta.description : row.description),
        license: license || LICENSE_UNCHECKED,
        updated:
          text(
            source === "github"
              ? row.pushed_at
              : source === "zenodo"
                ? meta.publication_date
                : row.lastModified,
          ) || undefined,
        revision:
          source === "hf-datasets" || source === "hf-models"
            ? text(row.sha, 80) || undefined
            : undefined,
        sha256: sha256FromSiblings(row.siblings) || undefined,
      },
    ];
  });
}

export async function fetchSourceResults(
  source: SearchSource,
  query: string,
  fetcher: typeof fetch = fetch,
): Promise<SourceSearchResult> {
  let response: Response;
  try {
    response = await fetcher(searchUrl(source, query), {
      headers: { Accept: "application/json", "User-Agent": "abliterater-workbench" },
      signal: AbortSignal.timeout(15000),
      redirect: "error",
      credentials: "omit",
    });
  } catch (e) {
    if (e instanceof Error) {
      if ((Object.values(SOURCE_ERROR) as string[]).some((code) => e.message.startsWith(code)))
        throw e;
      if (e.name === "TimeoutError" || e.name === "AbortError") throw e;
      if (e instanceof TypeError) throw new Error(SOURCE_ERROR.network);
    }
    throw e;
  }
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After") ?? "";
    throw new Error(`${SOURCE_ERROR.retry} ${retryAfter}`.trim());
  }
  if (!response.ok) throw new Error(`${SOURCE_ERROR.http} ${response.status}`);
  const reader = response.body?.getReader();
  if (!reader) throw new Error(SOURCE_ERROR.body);
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 2_000_000) throw new Error(SOURCE_ERROR.size);
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
  const body = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.length;
  }
  return {
    source,
    fetchedAt: new Date().toISOString(),
    items: mapSourceResults(source, JSON.parse(new TextDecoder().decode(body))),
  };
}
