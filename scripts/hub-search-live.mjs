import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const url = process.argv[2] || "http://127.0.0.1:8082";
const out = "screenshots/hub-search-live";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.addInitScript(() => {
  localStorage.setItem("abliterater_locale", "ko");
});
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.locator('#main[data-hydrated="true"]').waitFor();
await page.getByRole("tab", { name: "작업대" }).click();
await page.locator("#panel-studio").waitFor();
await page.getByText("Hugging Face", { exact: true }).click();
const query = page.locator("#hfQuery");
await query.waitFor();
await query.fill("Qwen3-0.6B");
await query.press("Enter");
await page.waitForTimeout(12000);
const chips = await page
  .locator("#hfQuery")
  .locator("xpath=ancestor::div[contains(@class,'space-y-3')]")
  .locator("li")
  .count();
const alert = await page.locator("#section-4 [role='alert']").count();
const verdict = {
  url,
  packaged: false,
  query: "Qwen3-0.6B",
  chips,
  alert,
  errors,
  liveHits: chips > 0 && alert === 0,
  note: "ModelSource in-app Hub search this-session web. R-009 catalog live refresh stays OPEN.",
};
writeFileSync(`${out}/verdict.json`, JSON.stringify(verdict, null, 2));
console.log(JSON.stringify(verdict, null, 2));
await browser.close();
if (errors.length) process.exit(1);
