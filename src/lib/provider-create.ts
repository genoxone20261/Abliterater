import { capabilityOf, validateBudget, type BudgetGuard } from "./provider-capabilities.ts";
import { providerAdapter, PROVIDER_ERROR, resolveProviderId } from "./provider-registry.ts";

export const CREATE_ERROR = {
  unsupported: "CREATE_UNSUPPORTED",
  fields: "CREATE_FIELDS",
  required: "CREATE_REQUIRED",
  requestId: "CREATE_REQUEST_ID",
} as const;

/** Bounded JSON keys from official OpenAPI (2026-09-14). Extra keys fail closed. */
export const CREATE_FIELDS: Record<string, readonly string[]> = {
  runpod: [
    "name",
    "imageName",
    "gpuTypeIds",
    "gpuCount",
    "cloudType",
    "volumeInGb",
    "containerDiskInGb",
  ],
  lambda: ["region_name", "instance_type_name", "ssh_key_names", "name", "image"],
  vast: ["image", "disk", "label", "client_id"],
};

export const CREATE_REQUIRED: Record<string, readonly string[]> = {
  runpod: ["imageName"],
  lambda: ["region_name", "instance_type_name", "ssh_key_names"],
  vast: [],
};

export function isUserCreateProvider(id: string): boolean {
  return capabilityOf(id)?.create === true;
}

export function sanitizeCreateBody(
  provider: string,
  input: Record<string, unknown>,
): Record<string, unknown> {
  const a = providerAdapter(provider);
  const allow = CREATE_FIELDS[a.id];
  if (!allow) throw new Error(CREATE_ERROR.unsupported);
  if (Object.keys(input).some((key) => !allow.includes(key))) throw new Error(CREATE_ERROR.fields);
  const out: Record<string, unknown> = {};
  for (const key of allow) {
    if (!(key in input)) continue;
    out[key] = input[key];
  }
  for (const key of CREATE_REQUIRED[a.id] ?? []) {
    const value = out[key];
    if (value === undefined || value === null || value === "")
      throw new Error(CREATE_ERROR.required);
    if (Array.isArray(value) && value.length === 0) throw new Error(CREATE_ERROR.required);
  }
  return out;
}

export function extractCreatedId(provider: string, data: unknown): string {
  const id = resolveProviderId(provider);
  const row =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};
  const nested =
    row.data && typeof row.data === "object" && !Array.isArray(row.data)
      ? (row.data as Record<string, unknown>)
      : {};
  const ids = Array.isArray(nested.instance_ids)
    ? nested.instance_ids
    : Array.isArray(row.instance_ids)
      ? row.instance_ids
      : [];
  const raw = String(row.id ?? row.podId ?? row.new_contract ?? nested.id ?? ids[0] ?? "");
  if (!raw || raw.length > 256) throw new Error(PROVIDER_ERROR.jobId);
  if (id === "vast" && !raw) throw new Error(PROVIDER_ERROR.jobId);
  return raw;
}

export type UserCreatePlan = {
  provider: string;
  requestId: string;
  mode: "dry-run" | "execute-ready";
  executable: boolean;
  costEnforced: false;
  cleanupRequired: true;
  maxUsd: number;
  maxMinutes: number;
  evidence: "user-key-create";
};

export function planUserCreate(request: {
  provider: string;
  requestId: string;
  budget: BudgetGuard;
  dryRun?: boolean;
}): UserCreatePlan {
  if (!isUserCreateProvider(request.provider)) throw new Error(CREATE_ERROR.unsupported);
  const errors = validateBudget(request.budget);
  if (errors.length) throw new Error(errors[0]);
  if (typeof request.requestId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(request.requestId)) {
    throw new Error(CREATE_ERROR.requestId);
  }
  const execute = request.dryRun === false;
  return {
    provider: resolveProviderId(request.provider),
    requestId: request.requestId,
    mode: execute ? "execute-ready" : "dry-run",
    executable: execute,
    costEnforced: false,
    cleanupRequired: true,
    maxUsd: request.budget.maxUsd,
    maxMinutes: request.budget.maxMinutes,
    evidence: "user-key-create",
  };
}
