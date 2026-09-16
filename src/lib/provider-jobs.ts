import type { BudgetGuard } from "./provider-capabilities.ts";
import { extractCreatedId, planUserCreate, sanitizeCreateBody } from "./provider-create.ts";
import {
  fillProviderPath,
  normalizeCredential,
  providerAdapter,
  PROVIDER_ERROR,
  resolveProviderId,
  usesMainProcessRead,
  type ProviderOperation,
} from "./provider-registry.ts";

export type JobStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled" | "unknown";
export type ProviderId = string;
export type ProviderJob = {
  id: string;
  provider: ProviderId;
  status: JobStatus;
  rawState: string;
  raw?: unknown;
  updatedAt: string;
};
export type ProviderCredentials = { provider: ProviderId; token: string };

export function providerBase(provider: ProviderId): string {
  return providerAdapter(provider).baseUrl;
}
export function authHeaders(credentials: ProviderCredentials): HeadersInit {
  const a = providerAdapter(credentials.provider);
  normalizeCredential(credentials.provider, credentials.token);
  if (a.credential === "none" || a.credential === "ssh") {
    return { Accept: "application/json" };
  }
  if (a.authHeader === "x-api-key") {
    return { Accept: "application/json", "X-API-KEY": credentials.token };
  }
  return { Accept: "application/json", Authorization: `Bearer ${credentials.token}` };
}

function rowsOf(data: unknown): unknown[] | null {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data;
  if (Array.isArray(o.instances)) return o.instances;
  if (Array.isArray(o.models)) return o.models;
  if (Array.isArray(o.jobs)) return o.jobs;
  if (Array.isArray(o.runningInstances)) return o.runningInstances;
  if (Array.isArray(o.clusters)) return o.clusters;
  if (Array.isArray(o.droplets)) return o.droplets;
  if (Array.isArray(o.containers)) return o.containers;
  return null;
}

/** Thunder Compute GET /instances/list is a keyed map, not an array. */
function keyedInstanceMap(data: unknown): unknown[] | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const entries = Object.entries(data as Record<string, unknown>);
  if (entries.some(([, value]) => !value || typeof value !== "object" || Array.isArray(value))) {
    return null;
  }
  return entries.map(([key, value]) => {
    const row = value as Record<string, unknown>;
    return { ...row, id: row.id ?? key };
  });
}

export function normalizeJob(provider: ProviderId, raw: unknown): ProviderJob {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const id = String(
    row.id ??
      row.podId ??
      row.instance_id ??
      row.instanceId ??
      row.cluster_id ??
      row.uuid ??
      row.name ??
      row.model ??
      "",
  );
  if (!id || id.length > 256) throw new Error(PROVIDER_ERROR.jobId);
  const value = String(
    row.status ?? row.state ?? row.desiredStatus ?? row.actual_status ?? row.cur_state ?? "unknown",
  ).toLowerCase();
  const status: JobStatus =
    value === "running" || value === "active" || value === "ready" || value === "rented"
      ? "running"
      : value.includes("success") || value === "completed"
        ? "succeeded"
        : value.includes("fail") || value === "error"
          ? "failed"
          : value.includes("cancel") || value.includes("term")
            ? "cancelled"
            : value.includes("queue") ||
                value.includes("pending") ||
                value.includes("init") ||
                value === "creating" ||
                value === "starting" ||
                value === "provisioning"
              ? "queued"
              : "unknown";
  return { id, provider, status, rawState: value, updatedAt: new Date().toISOString() };
}

function unwrapReadPayload(provider: ProviderId, data: unknown): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const o = data as Record<string, unknown>;
  const id = resolveProviderId(provider);
  if (id === "lambda" && "data" in o) return o.data;
  if (id === "vast" && "instances" in o) return o.instances;
  if (id === "massed-compute" && "runningInstance" in o) return o.runningInstance;
  if (id === "digitalocean_gpu" && "droplet" in o) return o.droplet;
  return data;
}

