/**
 * Provider-call log (P3-8) — minimal client-side log so that the
 * Studio shows the last 50 model interactions (eval, chat, api-list)
 * without forcing a server round trip. localStorage-backed; export
 * as JSON for support tickets.
 *
 * Why localStorage: the live preview has no DB, and adding a server
 * route would force auth + table migrations just to inspect a
 * developer log. The DB-backed log is a follow-up if we need
 * cross-device or audit retention.
 */

export type ProviderKind = "hf" | "api" | "ollama" | "vllm" | "openai" | "azure";

export type ProviderCall = {
  id: string;
  ts: number;
  provider: ProviderKind;
  endpoint: string;
  status: "ok" | "warn" | "err";
  durationMs: number;
  note?: string;
  modelId?: string;
  bytes?: number;
};

const LOG_KEY = "ablit.provider-log.v1";
const MAX_ROWS = 200;
const SECRET_PATTERN = /(?:bearer\s+|api[_-]?key[=:]\s*|token[=:]\s*)[^\s,;]+/gi;

export function redactLogText(value: string): string {
  return value
    .replace(/\/\/([^/@\s]+):([^/@\s]*)@/g, "//[REDACTED]@")
    .replace(SECRET_PATTERN, (match) => `${match.split(/[=: ]/)[0]}=[REDACTED]`)
    .slice(0, 200);
}

function canStore() {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): ProviderCall[] {
  if (!canStore()) return [];
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is ProviderCall =>
        !!row &&
        typeof row === "object" &&
        typeof (row as ProviderCall).id === "string" &&
        typeof (row as ProviderCall).ts === "number" &&
        typeof (row as ProviderCall).provider === "string" &&
        typeof (row as ProviderCall).endpoint === "string" &&
        typeof (row as ProviderCall).status === "string" &&
        typeof (row as ProviderCall).durationMs === "number",
    );
  } catch {
    return [];
  }
}

function writeAll(rows: ProviderCall[]): boolean {
  if (!canStore()) return false;
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(rows.slice(0, MAX_ROWS)));
    return true;
  } catch {
    return false;
  }
}

export function recordCall(c: Omit<ProviderCall, "id" | "ts">): ProviderCall {
  const row: ProviderCall = {
    id: newId(),
    ts: Date.now(),
    ...c,
    endpoint: redactLogText(c.endpoint),
    note: c.note ? redactLogText(c.note) : undefined,
  };
  const all = [row, ...readAll()].slice(0, MAX_ROWS);
  writeAll(all);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("ablit-provider-log"));
  return row;
}

export function loggingAvailable(): boolean {
  if (!canStore()) return false;
  try {
    const probe = `${LOG_KEY}.probe`;
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function listCalls(limit = 50): ProviderCall[] {
  return readAll().slice(0, limit);
}

export function clearLog(): void {
  if (!canStore()) return;
  try {
    localStorage.removeItem(LOG_KEY);
  } catch {
    // no-op
  }
}

export function exportLog(): string {
  return JSON.stringify(readAll(), null, 2);
}

export function exportSupportBundle(): string {
  return JSON.stringify(
    {
      schemaVersion: 1,
      redacted: true,
      secrets: false,
      logs: readAll(),
    },
    null,
    2,
  );
}

/** Helper for ergonomics: measure duration around an async block. */
export async function timed<T>(
  provider: ProviderKind,
  endpoint: string,
  fn: () => Promise<T>,
  meta?: Pick<ProviderCall, "modelId" | "bytes">,
): Promise<T> {
  const t0 = performance.now();
  try {
    const out = await fn();
    recordCall({
      provider,
      endpoint,
      status: "ok",
      durationMs: Math.round(performance.now() - t0),
      ...meta,
    });
    return out;
  } catch (e) {
    recordCall({
      provider,
      endpoint,
      status: "err",
      durationMs: Math.round(performance.now() - t0),
      note: redactLogText(e instanceof Error ? e.message : String(e)),
      ...meta,
    });
    throw e;
  }
}
