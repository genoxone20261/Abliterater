import test from "node:test";
import assert from "node:assert/strict";
import { startBuiltServer } from "./built-server.mjs";

test("built server renders app and serves JS with correct MIME", async () => {
  const { server, url } = await startBuiltServer({ root: process.cwd() });
  try {
    const html = await (await fetch(url)).text();
    assert.match(html, /Abliterater/);
    assert.doesNotMatch(html, /Unc \/ Ablit/);
    const asset = html.match(/src="([^"]+\.js)"/)?.[1];
    assert.ok(asset);
    const response = await fetch(new URL(asset, url));
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") || "", /javascript/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("built server does not expose traversal paths", async () => {
  const { server, url } = await startBuiltServer({ root: process.cwd() });
  try {
    assert.equal((await fetch(`${url}/%2e%2e/package.json`)).status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