export async function providerRequest<T>(
  provider: ProviderId,
  credentials: ProviderCredentials,
  path: string,
  init: RequestInit = {},
  fetcher: typeof fetch = fetch,
  operation: ProviderOperation = "list",
): Promise<T> {
  if (provider !== credentials.provider) throw new Error(PROVIDER_ERROR.mismatch);
  const adapter = providerAdapter(provider);
  if (!adapter.operations.includes(operation)) {
    throw new Error(
      operation === "list" || operation === "read" ? PROVIDER_ERROR.read : PROVIDER_ERROR.mutate,
    );
  }
  if (!/^\/[A-Za-z0-9_./-]*$/.test(path) || path.includes(".."))
    throw new Error(PROVIDER_ERROR.path);
  const response = await fetcher(`${providerBase(provider)}${path}`, {
    ...init,
    headers: { ...authHeaders(credentials), ...(init.headers || {}) },
    signal: init.signal ?? AbortSignal.timeout(15000),
    redirect: "error",
    credentials: "omit",
  });
  const body = await response.text();
  let data: unknown = null;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = body.slice(0, 1000);
  }
  if (!response.ok) throw new Error(`${PROVIDER_ERROR.http} ${response.status}`);
  return data as T;
}

export async function listProviderJobs(
  provider: ProviderId,
  credentials: ProviderCredentials,
  fetcher?: typeof fetch,
): Promise<ProviderJob[]> {
  const adapter = providerAdapter(provider);
  if (!adapter.operations.includes("list")) throw new Error(PROVIDER_ERROR.read);
  if (
    !fetcher &&
    typeof window !== "undefined" &&
    window.electron?.providerRead &&
    usesMainProcessRead(provider)
  ) {
    fetcher = async () =>
      new Response(
        JSON.stringify(
          await window.electron!.providerRead!({
            provider: adapter.id,
            token: credentials.token,
          }),
        ),
        { headers: { "Content-Type": "application/json" } },
      );
  }
  const data = await providerRequest<unknown>(
    provider,
    credentials,
    adapter.listPath,
    {},
    fetcher,
    "list",
  );
  let rows = rowsOf(data);
  if (!rows && resolveProviderId(provider) === "thunder-compute") {
    rows = keyedInstanceMap(data);
  }
  if (!rows) throw new Error(PROVIDER_ERROR.schema);
  return rows.map((row) => normalizeJob(provider, row));
}

export async function getProviderJob(
  provider: ProviderId,
  credentials: ProviderCredentials,
  id: string,
  fetcher?: typeof fetch,
): Promise<ProviderJob> {
  if (!/^[\w.-]{1,256}$/.test(id)) throw new Error(PROVIDER_ERROR.jobId);
  const adapter = providerAdapter(provider);
  if (!adapter.operations.includes("read")) throw new Error(PROVIDER_ERROR.read);
  if (
    !fetcher &&
    typeof window !== "undefined" &&
    window.electron?.providerRead &&
    usesMainProcessRead(provider)
  ) {
    fetcher = async () =>
      new Response(
        JSON.stringify(
          await window.electron!.providerRead!({
            provider: adapter.id,
            token: credentials.token,
            id,
          }),
        ),
        { headers: { "Content-Type": "application/json" } },
      );
  }
  const data = await providerRequest<unknown>(
    provider,
    credentials,
    fillProviderPath(adapter.readPath, id),
    {},
    fetcher,
    "read",
  );
  return normalizeJob(provider, unwrapReadPayload(provider, data));
}

function mutateFetcher(
  provider: ProviderId,
  credentials: ProviderCredentials,
  fetcher?: typeof fetch,
): typeof fetch | undefined {
  if (fetcher) return fetcher;
  if (
    typeof window !== "undefined" &&
    window.electron?.providerMutate &&
    usesMainProcessRead(provider)
  ) {
    return async (input, init) => {
      const url = String(input);
      const adapter = providerAdapter(provider);
      const method = String(init?.method ?? "POST");
      const bodyText = typeof init?.body === "string" ? init.body : "";
      const payload = await window.electron!.providerMutate!({
        provider: adapter.id,
        token: credentials.token,
        method,
        url,
        body: bodyText,
        requestId: String(
          (init?.headers as Record<string, string> | undefined)?.["Idempotency-Key"] ?? "",
        ),
      });
      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
      });
    };
  }
  return undefined;
}

