export type ProviderOperation =
  "list" | "read" | "create" | "stop" | "remove" | "logs" | "artifacts";
export type ProviderKind = "http" | "local-probe" | "ssh" | "catalog";
export type ProviderCredential = "api-key" | "none" | "ssh" | "token-pair" | "cloud-cli";
export type ProviderAuthHeader = "bearer" | "x-api-key";
export type ProviderStatus = "live-adapter" | "catalog" | "degraded";

export type RegisteredProvider = {
  id: string;
  name: string;
  kind: ProviderKind;
  baseUrl: string;
  listPath: string;
  readPath: string;
  createPath: string;
  createMethod: "POST" | "PUT";
  stopPath: string;
  stopMethod: "POST" | "DELETE";
  removePath: string;
  removeMethod: "POST" | "DELETE";
  operations: ProviderOperation[];
  credential: ProviderCredential;
  authHeader: ProviderAuthHeader;
  status: ProviderStatus;
  officialDocs: string;
  launchHints: string[];
};

const READ: ProviderOperation[] = ["list", "read"];

function row(
  partial: Omit<
    RegisteredProvider,
    | "operations"
    | "launchHints"
    | "authHeader"
    | "createPath"
    | "createMethod"
    | "stopPath"
    | "stopMethod"
    | "removePath"
    | "removeMethod"
  > &
    Partial<
      Pick<
        RegisteredProvider,
        | "operations"
        | "launchHints"
        | "authHeader"
        | "createPath"
        | "createMethod"
        | "stopPath"
        | "stopMethod"
        | "removePath"
        | "removeMethod"
      >
    >,
): RegisteredProvider {
  return {
    operations: [],
    launchHints: [],
    authHeader: "bearer",
    createPath: "",
    createMethod: "POST",
    stopPath: "",
    stopMethod: "POST",
    removePath: "",
    removeMethod: "DELETE",
    ...partial,
  };
}

