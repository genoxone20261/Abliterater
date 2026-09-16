import test from "node:test";
import assert from "node:assert/strict";
import { defaultWorkspaceRoot, validateWorkspaceRoot } from "./workspace-storage.ts";
import { validateExecutionJob, redactManifest, EXEC_ERROR } from "./execution-jobs.ts";

test("workspace defaults to an OS user data location, not the source repository", () => {
  assert.match(
    defaultWorkspaceRoot("win32", { LOCALAPPDATA: "C:\\Users\\Demo\\AppData\\Local" }),
    /Abliterater$/,
  );
  assert.match(
    defaultWorkspaceRoot("linux", { XDG_DATA_HOME: "/home/demo/.local/share" }),
    /Abliterater$/,
  );
  assert.match(defaultWorkspaceRoot("darwin", { HOME: "/Users/demo" }), /Abliterater$/);
});
test("workspace root rejects empty and repository-looking paths", () => {
  assert.throws(() => validateWorkspaceRoot(""));
  assert.throws(() => validateWorkspaceRoot("D:/repos/outside-workspace"));
  assert.equal(
    validateWorkspaceRoot("C:/Users/Demo/AppData/Local/Abliterater"),
    "C:/Users/Demo/AppData/Local/Abliterater",
  );
});

test("execution job validates finite budget and safe identity", () => {
  const job = validateExecutionJob({
    id: "job-1",
    ownerId: "user-1",
    provider: "runpod",
    workload: "lora",
    requestId: "req-1",
    budgetUsd: 2,
    maxMinutes: 30,
    manifest: { model: "org/model" },
  });
  assert.equal(job.status, "draft");
  assert.throws(
    () => validateExecutionJob({ ...job, budgetUsd: NaN }),
    new RegExp(EXEC_ERROR.budget),
  );
  assert.throws(
    () => validateExecutionJob({ ...job, maxMinutes: 2000 }),
    new RegExp(EXEC_ERROR.minutes),
  );
  assert.throws(() => validateExecutionJob({ ...job, ownerId: "" }), new RegExp(EXEC_ERROR.ident));
});
test("manifest rejects invalid roots and redacts deep values and URL credentials", () => {
  const nested = { a: { b: { c: { d: { e: { f: { token: "fixture-leak" } } } } } } };
  assert.ok(!JSON.stringify(redactManifest(nested)).includes("fixture-leak"));
  assert.equal(
    redactManifest({ url: "https://user:pass@example.org/file?token=fixture-leak#secret" }).url,
    "https://example.org/file",
  );
  for (const value of [null, [], "text", 42]) assert.throws(() => redactManifest(value));
  const cyclic: Record<string, unknown> = {};
  cyclic.self = cyclic;
  assert.doesNotThrow(() => JSON.stringify(redactManifest(cyclic)));
});

test("execution manifest strips secrets before persistence", () => {
  const value = redactManifest({
    model: "org/model",
    token: "secret",
    nested: { apiKey: "secret", dataset: "org/data" },
    url: "https://user:pass@example.com/path?token=x",
  });
  assert.equal(value.token, "[REDACTED]");
  const nested = value.nested as Record<string, unknown>;
  assert.equal(nested.apiKey, "[REDACTED]");
  assert.equal(value.model, "org/model");
  assert.equal(JSON.stringify(value).includes("user:pass"), false);
});
