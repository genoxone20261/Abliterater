import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("index chrome Hangul leftovers go through t()", () => {
  const src = readFileSync("src/routes/index.tsx", "utf8");
  assert.doesNotMatch(src, /sr-only">\(단축키/);
  assert.doesNotMatch(src, /한국어판/);
  assert.doesNotMatch(src, /labelKo\} \(한국어\)/);
  assert.match(src, /t\("tab_shortcut_sr"/);
  assert.match(src, /data-hydrated=\{hydrated\}/);
  assert.match(src, /document\.querySelector\('\[role="dialog"\]'\)/);
  assert.match(src, /t\("pill_formats"/);
  assert.match(src, /hidden=\{tab !== "studio"\}/);
  assert.match(src, /hidden=\{tab !== "papers"\}/);
  assert.match(src, /inert=\{tab !== "studio"/);
  assert.match(src, /inert=\{tab !== "papers"/);
  assert.doesNotMatch(src, /hidden=\{tab !== "files"\}/);
  assert.doesNotMatch(src, /REPORT_DOCS/);
  assert.doesNotMatch(src, /PdfViewer/);
  assert.doesNotMatch(src, /\/reports\//);
  assert.match(src, /target="_blank"/);
  assert.match(src, /t\("kbd_zip"/);
  assert.doesNotMatch(src, /English PDF/);
  assert.doesNotMatch(src, />\s*abs\s*</);
  assert.doesNotMatch(src, />\s*pdf\s*</);
  assert.match(src, /t\("paper_abs"/);
  assert.match(src, /t\("paper_pdf"/);
  assert.match(src, /t\("paper_put"/);
  assert.match(src, /t\("repo_put"/);
  assert.match(src, /emitPutSource/);
  assert.match(src, /repoCopy\(r\.name, "role"/);
  assert.match(src, /repoCopy\(r\.name, "use"/);
  assert.doesNotMatch(src, /\{r\.role\} · \{r\.use\}/);
  assert.match(src, /hero-compact/);
  assert.match(src, /hero-desc/);
  assert.match(src, /hero-pills/);
  assert.match(src, /HTMLInputElement/);
  assert.match(src, /HTMLTextAreaElement/);
  assert.match(src, /t\("footer_org"/);
  assert.match(src, /t\("footer_author"/);
  assert.match(src, /t\("footer_github"/);
  assert.match(src, /t\("footer_email"/);
});

test("LanguageToggle chrome goes through t()", () => {
  const src = readFileSync("src/components/LanguageToggle.tsx", "utf8");
  assert.match(src, /t\("lang_selector_aria"/);
  assert.doesNotMatch(src, /aria-label="Language selector"/);
});

test("desktop external URL policy is imported by main", () => {
  const main = readFileSync("electron/main/main.mjs", "utf8");
  assert.match(
    main,
    /import \{ isAllowedExternalUrl, isAllowedAppNavigation \} from "\.\/policy\.mjs"/,
  );
  assert.match(main, /setWindowOpenHandler/);
  assert.match(main, /isAllowedExternalUrl\(url\)/);
  assert.match(main, /isAllowedAppNavigation\(url, appUrl\)/);
});

test("chrome surfaces do not use backdrop-blur", () => {
  for (const path of [
    "src/routes/index.tsx",
    "src/components/LanguageToggle.tsx",
    "src/components/ui/Dialog.tsx",
  ]) {
    assert.doesNotMatch(readFileSync(path, "utf8"), /backdrop-blur/);
  }
});