export async function createProviderJob(
  provider: ProviderId,
  credentials: ProviderCredentials,
  input: {
    budget: BudgetGuard;
    requestId: string;
    body: Record<string, unknown>;
    offerId?: string;
    dryRun?: boolean;
  },
  fetcher?: typeof fetch,
): Promise<ProviderJob> {
  const adapter = providerAdapter(provider);
  if (!adapter.operations.includes("create") || !adapter.createPath)
    throw new Error(PROVIDER_ERROR.mutate);
  const execute = input.dryRun === false;
  planUserCreate({
    provider,
    requestId: input.requestId,
    budget: input.budget,
    dryRun: execute ? false : true,
  });
  const body = sanitizeCreateBody(provider, input.body);
  if (
    adapter.createPath.includes("{id}") &&
    (!input.offerId || !/^[\w.-]{1,256}$/.test(input.offerId))
  ) {
    throw new Error(PROVIDER_ERROR.jobId);
  }
  const path = adapter.createPath.includes("{id}")
    ? fillProviderPath(adapter.createPath, input.offerId ?? "")
    : adapter.createPath;
  if (!execute) {
    return {
      id: input.requestId,
      provider,
      status: "queued",
      rawState: "dry-run",
      updatedAt: new Date().toISOString(),
    };
  }
  const data = await providerRequest<unknown>(
    provider,
    credentials,
    path,
    {
      method: adapter.createMethod,
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": input.requestId,
      },
      body: JSON.stringify(body),
    },
    mutateFetcher(provider, credentials, fetcher) ?? fetcher ?? fetch,
    "create",
  );
  const createdId = extractCreatedId(provider, data);
  if (adapter.operations.includes("read") && adapter.readPath) {
    try {
      return await getProviderJob(provider, credentials, createdId, fetcher);
    } catch {
      return normalizeJob(provider, {
        id: createdId,
        status: "creating",
        ...(data && typeof data === "object" ? data : {}),
      });
    }
  }
  return normalizeJob(provider, { id: createdId, status: "creating" });
}

export async function stopProviderJob(
  provider: ProviderId,
  credentials: ProviderCredentials,
  id: string,
  fetcher?: typeof fetch,
): Promise<void> {
  if (!/^[\w.-]{1,256}$/.test(id)) throw new Error(PROVIDER_ERROR.jobId);
  const adapter = providerAdapter(provider);
  if (!adapter.operations.includes("stop") || !adapter.stopPath)
    throw new Error(PROVIDER_ERROR.mutate);
  const path = adapter.stopPath.includes("{id}")
    ? fillProviderPath(adapter.stopPath, id)
    : adapter.stopPath;
  const lambdaBody =
    resolveProviderId(provider) === "lambda" ? JSON.stringify({ instance_ids: [id] }) : undefined;
  await providerRequest(
    provider,
    credentials,
    path,
    {
      method: adapter.stopMethod,
      headers: lambdaBody ? { "Content-Type": "application/json" } : undefined,
      body: lambdaBody,
    },
    mutateFetcher(provider, credentials, fetcher) ?? fetcher ?? fetch,
    "stop",
  );
}

export async function removeProviderJob(
  provider: ProviderId,
  credentials: ProviderCredentials,
  id: string,
  fetcher?: typeof fetch,
): Promise<void> {
  if (!/^[\w.-]{1,256}$/.test(id)) throw new Error(PROVIDER_ERROR.jobId);
  const adapter = providerAdapter(provider);
  if (!adapter.operations.includes("remove") || !adapter.removePath)
    throw new Error(PROVIDER_ERROR.mutate);
  const path = adapter.removePath.includes("{id}")
    ? fillProviderPath(adapter.removePath, id)
    : adapter.removePath;
  const lambdaBody =
    resolveProviderId(provider) === "lambda" ? JSON.stringify({ instance_ids: [id] }) : undefined;
  await providerRequest(
    provider,
    credentials,
    path,
    {
      method: adapter.removeMethod,
      headers: lambdaBody ? { "Content-Type": "application/json" } : undefined,
      body: lambdaBody,
    },
    mutateFetcher(provider, credentials, fetcher) ?? fetcher ?? fetch,
    "remove",
  );
}
