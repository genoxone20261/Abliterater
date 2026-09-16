import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const CLIMAX_ORIGIN = "https://aiuncensoredindex.com";
export const CLIMAX_VERSION = "v0.3";
/** Published live-run date on the site, not this pull. */
export const CLIMAX_RUN = "2026-08-03";

export const CLIMAX_ERROR = {
  http: "CLIMAX_HTTP",
  size: "CLIMAX_SIZE",
  body: "CLIMAX_BODY",
  network: "CLIMAX_NETWORK",
} as const;

const NON_TEXT =
  /image|video|audio|flux|wan-|sd-3|sdxl|stable-diffusion|venice-sd|qwen-image|venice-audio/;

export type ClimaxRecord = {
  slug: string;
  canonical: string;
  creator: string;
  provider: string;
  modality: string;
  context: string;
  full: number;
  lawful: number;
  softened: number;
  refused: number;
  failed: number;
  latencyMs: number | null;
  costUsd: number | null;
  excluded: boolean;
  pageUrl: string;
  ifPct: number | null;
  quality: number | null;
};

export type ClimaxRanked = ClimaxRecord & {
  speed: number | null;
  costScore: number | null;
  composite: number | null;
  rank: number | null;
};

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n+/g, "\n");
}

function field(text: string, label: string): string {
  const re = new RegExp(`${label}\\n([^\\n]+)`, "i");
  return re.exec(text)?.[1]?.trim() ?? "";
}

export function parseClimaxIndex(html: string): string[] {
  const slugs: string[] = [];
  const seen = new Set<string>();
  const re = /href="\/models\/([a-z0-9-]+)\/"/gi;
  for (const m of html.matchAll(re)) {
    const slug = m[1];
    if (!slug || seen.has(slug) || NON_TEXT.test(slug)) continue;
    seen.add(slug);
    slugs.push(slug);
  }
  return slugs.slice(0, 24);
}

export function parseClimaxModelPage(html: string, slug: string): ClimaxRecord | null {
  const text = stripHtml(html);
  const stats =
    /(\d+)\s+full\s*\/\s*(\d+)\s+lawful,\s*(\d+)\s+softened,\s*(\d+)\s+refused,\s*(\d+)\s+failed/i.exec(
      text,
    );
  const lat = /Avg latency\s+(\d+)\s*ms/i.exec(text);
  const cost = /estimated cost\s+\$([0-9.]+)/i.exec(text);
  const excluded = /\bExcluded\b/i.test(text) || /\btimeout\b/i.test(text);
  if (!stats && excluded) {
    return {
      slug,
      canonical: field(text, "Canonical ID") || slug,
      creator: field(text, "Creator"),
      provider: field(text, "Provider route"),
      modality: field(text, "Modalities") || "text",
      context: field(text, "Context"),
      full: 0,
      lawful: 0,
      softened: 0,
      refused: 0,
      failed: 0,
      latencyMs: lat ? Number(lat[1]) : null,
      costUsd: cost ? Number(cost[1].replace(/\.$/, "")) : null,
      excluded: true,
      pageUrl: `${CLIMAX_ORIGIN}/models/${slug}/`,
      ifPct: null,
      quality: null,
    };
  }
  if (!stats) return null;
  const full = Number(stats[1]);
  const lawful = Number(stats[2]);
  const softened = Number(stats[3]);
  const refused = Number(stats[4]);
  const failed = Number(stats[5]);
  const ifPct = lawful > 0 ? (100 * full) / lawful : null;
  const quality = lawful > 0 ? (full * 100 + softened * 50) / lawful : null;
  return {
    slug,
    canonical: field(text, "Canonical ID") || slug,
    creator: field(text, "Creator"),
    provider: field(text, "Provider route"),
    modality: field(text, "Modalities") || "text",
    context: field(text, "Context"),
    full,
    lawful,
    softened,
    refused,
    failed,
    latencyMs: lat ? Number(lat[1]) : null,
    costUsd: cost ? Number(cost[1].replace(/\.$/, "")) : null,
    excluded,
    pageUrl: `${CLIMAX_ORIGIN}/models/${slug}/`,
    ifPct,
    quality,
  };
}

