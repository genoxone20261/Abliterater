import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { startBuiltServer } from "./built-server.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, "screenshots", "persist-reject");
mkdirSync(out, { recursive: true });
const secrets = ["apiKey", "hfToken", "HF_TOKEN", "openaiKey", "password"];
const { server, url } = await startBuiltServer({ root, host: "127.0.0.1", port: 0 });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    localStorage.setItem("abliterater_locale", "ko");
  });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.locator('#main[data-hydrated="true"]').waitFor({ timeout: 60000 });
  const studio = page.getByRole("tab", { name: "작업대" });
  if (await studio.count()) await studio.click();
  const save = page.getByRole("button", { name: "현재 설정 저장", exact: true });
  if (await save.count()) await save.click();
  const dump = await page.evaluate(() => {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) out[k] = localStorage.getItem(k);
    }
    return out;
  });
  const blob = JSON.stringify(dump);
  for (const key of secrets) {
    assert.equal(key in dump, false, key);
    assert.equal(blob.includes(`"${key}"`), false, key);
  }
  assert.equal(Object.prototype.hasOwnProperty.call(dump, "token"), false);
  writeFileSync(
    join(out, "verdict.json"),
    JSON.stringify({ url, keys: Object.keys(dump), errors }, null, 2),
  );
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ url, keys: Object.keys(dump), secretHits: 0 }));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
