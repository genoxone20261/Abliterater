import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
try {
  const p = await browser.newPage();
  p.on("console", (m) => console.log("console", m.type(), m.text()));
  p.on("pageerror", (e) => console.log("pageerror", e.message));
  await p.goto("http://127.0.0.1:8081", { waitUntil: "domcontentloaded" });
  await p.locator("[data-shortcut=save]").waitFor();
  await p.locator("[data-shortcut=save]").click();
  await p.waitForTimeout(500);
  console.log("keys", await p.evaluate(() => Object.keys(localStorage)));
  console.log("stored", await p.evaluate(() => localStorage.getItem("ablit.configs.v1")));
  console.log("errors", await p.locator("#storage-error").allTextContents());
  console.log("toasts", await p.locator(".toast").allTextContents());
} finally {
  await browser.close();
}
