import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const url = process.argv[2] || "http://127.0.0.1:8082";
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.locator('#main[data-hydrated="true"]').waitFor();
  const result = await new AxeBuilder({ page }).analyze();
  console.log(
    JSON.stringify(
      {
        url,
        violations: result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
        })),
      },
      null,
      2,
    ),
  );
  process.exitCode = result.violations.some(
    (v) => v.impact === "critical" || v.impact === "serious",
  )
    ? 1
    : 0;
} finally {
  await browser.close();
}
