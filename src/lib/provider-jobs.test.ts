import test from "node:test";
import assert from "node:assert/strict";
import {
  authHeaders,
  createProviderJob,
  getProviderJob,
  listProviderJobs,
  normalizeJob,
  providerBase,
} from "./provider-jobs.ts";
import { PROVIDER_ERROR } from "./provider-registry.ts";

test("provider endpoints are fixed and credentials use bearer auth", () => {
  assert.equal(providerBase("runpod"), "https://rest.runpod.io/v1");
  assert.equal(providerBase("lambda"), "https://cloud.lambda.ai/api/v1");
  assert.equal(
    (authHeaders({ provider: "runpod", token: "secret" }) as Record<string, string>).Authorization,
    "Bearer secret",
  );
  assert.equal(
    (authHeaders({ provider: "shadeform", token: "secret" }) as Record<string, string>)[
      "X-API-KEY"
    ],
    "secret",
  );
  assert.equal(
    (authHeaders({ provider: "shadeform", token: "secret" }) as Record<string, string>)
      .Authorization,
    undefined,
  );
  assert.throws(() => authHeaders({ provider: "runpod", token: "" }));
});

test("RunPod desiredStatus is preserved when status is absent", () => {
  const job = normalizeJob("runpod", { id: "pod-2", desiredStatus: "RUNNING" });
  assert.equal(job.status, "running");
  assert.equal(job.rawState, "running");
});

test("job status maps queued/cancelled without dropping rawState", () => {
  const queued = normalizeJob("runpod", { id: "q1", status: "PENDING" });
  assert.equal(queued.status, "queued");
  assert.equal(queued.rawState, "pending");
  const cancelled = normalizeJob("runpod", { id: "c1", status: "TERMINATED" });
  assert.equal(cancelled.status, "cancelled");
  assert.equal(cancelled.rawState, "terminated");
});

test("list/read uses fixed paths and does not leak credentials", async () => {
  const calls: { url: string; auth: string }[] = [];
  const fetcher = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({
      url: String(url),
      auth: String((init?.headers as Record<string, string>).Authorization),
    });
    return new Response(
      JSON.stringify(
        String(url).endsWith("/pods")
          ? [{ id: "p1", status: "RUNNING" }]
          : { id: "p1", status: "EXITED" },
      ),
      { status: 200 },
    );
  }) as typeof fetch;
  const c = { provider: "runpod" as const, token: "token-x" };
  assert.equal((await listProviderJobs("runpod", c, fetcher))[0].status, "running");
  assert.equal((await getProviderJob("runpod", c, "p1", fetcher)).status, "unknown");
  assert.equal(calls[0].url, "https://rest.runpod.io/v1/pods");
  assert.equal(calls[0].auth, "Bearer token-x");
});

test("job ids cannot escape the allowlisted endpoint", async () => {
  await assert.rejects(
    () => getProviderJob("runpod", { provider: "runpod", token: "x" }, "../secrets"),
    new RegExp(PROVIDER_ERROR.jobId),
  );
});

test("unexpected list schema fails instead of pretending there are no jobs", async () => {
  const fetcher = (async () =>
    new Response(JSON.stringify({ unexpected: [] }), { status: 200 })) as typeof fetch;
  await assert.rejects(
    () => listProviderJobs("runpod", { provider: "runpod", token: "x" }, fetcher),
    new RegExp(PROVIDER_ERROR.schema),
  );
});

test("Vast list uses console.vast.ai /instances and instances[] schema", async () => {
  const calls: string[] = [];
  const fetcher = (async (url: string | URL | Request) => {
    calls.push(String(url));
    return new Response(
      JSON.stringify({
        instances_found: 1,
        instances: [{ id: 883, actual_status: "running" }],
      }),
      { status: 200 },
    );
  }) as typeof fetch;
  const jobs = await listProviderJobs("vast", { provider: "vast", token: "k" }, fetcher);
  assert.equal(jobs[0].id, "883");
  assert.equal(jobs[0].status, "running");
  assert.equal(calls[0], "https://console.vast.ai/api/v0/instances/");
});

test("Modal catalog has no live list", async () => {
  await assert.rejects(
    () => listProviderJobs("modal", { provider: "modal", token: "k" }),
    new RegExp(PROVIDER_ERROR.read),
  );
});

test("Shadeform list uses X-API-KEY and /instances/{id}/info", async () => {
  const calls: { url: string; key: string | undefined }[] = [];
  const fetcher = (async (url: string | URL | Request, init?: RequestInit) => {
    const headers = init?.headers as Record<string, string>;
    calls.push({ url: String(url), key: headers["X-API-KEY"] });
    return new Response(
      JSON.stringify(
        String(url).endsWith("/info")
          ? { id: "d290f1ee-6c54-4b01-90e6-d701748f0851", status: "active" }
          : { instances: [{ id: "d290f1ee-6c54-4b01-90e6-d701748f0851", status: "active" }] },
      ),
      { status: 200 },
    );
  }) as typeof fetch;
  const c = { provider: "shadeform" as const, token: "sf-key" };
  assert.equal((await listProviderJobs("shadeform", c, fetcher))[0].status, "running");
  assert.equal(
    (await getProviderJob("shadeform", c, "d290f1ee-6c54-4b01-90e6-d701748f0851", fetcher)).id,
    "d290f1ee-6c54-4b01-90e6-d701748f0851",
  );
  assert.equal(calls[0].url, "https://api.shadeform.ai/v1/instances");
  assert.equal(calls[0].key, "sf-key");
  assert.equal(
    calls[1].url,
    "https://api.shadeform.ai/v1/instances/d290f1ee-6c54-4b01-90e6-d701748f0851/info",
  );
});