const REGISTRY: Record<string, RegisteredProvider> = {
  runpod: row({
    id: "runpod",
    name: "RunPod",
    kind: "http",
    baseUrl: "https://rest.runpod.io/v1",
    listPath: "/pods",
    readPath: "/pods/{id}",
    operations: ["list", "read", "create", "stop", "remove"],
    createPath: "/pods",
    createMethod: "POST",
    stopPath: "/pods/{id}/stop",
    stopMethod: "POST",
    removePath: "/pods/{id}",
    removeMethod: "DELETE",
    credential: "api-key",
    status: "live-adapter",
    officialDocs: "https://docs.runpod.io/api-reference/overview",
    launchHints: ["User-key list/read/create/stop after budget ack. Key stays in screen memory."],
  }),
  lambda: row({
    id: "lambda",
    name: "Lambda Cloud",
    kind: "http",
    baseUrl: "https://cloud.lambda.ai/api/v1",
    listPath: "/instances",
    readPath: "/instances/{id}",
    operations: ["list", "read", "create", "stop", "remove"],
    createPath: "/instance-operations/launch",
    createMethod: "POST",
    stopPath: "/instance-operations/terminate",
    stopMethod: "POST",
    removePath: "/instance-operations/terminate",
    removeMethod: "POST",
    credential: "api-key",
    status: "live-adapter",
    officialDocs: "https://docs-api.lambda.ai/api/cloud",
    launchHints: [
      "User-key launch/terminate after budget ack. Requires region, instance type, SSH key names.",
    ],
  }),
  vast: row({
    id: "vast",
    name: "Vast.ai",
    kind: "http",
    baseUrl: "https://console.vast.ai/api/v0",
    listPath: "/instances/",
    readPath: "/instances/{id}",
    operations: ["list", "read", "create", "remove"],
    createPath: "/asks/{id}/",
    createMethod: "PUT",
    removePath: "/instances/{id}/",
    removeMethod: "DELETE",
    credential: "api-key",
    status: "live-adapter",
    officialDocs: "https://docs.vast.ai/api-reference/introduction",
    launchHints: [
      "Authorization: Bearer ***",
      "User-key PUT /asks/{offerId}/ after budget ack. stop ≠ destroy.",
    ],
  }),
  shadeform: row({
    id: "shadeform",
    name: "Shadeform",
    kind: "http",
    baseUrl: "https://api.shadeform.ai/v1",
    listPath: "/instances",
    readPath: "/instances/{id}/info",
    operations: READ,
    credential: "api-key",
    authHeader: "x-api-key",
    status: "live-adapter",
    officialDocs: "https://docs.shadeform.ai/api-reference/instances/instances",
    launchHints: ["X-API-KEY list/read. Create in the Shadeform console (official docs)."],
  }),
  "massed-compute": row({
    id: "massed-compute",
    name: "Massed Compute",
    kind: "http",
    baseUrl: "https://vm.massedcompute.com/api/v1",
    listPath: "/instance",
    readPath: "/instance/{id}",
    operations: READ,
    credential: "api-key",
    status: "live-adapter",
    officialDocs: "https://vm-docs.massedcompute.com/api/v1",
    launchHints: ["GET /instance runningInstances[]. Create in the Massed Compute console."],
  }),
  "thunder-compute": row({
    id: "thunder-compute",
    name: "Thunder Compute",
    kind: "http",
    baseUrl: "https://api.thundercompute.com:8443/v1",
    listPath: "/instances/list",
    readPath: "",
    operations: ["list"],
    credential: "api-key",
    status: "live-adapter",
    officialDocs: "https://www.thundercompute.com/docs/api-reference/instances/list-instances",
    launchHints: ["GET /instances/list keyed map. Create in the Thunder Compute console."],
  }),
  "prime-intellect": row({
    id: "prime-intellect",
    name: "Prime Intellect",
    kind: "http",
    baseUrl: "https://api.primeintellect.ai/api/v1",
    listPath: "/pods/",
    readPath: "/pods/{id}",
    operations: READ,
    credential: "api-key",
    status: "live-adapter",
    officialDocs: "https://docs.primeintellect.ai/api-reference/pods/get-pods",
    launchHints: ["GET /pods/. Create in the Prime Intellect console."],
  }),
  "deep-infra-gpu": row({
    id: "deep-infra-gpu",
    name: "DeepInfra GPU Instances",
    kind: "http",
    baseUrl: "https://api.deepinfra.com/v1",
    listPath: "/containers",
    readPath: "/containers/{id}",
    operations: READ,
    credential: "api-key",
    status: "live-adapter",
    officialDocs: "https://docs.deepinfra.com/gpu-instances/overview",
    launchHints: ["GET /v1/containers. Create in the DeepInfra console."],
  }),
  digitalocean_gpu: row({
    id: "digitalocean_gpu",
    name: "DigitalOcean GPU Droplets",
    kind: "http",
    baseUrl: "https://api.digitalocean.com/v2",
    listPath: "/droplets",
    readPath: "/droplets/{id}",
    operations: READ,
    credential: "api-key",
    status: "live-adapter",
    officialDocs: "https://docs.digitalocean.com/reference/api/reference/droplets/",
    launchHints: [
      "GET /v2/droplets lists every Droplet on the token, not GPU-only",
      "Create GPU Droplets in the DigitalOcean console.",
    ],
  }),
  "together-compute": row({
    id: "together-compute",
    name: "Together GPU Clusters",
    kind: "http",
    baseUrl: "https://api.together.ai/v1",
    listPath: "/compute/clusters",
    readPath: "/compute/clusters/{id}",
    operations: READ,
    credential: "api-key",
    status: "live-adapter",
    officialDocs: "https://docs.together.ai/reference/clusters-list",
    launchHints: ["GET /compute/clusters. Create in the Together console."],
  }),
  modal: row({
    id: "modal",
    name: "Modal",
    kind: "catalog",
    baseUrl: "https://api.modal.com",
    listPath: "",
    readPath: "",
    credential: "token-pair",
    status: "catalog",
    officialDocs: "https://modal.com/docs/guide",
    launchHints: [
      "Modal is Functions/Apps, not GPU VM CRUD",
      "CLI: modal app list  (token id + secret)",
      "HTTP list/read is not implemented — do not treat as live pods",
    ],
  }),
  localhost_ollama: row({
    id: "localhost_ollama",
    name: "Ollama (loopback)",
    kind: "local-probe",
    baseUrl: "http://127.0.0.1:11434",
    listPath: "/api/tags",
    readPath: "/api/tags",
    operations: ["list"],
    credential: "none",
    status: "live-adapter",
    officialDocs: "https://github.com/ollama/ollama/blob/main/docs/api.md",
    launchHints: ["GET /api/tags — this machine only, no API key"],
  }),
  local: row({
    id: "local",
    name: "Ollama (loopback)",
    kind: "local-probe",
    baseUrl: "http://127.0.0.1:11434",
    listPath: "/api/tags",
    readPath: "/api/tags",
    operations: ["list"],
    credential: "none",
    status: "live-adapter",
    officialDocs: "https://github.com/ollama/ollama/blob/main/docs/api.md",
    launchHints: ["alias of localhost_ollama"],
  }),
  localhost_lmstudio: row({
    id: "localhost_lmstudio",
    name: "LM Studio (loopback)",
    kind: "local-probe",
    baseUrl: "http://127.0.0.1:1234/v1",
    listPath: "/models",
    readPath: "/models",
    operations: ["list"],
    credential: "none",
    status: "live-adapter",
    officialDocs: "https://lmstudio.ai/docs/developer",
    launchHints: ["OpenAI-compatible GET /v1/models"],
  }),
  ssh: row({
    id: "ssh",
    name: "SSH (plan only)",
    kind: "ssh",
    baseUrl: "",
    listPath: "",
    readPath: "",
    credential: "ssh",
    status: "catalog",
    officialDocs: "https://www.openssh.com/manual.html",
    launchHints: [
      "electron ssh-execution is plan-only (executable:false)",
      "keys never enter packs",
    ],
  }),
  tensordock: row({
    id: "tensordock",
    name: "TensorDock",
    kind: "catalog",
    baseUrl: "",
    listPath: "",
    readPath: "",
    credential: "api-key",
    status: "degraded",
    officialDocs: "https://tensordock.com/",
    launchHints: ["degraded — Voltage Park acquisition; do not treat as live"],
  }),
  jarvislabs: row({
    id: "jarvislabs",
    name: "Jarvislabs",
    kind: "catalog",
    baseUrl: "",
    listPath: "",
    readPath: "",
    credential: "api-key",
    status: "catalog",
    officialDocs: "https://docs.jarvislabs.ai/sdk/",
    launchHints: ["JL_API_KEY / SDK — no first-party REST list in the public SDK docs"],
  }),
  azure_ml: row({
    id: "azure_ml",
    name: "Azure Machine Learning",
    kind: "catalog",
    baseUrl: "",
    listPath: "",
    readPath: "",
    credential: "cloud-cli",
    status: "catalog",
    officialDocs: "https://learn.microsoft.com/en-us/rest/api/azureml/",
    launchHints: ["one cloud among many — no Startup-credit preset"],
  }),
};

