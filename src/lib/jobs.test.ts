import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  listJobs,
  saveJob,
  removeJob,
  STORAGE_KEY,
  filterSavedJobs,
  JOB_ERROR,
  duplicateJob,
  hydrateJobs,
} from "./jobs.ts";
const data = new Map<string, string>();
const state = { project: "test", methods: ["quant"], outputs: ["gguf-q4"] } as Parameters<
  typeof saveJob
>[0];
beforeEach(() => {
  data.clear();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
      removeItem: (key: string) => {
        data.delete(key);
      },
    },
  });
});
test("storage quota failure never reports a successful save", () => {
  localStorage.setItem = () => {
    throw new Error("quota");
  };
  assert.throws(() => saveJob(state), new RegExp(JOB_ERROR.denied));
});
test("last legacy configuration does not resurrect after delete", () => {
  data.set("ablit.jobs.v1", JSON.stringify([{ id: "old", name: "old", savedAt: 1, state }]));
  removeJob("old");
  assert.deepEqual(listJobs(), []);
});
test("malformed collection fields cannot reach the workbench", () => {
  data.set(
    STORAGE_KEY,
    JSON.stringify([
      { id: "bad", name: "bad", savedAt: 1, state: { methods: null, outputs: "invalid" } },
    ]),
  );
  assert.deepEqual(listJobs(), []);
});
test("azure leftover fields cannot reach the workbench", () => {
  data.set(
    STORAGE_KEY,
    JSON.stringify([
      {
        id: "az",
        name: "az",
        savedAt: 1,
        state: {
          ...state,
          azureCpu: 4,
          azureRegion: "eastus",
          azureSpot: true,
          azureCredit: "startup",
        },
      },
    ]),
  );
  assert.deepEqual(listJobs(), []);
});
test("azure leftover string fields alone cannot reach the workbench", () => {
  data.set(
    STORAGE_KEY,
    JSON.stringify([
      {
        id: "azs",
        name: "azs",
        savedAt: 1,
        state: { ...state, azureRegion: "koreacentral", azureCredit: "startup" },
      },
    ]),
  );
  assert.deepEqual(listJobs(), []);
});
test("unavailable storage getter is handled when reading", () => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("denied");
    },
  });
  assert.deepEqual(listJobs(), []);
});

test("malformed nested method parameters are rejected", () => {
  data.set(
    STORAGE_KEY,
    JSON.stringify([
      {
        id: "bad",
        name: "bad",
        savedAt: 1,
        state: { ...state, methodParams: { lora: { r: "not-a-number" } } },
      },
    ]),
  );
  assert.deepEqual(listJobs(), []);
});

test("invalid state cannot overwrite an existing configuration", () => {
  saveJob(state);
  const before = data.get(STORAGE_KEY);
  assert.throws(() => saveJob({ ...state, methods: null } as unknown as typeof state));
  assert.equal(data.get(STORAGE_KEY), before);
});

test("real parameter schema allows output directory and quant enum", () => {
  const valid = {
    ...state,
    methodParams: {
      heretic: { n_trials: 50, max_weight: 1, direction_index: 0 },
      lora: { r: 16, alpha: 32, lr: 0.0002, epochs: 3, output_dir: "./adapter" },
      imatrix: { quant: "Q4_K_M", ctx: 4096 },
      cast: { coeff: 1 },
    },
  };
  assert.doesNotThrow(() => saveJob(valid));
  assert.equal(listJobs().length, 1);
});
test("UI extra systemUser field still hydrates", () => {
  const saved = saveJob({ ...state, systemUser: "juno" } as typeof state);
  const loaded = listJobs();
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].id, saved.id);
  assert.equal((loaded[0].state as { systemUser?: string }).systemUser, "juno");
});

test("HF and API secret fields cannot reach saved configurations", () => {
  for (const extra of [{ apiKey: "hf_secret" }, { hfToken: "hf_secret" }, { token: "x" }]) {
    data.set(
      STORAGE_KEY,
      JSON.stringify([{ id: "sec", name: "sec", savedAt: 1, state: { ...state, ...extra } }]),
    );
    assert.deepEqual(listJobs(), []);
  }
  assert.throws(() => saveJob({ ...state, apiKey: "hf_secret" } as typeof state));
});

test("filterSavedJobs matches name substring and empty query returns all", () => {
  const rows = [
    { id: "1", name: "QA retained configuration", savedAt: 1, state },
    { id: "2", name: "other", savedAt: 2, state },
  ];
  assert.equal(filterSavedJobs(rows, "").length, 2);
  assert.deepEqual(
    filterSavedJobs(rows, "QA retained").map((j) => j.id),
    ["1"],
  );
  assert.equal(filterSavedJobs(rows, "not-found").length, 0);
});

test("empty project name uses locale-neutral default", () => {
  const saved = saveJob({ ...state, project: "  " } as typeof state);
  assert.equal(saved.name, "config");
});

test("duplicateJob suffix is caller-supplied not Hangul leftover", () => {
  saveJob(state, "alpha");
  const id = listJobs()[0]?.id;
  assert.ok(id);
  const copy = duplicateJob(id, "copy");
  assert.equal(copy?.name, "alpha copy");
});

test("hydrateJobs reports dropped invalid rows without losing valid ones", () => {
  data.set(
    STORAGE_KEY,
    JSON.stringify([
      { id: "ok", name: "ok", savedAt: 1, state },
      { id: "bad", name: "bad", savedAt: 1, state: { methods: null, outputs: [] } },
    ]),
  );
  const report = hydrateJobs();
  assert.equal(report.jobs.length, 1);
  assert.equal(report.dropped, 1);
  assert.equal(report.jobs[0].id, "ok");
});

test("hydrateJobs treats a non-array payload as dropped", () => {
  data.set(STORAGE_KEY, JSON.stringify({ not: "an-array" }));
  const report = hydrateJobs();
  assert.deepEqual(report.jobs, []);
  assert.equal(report.dropped, 1);
});
