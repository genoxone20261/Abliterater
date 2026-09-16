import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isAllowedAppNavigation, isAllowedExternalUrl, isDevRuntime } from "./policy.mjs";

test("packaged builds never start a development server", () => {
  assert.equal(isDevRuntime(true, undefined), false);
  assert.equal(isDevRuntime(false, undefined), true);
});

test("external links allow https and loopback http only", () => {
  assert.equal(isAllowedExternalUrl("https://example.com/x"), true);
  assert.equal(isAllowedExternalUrl("http://example.com"), false);
  assert.equal(isAllowedExternalUrl("http://127.0.0.1:8080/docs"), true);
  assert.equal(isAllowedExternalUrl("http://localhost:3000"), true);
  assert.equal(isAllowedExternalUrl("http://[::1]/"), true);
  for (const url of ["file:///c:/x", "javascript:alert(1)", "data:text/plain,x", "custom:x"])
    assert.equal(isAllowedExternalUrl(url), false);
});

test("external URL policy rejects credentials and loopback lookalikes", () => {
  assert.equal(isAllowedExternalUrl("https://user:pass@example.com/x"), false);
  assert.equal(isAllowedExternalUrl("http://evil.com@127.0.0.1/"), false);
  assert.equal(isAllowedExternalUrl("http://0.0.0.0/"), false);
  assert.equal(isAllowedExternalUrl("http://localhost.evil.com/"), false);
  // WHATWG canonicalizes 127.1 → 127.0.0.1 (still loopback, not a remote bypass).
  assert.equal(isAllowedExternalUrl("http://127.1/"), true);
});

test("external URL policy rejects malformed values", () => {
  assert.equal(isAllowedExternalUrl("not a URL"), false);
  assert.equal(isAllowedExternalUrl("https://"), false);
});

test("app navigation allows same origin and denies malformed or off-origin", () => {
  const app = "http://127.0.0.1:4123/";
  assert.equal(isAllowedAppNavigation("http://127.0.0.1:4123/studio", app), true);
  assert.equal(isAllowedAppNavigation("http://127.0.0.1:4123/", app), true);
  assert.equal(isAllowedAppNavigation("http://127.0.0.1:9999/", app), false);
  assert.equal(isAllowedAppNavigation("https://evil.example/", app), false);
  assert.equal(isAllowedAppNavigation("not a URL", app), false);
  assert.equal(isAllowedAppNavigation("http://127.0.0.1:4123/", "not a URL"), false);
});

test("main process routes navigation and IPC origin through isAllowedAppNavigation", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const main = readFileSync(join(here, "main.mjs"), "utf8");
  assert.match(main, /isAllowedAppNavigation/);
  assert.doesNotMatch(main, /new URL\(url\)\.origin !== new URL\(appUrl\)\.origin/);
  assert.doesNotMatch(
    main,
    /new URL\(event\.senderFrame\.url\)\.origin === new URL\(appUrl\)\.origin/,
  );
});
