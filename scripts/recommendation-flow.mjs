import { chromium, _electron as electron } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const executable = process.env.RECOMMENDATION_ELECTRON_EXE;
const url = process.argv[2] || "http://127.0.0.1:8082";
const output = process.argv[3] || "screenshots/recommendation-flow";
mkdirSync(output, { recursive: true });
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const app = executable
  ? await electron.launch({
      executablePath: resolve(executable),
      args: ["--qa-hidden"],
      env,
      timeout: 60000,
    })
  : null;
const browser = app ? null : await chromium.launch();
const results = [];
try {
  for (const width of app ? [1280] : [1280, 390]) {
    const context = browser ? await browser.newContext({ viewport: { width, height: 844 } }) : null;
    const page = app ? await app.firstWindow() : await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    if (!app) await page.goto(url);
    await page.locator('#main[data-hydrated="true"]').waitFor({ timeout: 60000 });
    const panel = page.getByRole("region", { name: "하드웨어 모델 추천" });
    await panel.scrollIntoViewIfNeeded();
    if (app) {
      await panel.getByRole("button", { name: "내 장비 조회" }).click();
      await panel
        .getByRole("status")
        .filter({ hasText: "장비 조회값" })
        .waitFor({ timeout: 30000 });
    }
    await panel.getByLabel("수동 VRAM (GiB)").fill("12");
    await panel.getByRole("status").filter({ hasText: "실측 아님" }).waitFor();
    await panel.getByLabel("추천 작업").selectOption("full");
    assert.ok((await panel.innerText()).includes("부적합"));
    await panel.getByLabel("추천 작업").selectOption("inference");
    const item = panel.locator('[data-recommendation="foundation-sec"]');
    await item.getByRole("button").click();
    assert.equal(await item.getByRole("button").getAttribute("aria-pressed"), "true");
    await page.locator('[data-shortcut="save"]').click();
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("ablit.configs.v1") || "[]"),
    );
    assert.match(JSON.stringify(stored), /foundation-sec/);
    await panel.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${output}/${width}.png` });
    assert.deepEqual(errors, []);
    results.push({
      width,
      packaged: Boolean(app),
      hardwareRead: Boolean(app),
      manual: true,
      workload: true,
      modelAppliedAndSaved: true,
      errors,
    });
    await context?.close();
  }
  writeFileSync(`${output}/verdict.json`, JSON.stringify({ url, results }, null, 2));
  console.log(JSON.stringify({ results }, null, 2));
} finally {
  await app?.close();
  await browser?.close();
}
