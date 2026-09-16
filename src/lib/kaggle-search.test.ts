import assert from "node:assert/strict";
import { test } from "node:test";
import { SOURCE_ERROR } from "./source-search.ts";
import { KAGGLE_ERROR, kaggleHit, kaggleList, kaggleSearchUrl, kaggleWebSearchUrl } from "./kaggle-search.ts";

test("kaggleSearchUrl is the official list endpoint and does not fetch", () => {
  const url = kaggleSearchUrl("alpaca");
  assert.equal(url.origin, "https://www.kaggle.com");
  assert.equal(url.pathname, "/api/v1/datasets/list");
  assert.equal(url.searchParams.get("search"), "alpaca");
  assert.throws(() => kaggleSearchUrl(""), new RegExp(KAGGLE_ERROR.query));
});

test("no-key kaggle path is a web search URL plus an unverified hit", () => {
  const web = kaggleWebSearchUrl("openorca");
  assert.equal(web.pathname, "/datasets");
  assert.equal(web.searchParams.get("search"), "openorca");
  const hit = kaggleHit("openorca");
  assert.equal(hit.id, "kaggle:openorca");
  assert.equal(hit.url, web.href);
  assert.equal(hit.license, "LICENSE_UNCHECKED");
  assert.equal(hit.sha256, "");
});

test("kaggleList sends Basic auth to official list and maps rows without leaking the key", async () => {
  const calls: { url: string; auth: string }[] = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const headers = new Headers(init?.headers);
    calls.push({ url: String(input), auth: headers.get("Authorization") ?? "" });
    return new Response(
      JSON.stringify([
        {
          ref: "owner/ds",
          title: "DS",
          subtitle: "desc",
          licenseName: "CC0-1.0",
          lastUpdated: "2024-01-01T00:00:00Z",
        },
      ]),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };
  const items = await kaggleList("alpaca", { user: "me", key: "secret-key" }, fetchImpl);
  assert.equal(items.length, 1);
  assert.equal(items[0]?.id, "owner/ds");
  assert.equal(items[0]?.name, "DS");
  assert.equal(items[0]?.url, "https://www.kaggle.com/datasets/owner/ds");
  assert.equal(items[0]?.license, "CC0-1.0");
  assert.match(calls[0]?.auth ?? "", /^Basic /);
  assert.doesNotMatch(calls[0]?.url ?? "", /secret-key/);
  assert.doesNotMatch(JSON.stringify(items), /secret-key/);
});

test("kaggleList rejects missing cred and maps 401 without embedding the key", async () => {
  await assert.rejects(
    () => kaggleList("q", { user: "", key: "k" }, fetch),
    new RegExp(KAGGLE_ERROR.auth),
  );
  const fetch401: typeof fetch = async () => new Response("no", { status: 401 });
  await assert.rejects(
    () => kaggleList("q", { user: "u", key: "secret-key" }, fetch401),
    new RegExp(`${SOURCE_ERROR.http} 401`),
  );
});