export const PROVIDER_ERROR = {
  unavailable: "PROV_UNAVAILABLE",
  credential: "PROV_CREDENTIAL",
  mismatch: "PROV_MISMATCH",
  read: "PROV_READ",
  path: "PROV_PATH",
  jobId: "PROV_JOB_ID",
  schema: "PROV_SCHEMA",
  http: "PROV_HTTP",
  mutate: "PROV_MUTATE",
} as const;

/** Compute catalog uses kebab ids; live HTTP rows historically used underscores. */
const ID_ALIASES: Record<string, string> = {
  vastai: "vast",
  "digitalocean-gpu": "digitalocean_gpu",
};

export function resolveProviderId(id: string): string {
  if (Object.hasOwn(REGISTRY, id)) return id;
  if (Object.hasOwn(ID_ALIASES, id) && Object.hasOwn(REGISTRY, ID_ALIASES[id])) {
    return ID_ALIASES[id];
  }
  const swapped = id.includes("_") ? id.replaceAll("_", "-") : id.replaceAll("-", "_");
  if (Object.hasOwn(REGISTRY, swapped)) return swapped;
  return id;
}

export function providerAdapter(id: string): RegisteredProvider {
  const a = REGISTRY[resolveProviderId(id)];
  if (!a) throw new Error(PROVIDER_ERROR.unavailable);
  return {
    ...a,
    operations: [...a.operations],
    launchHints: [...a.launchHints],
  };
}

export function isLiveReadProvider(id: string): boolean {
  try {
    const a = providerAdapter(id);
    return a.status === "live-adapter" && a.operations.includes("list");
  } catch {
    return false;
  }
}

/** Electron main-process read is HTTP rental only — not loopback probes. */
export function usesMainProcessRead(id: string): boolean {
  try {
    const a = providerAdapter(id);
    return a.kind === "http" && isLiveReadProvider(id);
  } catch {
    return false;
  }
}

/** Drop hyphen/underscore duplicates so the connection select hits one live row. */
export function uniqueConnectionOptions<T extends { id: string }>(rows: readonly T[]): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    let key = row.id;
    try {
      key = providerAdapter(row.id).id;
    } catch {
      key = row.id;
    }
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeCredential(
  provider: string,
  token: string,
): { provider: string; token: string } {
  const a = providerAdapter(provider);
  if (a.credential === "none") return { provider: a.id, token: "" };
  if (a.credential === "ssh") {
    if (typeof token !== "string") throw new Error(PROVIDER_ERROR.credential);
    return { provider: a.id, token: token.trim() };
  }
  if (typeof token !== "string" || !token.trim() || token.length > 4096 || /[\r\n]/.test(token))
    throw new Error(PROVIDER_ERROR.credential);
  return { provider: a.id, token };
}

export function registeredProviders(): RegisteredProvider[] {
  return Object.values(REGISTRY).map((a) => ({
    ...a,
    operations: [...a.operations],
    launchHints: [...a.launchHints],
  }));
}

export function liveReadProviders(): RegisteredProvider[] {
  const seen = new Set<string>();
  return registeredProviders().filter((a) => {
    if (a.status !== "live-adapter" || !a.operations.includes("list")) return false;
    const key = `${a.kind}:${a.baseUrl}:${a.listPath}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function fillProviderPath(template: string, id: string): string {
  if (!template.includes("{id}")) return template;
  return template.replaceAll("{id}", encodeURIComponent(id));
}
