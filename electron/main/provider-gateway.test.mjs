import test from "node:test";
import assert from "node:assert/strict";
import { providerRead, providerMutate, GATEWAY_ERROR } from "./provider-gateway.mjs";

test("gateway limits requests to provider read operations", async () => {
  let calls = 0;
  const fetcher = async (url, options) => {
    calls++;
    assert.equal(url, "https://rest.runpod.io/v1/pods");
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.Authorization, "Bearer fixture-only");
    return new Response('[{"id":"p1"}]');
  };
  assert.deepEqual(await providerRead({ provider: "runpod", token: "fixture-only" }, fetcher), [
    { id: "p1" },
  ]);
  for (const request of [
    { provider: "other", token: "x" },
    { provider: "runpod", token: "x", id: "../escape" },
    { provider: "runpod", token: "x", url: "https://example.com" },
    { provider: "runpod", token: "" },
  ]) {
    await assert.rejects(() => providerRead(request, fetcher));
  }
  assert.equal(calls, 1);
});
test("gateway allows Vast read against console.vast.ai instances", async () => {
  const fetcher = async (url, options) => {
    assert.equal(url, "https://console.vast.ai/api/v0/instances/");
    assert.equal(options.headers.Authorization, "Bearer fixture-only");
    return new Response('{"instances":[]}');
  };
  assert.deepEqual(await providerRead({ provider: "vast", token: "fixture-only" }, fetcher), {
    instances: [],
  });
});
test("gateway resolves vastai alias to the same Vast list URL", async () => {
  const fetcher = async (url) => {
    assert.equal(url, "https://console.vast.ai/api/v0/instances/");
    return new Response('{"instances":[]}');
  };
  assert.deepEqual(await providerRead({ provider: "vastai", token: "fixture-only" }, fetcher), {
    instances: [],
  });
});
test("gateway sends Shadeform X-API-KEY and info read path", async () => {
  const fetcher = async (url, options) => {
    assert.equal(url, "https://api.shadeform.ai/v1/instances/abc/info");
    assert.equal(options.headers["X-API-KEY"], "fixture-only");
    assert.equal(options.headers.Authorization, undefined);
    return new Response('{"id":"abc"}');
  };
  assert.deepEqual(
    await providerRead({ provider: "shadeform", token: "fixture-only", id: "abc" }, fetcher),
    { id: "abc" },
  );
});
test("gateway refuses Thunder per-id read", async () => {
  await assert.rejects(
    () =>
      providerRead(
        { provider: "thunder-compute", token: "x", id: "0" },
        async () => new Response("{}"),
      ),
    new RegExp(GATEWAY_ERROR.provider),
  );
});
test("gateway caps response and never exposes remote errors", async () => {
  await assert.rejects(
    () =>
      providerRead(
        { provider: "lambda", token: "x" },
        async () => new Response("secret body", { status: 401 }),
      ),
    new RegExp(`${GATEWAY_ERROR.http} 401`),
  );
  await assert.rejects(
    () =>
      providerRead(
        { provider: "lambda", token: "x" },
        async () => new Response("x".repeat(2_000_001)),
      ),
    new RegExp(GATEWAY_ERROR.size),
  );
});

test("gateway mutate allowlists create URL and rejects extra keys", async () => {
  const fetcher = async (url, options) => {
    assert.equal(url, "https://rest.runpod.io/v1/pods");
    assert.equal(options.method, "POST");
    return new Response('{"id":"p9"}');
  };
  assert.deepEqual(
    await providerMutate(
      {
        provider: "runpod",
        token: "fixture-only",
        method: "POST",
        url: "https://rest.runpod.io/v1/pods",
        body: JSON.stringify({ imageName: "runpod/pytorch" }),
        requestId: "c-1",
      },
      fetcher,
    ),
    { id: "p9" },
  );
  await assert.rejects(
    () =>
      providerMutate({
        provider: "runpod",
        token: "x",
        method: "POST",
        url: "https://example.com/evil",
        body: "{}",
      }),
    new RegExp(GATEWAY_ERROR.provider),
  );
  await assert.rejects(
    () =>
      providerMutate({
        provider: "runpod",
        token: "x",
        method: "POST",
        url: "https://rest.runpod.io/v1/pods",
        body: JSON.stringify({ imageName: "x", extra: 1 }),
      }),
    new RegExp(GATEWAY_ERROR.request),
  );
});
