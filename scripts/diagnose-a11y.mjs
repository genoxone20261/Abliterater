import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
try {
  const c = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await c.newPage();
  await p.goto(process.argv[2] || "http://127.0.0.1:8082", { waitUntil: "domcontentloaded" });
  await p.locator("#main[data-hydrated=true]").waitFor();
  const r = await new AxeBuilder({ page: p }).analyze();
  for (const v of r.violations)
    console.log(
      v.id,
      v.impact,
      v.nodes.map((n) => ({ target: n.target, html: n.html, failure: n.failureSummary })),
    );
} finally {
  await browser.close();
}
