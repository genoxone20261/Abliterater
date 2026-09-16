import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
const url = process.argv[2] || "http://127.0.0.1:8082";
const out = "screenshots/product-flow";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(() => {
      localStorage.setItem("abliterater_locale", "ko");
    });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.locator('#main[data-hydrated="true"]').waitFor();
    await page.getByRole("tab", { name: /논문/ }).click();
    await page.waitForTimeout(50);
    await page.getByRole("tab", { name: "작업대" }).click();
    await page.waitForTimeout(50);
    await page.locator("#panel-studio").waitFor();
    const project = page.getByRole("textbox", { name: "작업 이름", exact: true });
    await project.fill("QA retained configuration");
    await project.press("Tab");
    await page.getByRole("tab", { name: /논문/ }).click();
    await page.waitForTimeout(50);
    await page.getByRole("tab", { name: "작업대" }).click();
    await page.waitForTimeout(50);
    await page.locator("#panel-studio").waitFor();
    assert.equal(await project.inputValue(), "QA retained configuration");
    await page.getByRole("button", { name: "현재 설정 저장", exact: true }).click();
    await page.getByText("설정이 브라우저에 저장되었습니다.").waitFor();
    const search = page.getByRole("textbox", { name: "저장된 구성 검색" });
    await search.fill("not-found");
    assert.equal(
      await page.getByText("검색 결과가 없습니다. 다른 이름으로 검색하세요.").isVisible(),
      true,
    );
    await search.fill("QA retained");
    await page.getByRole("button", { name: /QA retained configuration/ }).waitFor();
    assert.equal(await page.getByRole("button", { name: /QA retained configuration/ }).count(), 1);
    const downloaded = page.waitForEvent("download");
    await page.locator('[data-shortcut="download"]').click();
    const file = await downloaded;
    await file.saveAs(`${out}/${width}.zip`);
    assert.equal(await file.failure(), null);
    await page.getByRole("button", { name: "키보드 단축키" }).click();
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')),
      true,
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0);
    await page.getByRole("tab", { name: "작업대" }).focus();
    await page.keyboard.press("End");
    assert.equal(
      await page.getByRole("tab", { name: /논문/ }).getAttribute("aria-selected"),
      "true",
    );
    await page.getByRole("tab", { name: /논문/ }).press("Home");
    await page.getByRole("tab", { name: "작업대" }).waitFor();
    await page.waitForFunction(() => document.getElementById("panel-studio")?.hidden === false);
    await page.locator("#rec-manual-vram").scrollIntoViewIfNeeded();
    await page.locator("#rec-manual-vram").fill("8");
    await page.locator('[data-golden="heretic-4b"]').waitFor();
    assert.equal(await page.locator('[data-golden="heretic-8b-4bit"]').count(), 0);
    assert.equal(await page.locator('[data-golden="lora-7b"]').count(), 0);
    await page.locator('[data-golden="heretic-4b"]').click();
    assert.equal(
      await page.locator('[data-recommendation] button[aria-pressed="true"]').count(),
      1,
    );
    await page.locator("#rec-manual-vram").fill("");
    await page.waitForFunction(() => document.querySelectorAll("[data-golden]").length === 0);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `${out}/${width}.png`, timeout: 90000 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
      false,
    );
    assert.deepEqual(errors, []);
    results.push({
      width,
      draft: true,
      saveSearch: true,
      zip: true,
      modal: true,
      keyboardTabs: true,
      golden8: true,
      errors,
    });
    await page.close();
  }
  writeFileSync(`${out}/verdict.json`, JSON.stringify({ url, results }, null, 2));
  console.log(JSON.stringify({ url, results }, null, 2));
} finally {
  await browser.close();
}
