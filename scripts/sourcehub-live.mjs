import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const url = process.argv[2] || "http://127.0.0.1:8082";
const out = "screenshots/sourcehub-live";
mkdirSync(out, { recursive: true });
const kinds = [
  { value: "hf-datasets", label: "Hugging Face 데이터셋", query: "iris" },
  { value: "hf-models", label: "Hugging Face 모델", query: "qwen" },
  { value: "github", label: "GitHub 도구·환경", query: "gymnasium" },
  { value: "openml", label: "OpenML 데이터셋", query: "iris" },
  { value: "zenodo", label: "Zenodo 레코드", query: "mnist" },
];
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
const hub = page.locator('[aria-label="외부 소스 허브"]');
const query = page.locator("#source-query");
await query.waitFor();
const results = [];
for (const kind of kinds) {
  await hub
    .getByLabel("소스 종류")
    .selectOption(kind.value)
    .catch(async () => {
      await hub.locator("select").first().selectOption(kind.value);
    });
  await query.fill(kind.query);
  await hub.getByRole("button", { name: "검색" }).click();
  await page.waitForTimeout(9000);
  const alert = await hub.locator('[role="alert"]').count();
  const cards = await hub.locator("ul.grid.gap-2 > li").count();
  const empty = await hub.getByText("검색 결과가 없습니다.").count();
  results.push({
    kind: kind.value,
    query: kind.query,
    cards,
    empty,
    alert,
    liveHits: cards > 0 && alert === 0,
  });
}
const verdict = {
  url,
  packaged: false,
  results,
  errors,
  note: "SourceHub live kinds this-session web. R-009 catalog Hub stays OPEN.",
};
writeFileSync(`${out}/verdict.json`, JSON.stringify(verdict, null, 2));
console.log(JSON.stringify(verdict, null, 2));
await browser.close();
if (errors.length) process.exit(1);
