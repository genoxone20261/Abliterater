import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Hub size-band extract searches official instruct bases before heretic reuse", () => {
  const src = readFileSync("src/lib/model-hub.ts", "utf8");
  const start = src.indexOf("BAND_QUERIES");
  const end = src.indexOf("export type HubBandCatalog");
  assert.ok(start >= 0 && end > start);
  const band = src.slice(start, end);
  const searches = [...band.matchAll(/search:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(searches.length >= 2, "need work + reuse queries");
  assert.doesNotMatch(searches[0] ?? "", /heretic|abliterat|uncensor/i);
  assert.match(searches[0] ?? "", /Instruct|Qwen3|Llama|gemma/i);
  assert.ok(searches.some((q) => /heretic/i.test(q)), "reuse lane still present");
  assert.match(src, /q\.filter/);
});

test("ModelSource splits catalog chips into work originals vs already-processed reuse", () => {
  const src = readFileSync("src/components/ModelSource.tsx", "utf8");
  assert.match(src, /ms_catalog_work/);
  assert.match(src, /ms_catalog_reuse/);
  assert.match(src, /catalogIsReuse/);
  assert.match(src, /data-catalog-lane/);
});

test("Recommendations default workload is Heretic, not inference reuse", () => {
  const src = readFileSync("src/components/Recommendations.tsx", "utf8");
  assert.match(src, /useState<Workload>\("heretic"\)/);
});

test("ModelSource reuse catalog pick applies recommendPath methods and outputs", () => {
  const src = readFileSync("src/components/ModelSource.tsx", "utf8");
  assert.match(src, /recommendPath/);
  assert.match(src, /outputs:\s*reuse\s*\?\s*path\.outputs/);
  assert.match(src, /methods:\s*reuse\s*\?\s*path\.methods/);
});

test("Studio explore onSelect applies reuse path instead of keeping heretic methods", () => {
  const src = readFileSync("src/components/Studio.tsx", "utf8");
  assert.match(src, /onSelect=\{\(base\) =>/);
  assert.match(src, /catalogIsReuse/);
  assert.match(src, /recommendPath/);
});

test("first preset is Instruct heretic work, not heretic GGUF reuse", () => {
  const src = readFileSync("src/lib/presets.ts", "utf8");
  const start = src.indexOf("export const PRESETS");
  const firstId = /id:\s*"([^"]+)"/.exec(src.slice(start))?.[1];
  assert.equal(firstId, "method-compare");
  assert.match(src, /base:\s*"qwen3-4b"/);
});

test("Studio paints ModelSource before presets so the catalog is first-use", () => {
  const src = readFileSync("src/components/Studio.tsx", "utf8");
  const canvas = src.slice(src.indexOf("workflow-canvas"), src.indexOf("id=\"studio-summary\""));
  const modelAt = canvas.indexOf("<ModelSource");
  const presetsAt = canvas.indexOf("step_presets");
  assert.ok(modelAt >= 0 && presetsAt > modelAt, "catalog must precede presets in the canvas");
});

test("reuse catalog pick sets purpose from recommendPath", () => {
  const src = readFileSync("src/components/ModelSource.tsx", "utf8");
  assert.match(src, /purpose:\s*reuse\s*\?\s*path\.purpose/);
});

test("document title is Abliterater not Unc / Ablit", () => {
  const src = readFileSync("src/routes/__root.tsx", "utf8");
  const og = readFileSync("src/lib/og/site.json", "utf8");
  assert.match(src, /Abliterater/);
  assert.ok(!src.includes("Unc / Ablit"));
  assert.match(og, /"title":\s*"Abliterater"/);
  assert.ok(!og.includes("Unc / Ablit"));
});

test("KO heretic param labels are words, not raw flag names", () => {
  const src = readFileSync("src/lib/i18n.ts", "utf8");
  const ko = src.slice(src.indexOf("ko:"), src.indexOf("\n  en:"));
  assert.doesNotMatch(ko, /fld_n_trials:\s*"n_trials"/);
  assert.doesNotMatch(ko, /fld_max_weight:\s*"max_weight"/);
  assert.doesNotMatch(ko, /fld_direction_index:\s*"direction_index"/);
});

test("Studio connect wizard does not paint a second API key field", () => {
  const src = readFileSync("src/components/Studio.tsx", "utf8");
  assert.match(src, /<ConnectionWizard[^>]*hideApiKey/);
});

test("Recommendations unknown fit does not stamp 판정 불가 on every card", () => {
  const src = readFileSync("src/components/Recommendations.tsx", "utf8");
  assert.match(src, /row\.fit === "unknown"/);
  assert.match(src, /rec_need_vram_line/);
});

test("help copy names the research tab, not 논문/리포", () => {
  const i18n = readFileSync("src/lib/i18n.ts", "utf8");
  const index = readFileSync("src/routes/index.tsx", "utf8");
  assert.doesNotMatch(i18n, /논문\/리포\(Repo\)/);
  assert.doesNotMatch(index, /논문\/리포\(Repo\)/);
});

test("catalog chip puts a text space between name and VRAM class", () => {
  const src = readFileSync("src/components/ModelSource.tsx", "utf8");
  assert.match(src, /\{b\.name\}<\/span>\{" "\}/);
});

test("Recommendations unknown VRAM is one banner, not a per-card stamp", () => {
  const src = readFileSync("src/components/Recommendations.tsx", "utf8");
  assert.match(src, /data-rec-need-vram/);
  assert.doesNotMatch(
    src,
    /row\.fit === "unknown"\s*\n\s*\? t\("rec_need_vram_line"/,
  );
});

test("Field clone does not leave SSR inputs without suppressHydrationWarning", () => {
  const src = readFileSync("src/components/ui/Field.tsx", "utf8");
  assert.match(src, /suppressHydrationWarning/);
});
