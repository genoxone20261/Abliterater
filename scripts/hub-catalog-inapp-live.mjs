import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const url = process.argv[2] || "http://127.0.0.1:8082";
const out = "screenshots/hub-catalog-inapp-live";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.addInitScript(() => localStorage.setItem("abliterater_locale", "ko"));
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.locator('#main[data-hydrated="true"]').waitFor();
await page.getByRole("tab", { name: "작업대" }).click();
await page.locator("#workspace-tab-explore").click();
await page.waitForFunction(() => document.getElementById("workspace-explore")?.hidden === false);
await page.locator("[data-hub-live-btn]").click();
await page.locator("[data-hub-live-list] li").first().waitFor({ timeout: 120000 });
const n = await page.locator("[data-hub-live-list] li").count();
const status = await page.locator("[data-hub-live-status]").innerText();
const first = await page.locator("[data-hub-live-list] li").first().innerText();
const verdict = {
  url,
  packaged: false,
  cards: n,
  status,
  first,
  liveHits: n > 0,
  note: "Recommendations in-app Hub live overlay. BASES not rewritten. R-009 table stays OPEN until ledger cell changes.",
};
writeFileSync(`${out}/verdict.json`, JSON.stringify(verdict, null, 2));
console.log(JSON.stringify(verdict, null, 2));
await browser.close();
if (!verdict.liveHits) process.exit(1);
