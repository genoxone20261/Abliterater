export type CompatModel = {
  id: string;
  ownedBy?: string;
};

export const COMPAT_ERROR = {
  url: "COMPAT_URL",
  http: "COMPAT_HTTP",
  network: "COMPAT_NETWORK",
} as const;

function stripSlash(url: string) {
  return url.replace(/\/+$/, "");
}

function modelsUrl(baseUrl: string) {
  const base = stripSlash(baseUrl.trim());
  const parsed = new URL(base);
  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(COMPAT_ERROR.url);
  }
  if (/\/v1$/i.test(base)) return `${base}/models`;
  if (/\/v1\//i.test(base)) return `${base.replace(/\/+$/, "")}/models`;
  return `${base}/v1/models`;
}

function authHeaders(apiKey?: string): HeadersInit {
  const h: Record<string, string> = { Accept: "application/json" };
  const key = (apiKey ?? "").trim();
  if (key) h.Authorization = `Bearer ${key}`;
  return h;
}

function parseList(json: unknown): CompatModel[] {
  const data =
    json && typeof json === "object" && "data" in json
      ? (json as { data: unknown }).data
      : json && typeof json === "object" && "models" in json
        ? (json as { models: unknown }).models
        : json;
  if (!Array.isArray(data)) return [];
  const out: CompatModel[] = [];
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const id =
      typeof rec.id === "string"
        ? rec.id
        : typeof rec.name === "string"
          ? rec.name
          : typeof rec.model === "string"
            ? rec.model
            : "";
    if (!id) continue;
    const ownedBy =
      typeof rec.owned_by === "string"
        ? rec.owned_by
        : typeof rec.ownedBy === "string"
          ? rec.ownedBy
          : undefined;
    out.push({ id, ownedBy });
  }
  return out;
}

/** Browser-side list. Works when this app and Ollama share a machine (CORS). */
export async function listCompatModelsClient(
  baseUrl: string,
  apiKey?: string,
  external?: AbortSignal,
): Promise<CompatModel[]> {
  const url = modelsUrl(baseUrl);
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  if (external?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
  external?.addEventListener("abort", onAbort, { once: true });
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    let res: Response;
    try {
      res = await fetch(url, { headers: authHeaders(apiKey), signal: ctrl.signal });
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AbortError") throw e;
        if (e instanceof TypeError) throw new Error(COMPAT_ERROR.network);
      }
      throw e;
    }
    if (!res.ok) {
      throw new Error(`${COMPAT_ERROR.http} ${res.status}`);
    }
    return parseList(await res.json());
  } finally {
    clearTimeout(timer);
    external?.removeEventListener("abort", onAbort);
  }
}

export { modelsUrl, parseList, authHeaders, stripSlash };
