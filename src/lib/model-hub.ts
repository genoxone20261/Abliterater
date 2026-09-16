import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { isHfRepoId, normalizeHfRepo } from "@/lib/model-source";
import { createMetadataCache, mapHfMetadata, type ModelMetadata } from "@/lib/model-metadata";
import { pickTopPerBand, SIZE_BANDS, type HubBandPick, type SizeBandId } from "@/lib/size-bands";
import { sha256FromSiblings } from "@/lib/provenance";

export type HubModel = {
  id: string;
  pipeline?: string;
  downloads: number;
  likes: number;
  gated: boolean;
  private: boolean;
  tags: string[];
  gguf: boolean;
  lastModified?: string;
};

export type HubCard = HubModel & {
  siblings: string[];
  lastModified?: string;
  metadata: ModelMetadata;
  weightSha256?: string;
};

export const HUB_ERROR = {
  repo: "HUB_REPO_ID",
  empty: "HUB_CARD_EMPTY",
  http: "HUB_HTTP",
  size: "HUB_SIZE",
  body: "HUB_BODY",
  network: "HUB_NETWORK",
} as const;

const HF_API = "https://huggingface.co/api/models";
const metadataCache = createMetadataCache();

function gatedOf(v: unknown): boolean {
  if (v === true) return true;
  if (typeof v === "string" && v.length && v !== "false") return true;
  return false;
}

function mapHub(row: Record<string, unknown>): HubModel {
  const id = String(row.id ?? row.modelId ?? "");
  const tags = Array.isArray(row.tags) ? row.tags.map(String) : [];
  const siblings = Array.isArray(row.siblings)
    ? row.siblings
        .map((s) =>
          s && typeof s === "object" && "rfilename" in s
            ? String((s as { rfilename: unknown }).rfilename)
            : "",
        )
        .filter(Boolean)
    : [];
  const gguf =
    tags.some((t) => /gguf/i.test(t)) ||
    siblings.some((n) => /\.gguf$/i.test(n)) ||
    /gguf/i.test(id);
  return {
    id,
    pipeline: typeof row.pipeline_tag === "string" ? row.pipeline_tag : undefined,
    downloads: typeof row.downloads === "number" ? row.downloads : 0,
    likes: typeof row.likes === "number" ? row.likes : 0,
    gated: gatedOf(row.gated),
    private: row.private === true,
    tags: tags.slice(0, 12),
    gguf,
    lastModified: typeof row.lastModified === "string" ? row.lastModified : undefined,
  };
}

async function hfGet(url: string): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "abliterater-workbench" },
        signal: ctrl.signal,
      });
    } catch (e) {
      if (e instanceof Error) {
        if ((Object.values(HUB_ERROR) as string[]).some((code) => e.message.startsWith(code)))
          throw e;
        if (e.name === "AbortError") throw e;
        if (e instanceof TypeError) throw new Error(HUB_ERROR.network);
      }
      throw e;
    }
    if (!res.ok) {
      throw new Error(`${HUB_ERROR.http} ${res.status}`);
    }
    const length = Number(res.headers.get("content-length") || 0);
    if (length > 2_000_000) throw new Error(HUB_ERROR.size);
    const reader = res.body?.getReader();
    if (!reader) throw new Error(HUB_ERROR.body);
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 2_000_000) throw new Error(HUB_ERROR.size);
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
    return JSON.parse(new TextDecoder().decode(body));
  } finally {
    clearTimeout(timer);
  }
}

export const searchHfModels = createServerFn({ method: "POST" })
  .validator(
    z.object({
      q: z.string().min(1).max(200),
      limit: z.number().int().min(1).max(40).optional(),
    }),
  )
  .handler(async ({ data }): Promise<{ models: HubModel[]; error?: string }> => {
    const q = data.q.trim();
    const limit = data.limit ?? 20;
    const url = new URL(HF_API);
    url.searchParams.set("search", q);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("sort", "downloads");
    url.searchParams.set("direction", "-1");
    url.searchParams.set("full", "true");
    const json = await hfGet(url.toString());
    const rows = Array.isArray(json) ? json : [];
    const models: HubModel[] = [];
    const seen = new Set<string>();
    const maybeRepo = normalizeHfRepo(q);
    if (isHfRepoId(maybeRepo)) {
      try {
        const card = await inspectRepo(maybeRepo);
        if (card.id) {
          models.push(card);
          seen.add(card.id);
        }
      } catch {
        // search still runs
      }
    }
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const m = mapHub(row as Record<string, unknown>);
      if (!m.id || seen.has(m.id)) continue;
      seen.add(m.id);
      models.push(m);
    }
    return { models };
  });

