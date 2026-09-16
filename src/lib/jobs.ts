import type { StudioState } from "@/lib/studio";

export const STORAGE_KEY = "ablit.configs.v1";
const LEGACY_KEY = "ablit.jobs.v1";
const NUMERIC_PARAM_KEYS = new Set([
  "n_trials",
  "max_weight",
  "direction_index",
  "r",
  "alpha",
  "lr",
  "epochs",
  "ctx",
  "coeff",
]);
const STRING_PARAM_KEYS = new Set(["output_dir", "quant", "method"]);
const SECRET_STATE_KEYS = new Set([
  "apiKey",
  "hfToken",
  "HF_TOKEN",
  "token",
  "password",
  "openaiKey",
]);
const ALLOWED_STATE_KEYS = new Set([
  "purpose",
  "domain",
  "methods",
  "base",
  "modelSource",
  "hfRepo",
  "hfRevision",
  "localPath",
  "apiBaseUrl",
  "apiModel",
  "baseVram",
  "compute",
  "gpu",
  "storeBase",
  "storeBaseUri",
  "storeData",
  "storeDataUri",
  "datasetRevision",
  "datasetLicense",
  "datasetChecksum",
  "storeOut",
  "storeOutUri",
  "outputs",
  "project",
  "notes",
  "methodParams",
  "systemUser",
]);

export type SavedConfig = {
  id: string;
  name: string;
  savedAt: number;
  state: StudioState;
};

/** @deprecated 이름은 구성. 예전 import 호환. */
export type SavedJob = SavedConfig;

function canStore() {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function cloneState(state: StudioState): StudioState {
  return JSON.parse(JSON.stringify(state)) as StudioState;
}

function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `cfg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isSavedConfig(row: unknown): row is SavedConfig {
  return (
    !!row &&
    typeof row === "object" &&
    typeof (row as SavedConfig).id === "string" &&
    typeof (row as SavedConfig).name === "string" &&
    typeof (row as SavedConfig).savedAt === "number" &&
    Number.isFinite((row as SavedConfig).savedAt) &&
    !!(row as SavedConfig).state &&
    validState((row as SavedConfig).state)
  );
}

export type HydrateReport = { jobs: SavedConfig[]; dropped: number };

function parseRowsWithDrop(raw: string | null): HydrateReport {
  if (!raw) return { jobs: [], dropped: 0 };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { jobs: [], dropped: 1 };
    const jobs: SavedConfig[] = [];
    let dropped = 0;
    for (const row of parsed) {
      if (isSavedConfig(row)) jobs.push(row);
      else dropped += 1;
    }
    return { jobs, dropped };
  } catch {
    return { jobs: [], dropped: 1 };
  }
}

function parseRows(raw: string | null): SavedConfig[] {
  return parseRowsWithDrop(raw).jobs;
}

function readAll(): SavedConfig[] {
  if (!canStore()) return [];
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    return parseRows(current === null ? localStorage.getItem(LEGACY_KEY) : current);
  } catch {
    return [];
  }
}

export function hydrateJobs(): HydrateReport {
  if (!canStore()) return { jobs: [], dropped: 0 };
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    const report = parseRowsWithDrop(current === null ? localStorage.getItem(LEGACY_KEY) : current);
    return {
      jobs: report.jobs.slice().sort((a, b) => b.savedAt - a.savedAt),
      dropped: report.dropped,
    };
  } catch {
    return { jobs: [], dropped: 0 };
  }
}

function validState(state: unknown): state is StudioState {
  if (!state || typeof state !== "object" || Array.isArray(state)) return false;
  const values = state as Record<string, unknown>;
  if (
    !["methods", "outputs"].every(
      (key) =>
        Array.isArray(values[key]) &&
        values[key].every((item: unknown) => typeof item === "string"),
    )
  )
    return false;
  return Object.entries(values).every(([key, value]) => {
    if (SECRET_STATE_KEYS.has(key)) return false;
    if (!ALLOWED_STATE_KEYS.has(key)) return false;
    if (key === "methods" || key === "outputs") return true;
    if (key === "methodParams") {
      return (
        !!value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.values(value).every(
          (group) =>
            !!group &&
            typeof group === "object" &&
            !Array.isArray(group) &&
            Object.entries(group).every(([itemKey, item]) =>
              NUMERIC_PARAM_KEYS.has(itemKey)
                ? typeof item === "number" && Number.isFinite(item)
                : STRING_PARAM_KEYS.has(itemKey) && typeof item === "string",
            ),
        )
      );
    }
    if (value === undefined) return true;
    return typeof value === "string";
  });
}

export const JOB_ERROR = {
  unavailable: "JOB_STORAGE_UNAVAILABLE",
  denied: "JOB_STORAGE_DENIED",
  invalid: "JOB_INVALID_STATE",
} as const;

function writeAll(jobs: SavedConfig[]) {
  if (!canStore()) {
    throw new Error(JOB_ERROR.unavailable);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    throw new Error(JOB_ERROR.denied);
  }
}

export function filterSavedJobs(jobs: SavedConfig[], query: string): SavedConfig[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return jobs;
  return jobs.filter((job) => job.name.toLocaleLowerCase().includes(q));
}

export function listJobs(): SavedConfig[] {
  return hydrateJobs().jobs;
}

export function loadJob(id: string): StudioState | null {
  const found = readAll().find((j) => j.id === id);
  return found ? cloneState(found.state) : null;
}

export function saveJob(state: StudioState, name?: string): SavedConfig {
  if (!validState(state)) {
    throw new Error(JOB_ERROR.invalid);
  }
  const job: SavedConfig = {
    id: newId(),
    name: (name ?? state.project ?? "").trim() || "config",
    savedAt: Date.now(),
    state: cloneState(state),
  };
  writeAll([job, ...readAll().filter((j) => j.id !== job.id)]);
  return job;
}

export function removeJob(id: string): void {
  writeAll(readAll().filter((j) => j.id !== id));
}

export function duplicateJob(id: string, copySuffix = "copy"): SavedConfig | null {
  const found = readAll().find((j) => j.id === id);
  if (!found) return null;
  return saveJob(found.state, `${found.name} ${copySuffix}`);
}

export function clearAllJobs(): void {
  writeAll([]);
}

export function resetToDefault(state: StudioState): StudioState {
  return JSON.parse(JSON.stringify(state)) as StudioState;
}
