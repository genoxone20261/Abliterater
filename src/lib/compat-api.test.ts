import { createServer } from "node:http";
import { test } from "node:test";
import assert from "node:assert/strict";
import { listCompatModelsClient, modelsUrl, COMPAT_ERROR } from "./compat-api.ts";

test("compat URL policy rejects credentials, query, hash and non-web schemes", () => {
  for (const value of [
    "javascript:alert(1)",
    "http://u:p@example.com/v1",
    "http://example.com/v1?q=1",
    "http://example.com/v1#x",
  ]) {
    assert.throws(() => modelsUrl(value), new RegExp(COMPAT_ERROR.url));
  }
});
test("compat client times out and cleans up", async () => {
  const server = createServer((_req, _res) => {
    /* intentionally never responds */
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const original = globalThis.setTimeout;
  globalThis.setTimeout = ((fn: () => void, ms?: number) =>
    original(fn, Math.min(ms ?? 0, 10))) as typeof setTimeout;
  try {
    await assert.rejects(() => listCompatModelsClient(`http://127.0.0.1:${address.port}/v1`));
  } finally {
    globalThis.setTimeout = original;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("compat client rejects HTTP errors, malformed JSON, and empty lists stay empty", async () => {
  const server = createServer((req, res) => {
    const url = req.url ?? "";
    if (url.includes("/fail/")) {
      res.writeHead(500, { "content-type": "text/plain" });
      res.end("nope");
      return;
    }
    if (url.includes("/badjson/")) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end("{not json");
      return;
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ data: [] }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const origin = `http://127.0.0.1:${address.port}`;
  try {
    await assert.rejects(() => listCompatModelsClient(`${origin}/fail`), /500/);
    await assert.rejects(() => listCompatModelsClient(`${origin}/badjson`));
    assert.deepEqual(await listCompatModelsClient(`${origin}/empty`), []);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("compat client honors an already-aborted signal as stale cancellation", async () => {
  const ctrl = new AbortController();
  ctrl.abort();
  await assert.rejects(
    () => listCompatModelsClient("http://127.0.0.1:9/v1", undefined, ctrl.signal),
    (err: unknown) => err instanceof Error && err.name === "AbortError",
  );
});