async function inspectRepo(id: string): Promise<HubCard> {
  const repo = normalizeHfRepo(id);
  if (!isHfRepoId(repo)) throw new Error(HUB_ERROR.repo);
  const cached = metadataCache.get(repo) as HubCard | undefined;
  if (cached) return cached;
  const json = await hfGet(`${HF_API}/${encodeURI(repo)}`);
  if (!json || typeof json !== "object") throw new Error(HUB_ERROR.empty);
  const rec = json as Record<string, unknown>;
  const base = mapHub({ ...rec, id: rec.id ?? rec.modelId ?? repo });
  const siblings = Array.isArray(rec.siblings)
    ? rec.siblings
        .map((s) =>
          s && typeof s === "object" && "rfilename" in s
            ? String((s as { rfilename: unknown }).rfilename)
            : "",
        )
        .filter(Boolean)
    : [];
  const card: HubCard = {
    ...base,
    id: base.id || repo,
    siblings: siblings.slice(0, 40),
    lastModified: typeof rec.lastModified === "string" ? rec.lastModified : undefined,
    gguf: base.gguf || siblings.some((n) => /\.gguf$/i.test(n)),
    metadata: mapHfMetadata({ ...rec, id: rec.id ?? rec.modelId ?? repo }),
    weightSha256: sha256FromSiblings(rec.siblings) || undefined,
  };
  await metadataCache.set(repo, card);
  return card;
}

export const inspectHfModel = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(200) }))
  .handler(async ({ data }): Promise<HubCard> => inspectRepo(data.id));

export type CatalogLiveItem = {
  id: string;
  lastModified: string | null;
  gated: boolean | null;
  error: string | null;
};

export const refreshCatalogLive = createServerFn({ method: "POST" })
  .validator(z.object({ ids: z.array(z.string().min(1).max(200)).min(1).max(40) }))
  .handler(async ({ data }): Promise<{ fetchedAt: string; items: CatalogLiveItem[] }> => {
    const items: CatalogLiveItem[] = [];
    for (const raw of data.ids) {
      try {
        const card = await inspectRepo(raw);
        items.push({
          id: card.id,
          lastModified: card.lastModified ?? null,
          gated: card.gated,
          error: null,
        });
      } catch (e) {
        const code = e instanceof Error ? e.message : HUB_ERROR.network;
        const head = code.split(" ")[0] ?? HUB_ERROR.network;
        items.push({
          id: raw,
          lastModified: null,
          gated: null,
          error: head.startsWith("HUB_") ? head : HUB_ERROR.network,
        });
      }
    }
    return { fetchedAt: new Date().toISOString(), items };
  });

const BAND_QUERIES: {
  search: string;
  sort: "downloads" | "lastModified";
  limit: number;
  filter?: string;
}[] = [
  { search: "Qwen3-4B-Instruct", sort: "downloads", limit: 20 },
  { search: "Qwen3-0.6B", sort: "downloads", limit: 10 },
  { search: "Qwen3-8B-Instruct", sort: "downloads", limit: 10 },
  { search: "Llama-3.1-8B-Instruct", sort: "downloads", limit: 10 },
  { search: "gemma-3-12b-it", sort: "downloads", limit: 10 },
  { search: "Qwen3.8-27B", sort: "downloads", limit: 10 },
  { search: "heretic", sort: "lastModified", limit: 10, filter: "gguf" },
  { search: "abliterated", sort: "downloads", limit: 10, filter: "gguf" },
];

export type HubBandCatalog = {
  fetchedAt: string;
  bands: Record<SizeBandId, HubBandPick[]>;
};

export const searchHfSizeBands = createServerFn({ method: "POST" })
  .validator(z.object({}))
  .handler(async (): Promise<HubBandCatalog> => {
    const chunks = await Promise.allSettled(
      BAND_QUERIES.map(async (q) => {
        const url = new URL(HF_API);
        url.searchParams.set("search", q.search);
        if (q.filter) url.searchParams.set("filter", q.filter);
        url.searchParams.set("sort", q.sort);
        url.searchParams.set("direction", "-1");
        url.searchParams.set("limit", String(q.limit));
        url.searchParams.set("full", "true");
        const json = await hfGet(url.toString());
        const rows = Array.isArray(json) ? json : [];
        return rows
          .filter((row) => row && typeof row === "object")
          .map((row) => mapHub(row as Record<string, unknown>));
      }),
    );
    const models = chunks.flatMap((row) => (row.status === "fulfilled" ? row.value : []));
    return {
      fetchedAt: new Date().toISOString(),
      bands: pickTopPerBand(models),
    };
  });

export { SIZE_BANDS };
