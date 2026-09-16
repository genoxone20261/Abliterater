export type ExecutionStatus =
  | "draft"
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "cleanup-pending"
  | "cleaned";
export type ExecutionJob = {
  id: string;
  ownerId: string;
  provider: string;
  workload: string;
  requestId: string;
  status: ExecutionStatus;
  budgetUsd: number;
  maxMinutes: number;
  manifest: Record<string, unknown>;
};
const IDENT = /^[A-Za-z0-9._:-]{1,128}$/;
const SECRET_KEY = /token|secret|password|api.?key|private.?key|authorization|cookie/i;
function safeUrl(value: string): string {
  if (!/^https?:\/\//i.test(value)) return value;
  try {
    const url = new URL(value);
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, value.endsWith("/") ? "/" : "");
  } catch {
    return "[REDACTED]";
  }
}
function clean(value: unknown, seen: WeakSet<object>, depth = 0): unknown {
  if (typeof value === "string") return safeUrl(value).slice(0, 10000);
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return "[CIRCULAR]";
  if (depth >= 12) return "[TRUNCATED]";
  seen.add(value);
  if (Array.isArray(value)) return value.slice(0, 100).map((v) => clean(v, seen, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>).slice(0, 200))
    out[k] = SECRET_KEY.test(k) ? "[REDACTED]" : clean(v, seen, depth + 1);
  return out;
}
export const EXEC_ERROR = {
  manifest: "EXEC_MANIFEST",
  ident: "EXEC_IDENT",
  budget: "EXEC_BUDGET",
  minutes: "EXEC_MINUTES",
} as const;

export function redactManifest(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(EXEC_ERROR.manifest);
  return clean(value, new WeakSet()) as Record<string, unknown>;
}
export function validateExecutionJob(input: unknown): ExecutionJob {
  const r = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  for (const k of ["id", "ownerId", "provider", "workload", "requestId"])
    if (typeof r[k] !== "string" || !IDENT.test(r[k] as string)) throw new Error(EXEC_ERROR.ident);
  if (!Number.isFinite(r.budgetUsd) || Number(r.budgetUsd) < 0) throw new Error(EXEC_ERROR.budget);
  if (!Number.isInteger(r.maxMinutes) || Number(r.maxMinutes) < 1 || Number(r.maxMinutes) > 1440)
    throw new Error(EXEC_ERROR.minutes);
  return {
    id: r.id as string,
    ownerId: r.ownerId as string,
    provider: r.provider as string,
    workload: r.workload as string,
    requestId: r.requestId as string,
    status: "draft",
    budgetUsd: Number(r.budgetUsd),
    maxMinutes: Number(r.maxMinutes),
    manifest: redactManifest(r.manifest ?? {}),
  };
}
