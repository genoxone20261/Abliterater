import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PRESETS, applyPreset } from "./presets.ts";

test("starter presets provide vendor-neutral local and research workflows", () => {
  assert.ok(PRESETS.length >= 3, "empty preset step must not be rendered");
  assert.ok(PRESETS.some((preset) => preset.id === "local-gguf"));
  assert.ok(PRESETS.some((preset) => preset.id === "method-compare"));
  assert.ok(PRESETS.some((preset) => preset.id === "domain-lora"));
  for (const preset of PRESETS) {
    assert.ok(!String(preset.patch.compute ?? "").match(/azure|aws|gcp|runpod|vast|lambda/));
  }
  const first = applyPreset("method-compare");
  const second = applyPreset("method-compare");
  assert.notEqual(first.methods, second.methods);
  assert.notEqual(first.outputs, second.outputs);
});

test("workbench chrome uses a compact command header and three-rail desktop layout", () => {
  const home = readFileSync("src/routes/index.tsx", "utf8");
  const studio = readFileSync("src/components/Studio.tsx", "utf8");
  const source = readFileSync("src/components/ModelSource.tsx", "utf8");
  const chip = readFileSync("src/components/ui/Chip.tsx", "utf8");
  const css = readFileSync("src/styles.css", "utf8");

  assert.match(home, /app-command-header/);
  assert.match(home, /research-toolbar/);
  assert.match(home, /filterResearchLibrary/);
  assert.match(studio, /className="workflow-grid"/);
  assert.match(studio, /className="workflow-rail"/);
  assert.ok(
    studio.indexOf('data-shortcut="download"') < studio.indexOf("<WorkflowAudit"),
    "primary pack action must be visible before the workflow detail",
  );
  assert.match(chip, /data-chip-check/);
  assert.doesNotMatch(source, /<section id="section-4"/);
  assert.match(css, /\.app-command-header\s*\{/);
  assert.match(css, /\.workflow-grid\s*\{/);
});