test("Massed Compute list uses runningInstances uuid schema", async () => {
  const fetcher = (async () =>
    new Response(
      JSON.stringify({
        runningInstances: [{ uuid: "8b52a46b-a892-4fde-925c-6d13226908f7", status: "rented" }],
      }),
      { status: 200 },
    )) as typeof fetch;
  const jobs = await listProviderJobs(
    "massed-compute",
    { provider: "massed-compute", token: "k" },
    fetcher,
  );
  assert.equal(jobs[0].id, "8b52a46b-a892-4fde-925c-6d13226908f7");
  assert.equal(jobs[0].status, "running");
});

test("Thunder Compute keyed map lists without a per-id GET", async () => {
  const fetcher = (async () =>
    new Response(JSON.stringify({ "0": { status: "RUNNING", uuid: "abc" } }), {
      status: 200,
    })) as typeof fetch;
  const jobs = await listProviderJobs(
    "thunder-compute",
    { provider: "thunder-compute", token: "k" },
    fetcher,
  );
  assert.equal(jobs[0].id, "0");
  assert.equal(jobs[0].status, "running");
  await assert.rejects(
    () => getProviderJob("thunder-compute", { provider: "thunder-compute", token: "k" }, "0"),
    new RegExp(PROVIDER_ERROR.read),
  );
});

test("Together clusters and DigitalOcean droplets list schemas", async () => {
  const together = (async () =>
    new Response(JSON.stringify({ clusters: [{ cluster_id: "c1", status: "Ready" }] }), {
      status: 200,
    })) as typeof fetch;
  const droplets = (async () =>
    new Response(JSON.stringify({ droplets: [{ id: 3164444, status: "active" }] }), {
      status: 200,
    })) as typeof fetch;
  assert.equal(
    (
      await listProviderJobs(
        "together-compute",
        { provider: "together-compute", token: "k" },
        together,
      )
    )[0].id,
    "c1",
  );
  assert.equal(
    (
      await listProviderJobs(
        "digitalocean-gpu",
        { provider: "digitalocean-gpu", token: "k" },
        droplets,
      )
    )[0].id,
    "3164444",
  );
});

test("kebab Ollama id lists models without going through rental HTTP", async () => {
  const calls: string[] = [];
  const fetcher = (async (url: string | URL | Request) => {
    calls.push(String(url));
    return new Response(JSON.stringify({ models: [{ name: "qwen3:8b" }] }), { status: 200 });
  }) as typeof fetch;
  const jobs = await listProviderJobs(
    "localhost-ollama",
    { provider: "localhost-ollama", token: "" },
    fetcher,
  );
  assert.equal(jobs[0].id, "qwen3:8b");
  assert.equal(calls[0], "http://127.0.0.1:11434/api/tags");
});

test("createProviderJob dry-run does not POST; execute uses allowlisted path and readback", async () => {
  const budget = { acknowledged: true, maxUsd: 5, maxMinutes: 30, estimatedUsdPerHour: 1 };
  const dry = await createProviderJob(
    "runpod",
    { provider: "runpod", token: "k" },
    { budget, requestId: "c-1", body: { imageName: "runpod/pytorch" } },
  );
  assert.equal(dry.rawState, "dry-run");
  const urls: string[] = [];
  const fetcher = (async (url: string | URL | Request, init?: RequestInit) => {
    urls.push(`${init?.method ?? "GET"} ${String(url)}`);
    if (String(url).endsWith("/pods") && init?.method === "POST") {
      return new Response(JSON.stringify({ id: "pod-9" }), { status: 200 });
    }
    return new Response(JSON.stringify({ id: "pod-9", status: "RUNNING" }), { status: 200 });
  }) as typeof fetch;
  const job = await createProviderJob(
    "runpod",
    { provider: "runpod", token: "k" },
    { budget, requestId: "c-2", body: { imageName: "runpod/pytorch" }, dryRun: false },
    fetcher,
  );
  assert.equal(job.id, "pod-9");
  assert.equal(job.status, "running");
  assert.equal(urls[0], "POST https://rest.runpod.io/v1/pods");
  await assert.rejects(
    () =>
      createProviderJob(
        "modal",
        { provider: "modal", token: "k" },
        { budget, requestId: "c-3", body: {} },
      ),
    new RegExp(PROVIDER_ERROR.mutate),
  );
});
