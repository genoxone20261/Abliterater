import { planUserCreate } from "./provider-create.ts";

export const LIFECYCLE_ERROR = {
  create: "LIFECYCLE_CREATE_UNIMPLEMENTED",
  stop: "LIFECYCLE_STOP_UNIMPLEMENTED",
} as const;

/** No request = leftover unimplemented. With budget+create-capable provider = user-key plan, not a live POST. */
export function createProviderResource(request?: Parameters<typeof planUserCreate>[0]) {
  if (!request) throw new Error(LIFECYCLE_ERROR.create);
  return planUserCreate(request);
}

export function stopProviderResource(): never {
  throw new Error(LIFECYCLE_ERROR.stop);
}

export function pageRows<T>(
  rows: T[],
  cursor = 0,
  limit = 50,
): { items: T[]; next: number | null } {
  const size = Math.min(Math.max(1, limit), 50);
  const start = Math.max(0, cursor);
  const items = rows.slice(start, start + size);
  const next = start + size < rows.length ? start + size : null;
  return { items, next };
}

export function artifactRecord(input: { uri: string; checksum?: string | null }): {
  uri: string;
  checksum: string | null;
  checksumVerified: false;
} {
  return { uri: input.uri, checksum: input.checksum ?? null, checksumVerified: false };
}

export function classifyHarvest(tags: string[]): "evaluator" | "tool" | "unknown" {
  const blob = tags.join(" ").toLowerCase();
  if (/\beval|benchmark|metric\b/.test(blob)) return "evaluator";
  if (/\bcli|sdk|library|tool\b/.test(blob)) return "tool";
  return "unknown";
}

export function missingMetadata(hit: { license?: string; revision?: string }): string[] {
  const missing: string[] = [];
  if (!hit.license || hit.license === "LICENSE_UNCHECKED" || hit.license === "unknown")
    missing.push("license");
  if (!hit.revision) missing.push("revision");
  return missing;
}

export function filterDashboard<T extends { status: string; provider: string }>(
  rows: T[],
  query: { status?: string; provider?: string },
): T[] {
  return rows.filter(
    (row) =>
      (!query.status || row.status === query.status) &&
      (!query.provider || row.provider === query.provider),
  );
}

export function notifyRedacted(text: string, redact: (value: string) => string): string {
  return redact(text).slice(0, 200);
}

export function createByteCache(maxBytes: number) {
  let used = 0;
  const map = new Map<string, string>();
  return {
    set(key: string, value: string): boolean {
      if (value.length > maxBytes) return false;
      if (used + value.length > maxBytes) return false;
      map.set(key, value);
      used += value.length;
      return true;
    },
    get(key: string): string | undefined {
      return map.get(key);
    },
  };
}