function invertNorm(value: number, min: number, max: number): number {
  if (max <= min) return 100;
  return (100 * (max - value)) / (max - min);
}

export function scoreClimaxRecords(records: readonly ClimaxRecord[]): ClimaxRanked[] {
  const rankedPool = records.filter(
    (r) => !r.excluded && r.modality.toLowerCase() === "text" && r.ifPct != null && r.quality != null,
  );
  const lats = rankedPool.map((r) => r.latencyMs).filter((n): n is number => n != null);
  const costs = rankedPool.map((r) => r.costUsd).filter((n): n is number => n != null);
  const minL = lats.length ? Math.min(...lats) : 0;
  const maxL = lats.length ? Math.max(...lats) : 0;
  const minC = costs.length ? Math.min(...costs) : 0;
  const maxC = costs.length ? Math.max(...costs) : 0;
  const scored: ClimaxRanked[] = records.map((r) => {
    if (r.excluded || r.ifPct == null || r.quality == null) {
      return { ...r, speed: null, costScore: null, composite: null, rank: null };
    }
    const speed = r.latencyMs == null ? null : invertNorm(r.latencyMs, minL, maxL);
    const costScore = r.costUsd == null ? null : invertNorm(r.costUsd, minC, maxC);
    const composite =
      0.5 * r.ifPct + 0.3 * r.quality + 0.1 * (speed ?? 0) + 0.1 * (costScore ?? 0);
    return { ...r, speed, costScore, composite, rank: null };
  });
  const order = scored
    .filter((r) => r.composite != null)
    .sort((a, b) => (b.composite ?? 0) - (a.composite ?? 0) || (a.latencyMs ?? 9e9) - (b.latencyMs ?? 9e9));
  order.forEach((row, i) => {
    row.rank = i + 1;
  });
  return scored.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
}

async function climaxGet(url: string): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    let res: Response;
    try {
      res = await fetch(url, {
        headers: { Accept: "text/html", "User-Agent": "abliterater-workbench" },
        signal: ctrl.signal,
      });
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") throw e;
      throw new Error(CLIMAX_ERROR.network);
    }
    if (!res.ok) throw new Error(`${CLIMAX_ERROR.http} ${res.status}`);
    const length = Number(res.headers.get("content-length") || 0);
    if (length > 2_000_000) throw new Error(CLIMAX_ERROR.size);
    const text = await res.text();
    if (text.length > 2_000_000) throw new Error(CLIMAX_ERROR.size);
    if (!text) throw new Error(CLIMAX_ERROR.body);
    return text;
  } finally {
    clearTimeout(timer);
  }
}

export type ClimaxPull = {
  fetchedAt: string;
  version: string;
  run: string;
  origin: string;
  models: ClimaxRanked[];
};

export const fetchClimaxIndex = createServerFn({ method: "POST" })
  .validator(z.object({}))
  .handler(async (): Promise<ClimaxPull> => {
    const indexHtml = await climaxGet(`${CLIMAX_ORIGIN}/models/`);
    const slugs = parseClimaxIndex(indexHtml);
    const pages = await Promise.allSettled(
      slugs.map(async (slug) => {
        const html = await climaxGet(`${CLIMAX_ORIGIN}/models/${slug}/`);
        return parseClimaxModelPage(html, slug);
      }),
    );
    const parsed: ClimaxRecord[] = [];
    for (const row of pages) {
      if (row.status === "fulfilled" && row.value) parsed.push(row.value);
    }
    return {
      fetchedAt: new Date().toISOString(),
      version: CLIMAX_VERSION,
      run: CLIMAX_RUN,
      origin: CLIMAX_ORIGIN,
      models: scoreClimaxRecords(parsed),
    };
  });
