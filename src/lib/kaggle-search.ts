import { LICENSE_UNCHECKED, SOURCE_ERROR, type SourceHit } from "./source-search.ts";

export const KAGGLE_ERROR = {
  query: "KAGGLE_QUERY",
  kind: "KAGGLE_KIND",
  auth: "KAGGLE_AUTH",
  schema: "KAGGLE_SCHEMA",
} as const;

/** Official list endpoint only. Live authenticated Kaggle calls stay OPEN until the user pastes a key. */
export function kaggleSearchUrl(query: string): URL {
  if (!query.trim() || query.length > 160) throw new Error(KAGGLE_ERROR.query);
  const url = new URL("https://www.kaggle.com/api/v1/datasets/list");
  url.searchParams.set("search", query.trim());
  url.searchParams.set("pageSize", "20");
  return url;
}

export function kaggleWebSearchUrl(query: string): URL {
  if (!query.trim() || query.length > 160) throw new Error(KAGGLE_ERROR.query);
  const url = new URL("https://www.kaggle.com/datasets");
  url.searchParams.set("search", query.trim());
  return url;
}

export function kaggleHit(query: string): {
  id: string;
  name: string;
  url: string;
  description: string;
  license: string;
  sha256: string;
} {
  const q = query.trim();
  const url = kaggleWebSearchUrl(q);
  return {
    id: `kaggle:${q.slice(0, 80)}`,
    name: q,
    url: url.href,
    description: "Kaggle web search. Paste a key to use the official list.",
    license: "LICENSE_UNCHECKED",
    sha256: "",
  };
}

function basicToken(user: string, key: string): string {
  const raw = `${user}:${key}`;
  if (typeof Buffer !== "undefined") return Buffer.from(raw, "utf8").toString("base64");
  return btoa(raw);
}

function mapKaggleRows(raw: unknown): SourceHit[] {
  const rec = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null;
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(rec?.datasetListItems)
      ? rec.datasetListItems
      : null;
  if (!rows) throw new Error(KAGGLE_ERROR.schema);
  const seen = new Set<string>();
  return rows.slice(0, 20).flatMap((value) => {
    const row =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
    const ref = typeof row.ref === "string" ? row.ref.trim() : "";
    if (!/^[\w.-]+\/[\w.-]+$/.test(ref) || seen.has(ref)) return [];
    seen.add(ref);
    const title = typeof row.title === "string" ? row.title.slice(0, 200) : ref;
    const subtitle = typeof row.subtitle === "string" ? row.subtitle.slice(0, 400) : "";
    const license = typeof row.licenseName === "string" ? row.licenseName.slice(0, 80) : "";
    const updated = typeof row.lastUpdated === "string" ? row.lastUpdated : undefined;
    return [
      {
        id: ref,
        name: title || ref,
        url: `https://www.kaggle.com/datasets/${ref}`,
        description: subtitle,
        license: license || LICENSE_UNCHECKED,
        updated,
        sha256: "",
      },
    ];
  });
}

/** User-pasted username+key, screen memory only. Never logs the key. */
export async function kaggleList(
  query: string,
  cred: { user: string; key: string },
  fetcher: typeof fetch = fetch,
): Promise<SourceHit[]> {
  if (!query.trim() || query.length > 160) throw new Error(KAGGLE_ERROR.query);
  const user = cred.user.trim();
  const key = cred.key.trim();
  if (!user || !key) throw new Error(KAGGLE_ERROR.auth);
  const url = kaggleSearchUrl(query);
  let response: Response;
  try {
    response = await fetcher(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${basicToken(user, key)}`,
        "User-Agent": "abliterater-workbench",
      },
      signal: AbortSignal.timeout(15000),
      redirect: "error",
      credentials: "omit",
    });
  } catch (e) {
    if (e instanceof Error) {
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
  const textBody = await response.text();
  if (textBody.length > 2_000_000) throw new Error(SOURCE_ERROR.size);
  let raw: unknown;
  try {
    raw = JSON.parse(textBody) as unknown;
  } catch {
    throw new Error(KAGGLE_ERROR.schema);
  }
  return mapKaggleRows(raw);
}
