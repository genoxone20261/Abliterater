export const CLI_MONITOR_ERROR = {
  unimplemented: "CLI_MONITOR_UNIMPLEMENTED",
  schema: "CLI_MONITOR_SCHEMA",
} as const;

export type CliMonitorKind = "azure-ml" | "aws" | "gcp";

export function runCliMonitor(_kind: CliMonitorKind): never {
  throw new Error(CLI_MONITOR_ERROR.unimplemented);
}

export function parseCliJobList(raw: unknown): { id: string; status: string; rawState: string }[] {
  if (!Array.isArray(raw)) throw new Error(CLI_MONITOR_ERROR.schema);
  return raw.map((row) => {
    if (!row || typeof row !== "object") throw new Error(CLI_MONITOR_ERROR.schema);
    const rec = row as Record<string, unknown>;
    const id = typeof rec.id === "string" ? rec.id : "";
    const status =
      typeof rec.status === "string"
        ? rec.status
        : typeof rec.state === "string"
          ? rec.state
          : "unknown";
    if (!id) throw new Error(CLI_MONITOR_ERROR.schema);
    return { id, status, rawState: status };
  });
}

export const SPOT_ERROR = {
  interrupt: "SPOT_INTERRUPT_UNHANDLED",
  checkpoint: "SPOT_CHECKPOINT_UNVERIFIED",
} as const;

export function onSpotInterrupt(): never {
  throw new Error(SPOT_ERROR.interrupt);
}

export function recordSpotCheckpoint(path: string): { path: string; verified: false } {
  if (!path.trim()) throw new Error(SPOT_ERROR.checkpoint);
  return { path, verified: false };
}

export const WORKLOAD_ERROR = {
  qlora: "WORKLOAD_QLORA_UNRUN",
  gguf: "WORKLOAD_GGUF_UNRUN",
  iris: "WORKLOAD_IRIS_NOT_LORA",
  cartpole: "WORKLOAD_CARTPOLE_NOT_RL",
  dist: "WORKLOAD_DIST_UNRUN",
  serve: "WORKLOAD_SERVE_UNRUN",
} as const;

export function assertQloraUnrun(): never {
  throw new Error(WORKLOAD_ERROR.qlora);
}

export function assertGgufUnrun(): never {
  throw new Error(WORKLOAD_ERROR.gguf);
}

export function classifyIrisAccuracy(accuracy: number): {
  isLora: false;
  isQlora: false;
  sklearnSplit: true;
} {
  if (!(accuracy > 0 && accuracy <= 1)) throw new Error(WORKLOAD_ERROR.iris);
  return { isLora: false, isQlora: false, sklearnSplit: true };
}

export function classifyCartPole(
  reward: number,
  episodes: number,
): { isRlTrain: false; envPass: boolean } {
  return { isRlTrain: false, envPass: reward === 50 && episodes === 50 };
}

export function assertDistributedUnrun(): never {
  throw new Error(WORKLOAD_ERROR.dist);
}

export function assertServingUnrun(): never {
  throw new Error(WORKLOAD_ERROR.serve);
}

export function workloadProvenance(input: {
  codeRevision?: string;
  lockfile?: string;
  modelRevision?: string;
  datasetRevision?: string;
  hardware?: string;
  seed?: number;
}): {
  codeRevision: string | null;
  lockfile: string | null;
  modelRevision: string | null;
  datasetRevision: string | null;
  hardware: string | null;
  seed: number | null;
  executionVerified: false;
} {
  return {
    codeRevision: input.codeRevision ?? null,
    lockfile: input.lockfile ?? null,
    modelRevision: input.modelRevision ?? null,
    datasetRevision: input.datasetRevision ?? null,
    hardware: input.hardware ?? null,
    seed: typeof input.seed === "number" ? input.seed : null,
    executionVerified: false,
  };
}

export function packVsDownloadHash(
  packSha: string | null,
  downloadSha: string | null,
): {
  equal: false;
  downloadVerified: false;
  packSha: string | null;
  downloadSha: string | null;
} {
  return { equal: false, downloadVerified: false, packSha, downloadSha };
}

export type WizardAuth = "api-key" | "oauth2" | "cloud-cli";

export function wizardSteps(auth: WizardAuth): string[] {
  if (auth === "oauth2") return ["pkce", "callback", "scope"];
  if (auth === "cloud-cli") return ["detect-session", "no-copy"];
  return ["paste", "memory-only"];
}

export const COMMAND_CENTER_VIEWS = [
  "list",
  "detail",
  "log",
  "artifact",
  "cost",
  "cleanup",
] as const;

export type HttpFixtureKind =
  "ok" | "rate-limit" | "server" | "timeout" | "schema" | "expired" | "denied";

export function classifyHttpFixture(status: number, body: unknown): HttpFixtureKind {
  if (status === 401) return "expired";
  if (status === 403) return "denied";
  if (status === 429) return "rate-limit";
  if (status === 408 || status === 504) return "timeout";
  if (status >= 500) return "server";
  if (status >= 200 && status < 300) {
    if (
      body == null ||
      (typeof body === "object" && !Array.isArray(body) && Object.keys(body as object).length === 0)
    ) {
      return "schema";
    }
    return "ok";
  }
  return "schema";
}

export function paidCleanupLedger(resources: unknown[]): { remaining: number; verified: false } {
  return { remaining: resources.length, verified: false };
}
