import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("Studio Field labels bind htmlFor to input ids", () => {
  const studio = readFileSync("src/components/Studio.tsx", "utf8");
  for (const id of [
    "studio-heretic-n_trials",
    "studio-heretic-max_weight",
    "studio-heretic-direction_index",
    "studio-lora-r",
    "studio-lora-alpha",
    "studio-lora-lr",
    "studio-lora-epochs",
    "studio-imatrix-ctx",
    "studio-cast-coeff",
    "studio-job-name",
    "studio-notes",
    "studio-user-prompt",
  ]) {
    assert.match(studio, new RegExp(`htmlFor="${id}"`));
    assert.match(studio, new RegExp(`id="${id}"`));
  }
  assert.match(studio, /JOB_ERROR/);
  assert.match(studio, /save_err_unavailable/);
  assert.match(studio, /save_err_corrupt/);
  assert.match(studio, /hydrateJobs/);
  assert.match(studio, /dup_name_suffix/);
  assert.match(studio, /<Dialog/);
  assert.match(studio, /confirm_cancel/);
  assert.match(studio, /delete_confirm/);
  assert.match(studio, /reset_confirm/);
  assert.match(studio, /kind: "clear-all"/);
  assert.match(studio, /kind: "delete"/);
  assert.match(studio, /kind: "reset"/);
  assert.doesNotMatch(studio, /\bconfirm\(/);
  assert.doesNotMatch(studio, /handleDelete\(j\.id\)/);
  assert.doesNotMatch(studio, /onClick=\{\(\) => handleReset\(\)\}/);
  assert.match(studio, /no_saved/);
  assert.match(studio, /search_saved_aria/);
  assert.match(studio, /filterSavedJobs/);
  assert.match(studio, /t\("power_title"/);
  assert.match(studio, /id="section-6"/);
  assert.match(studio, /id="studio-summary"/);
  assert.match(studio, /computeRuntimeKind/);
  assert.match(studio, /COMPUTES\.map/);
  assert.match(studio, /set\("compute"/);
  assert.match(studio, /wf_compute_pack_only/);
  assert.match(studio, /wf_compute_create/);
  assert.match(studio, /t\("step_compute"/);
  assert.match(studio, /t\("summary_title"/);
  assert.match(studio, /ZIP_ERROR/);
  assert.match(studio, /zipMessage/);
  assert.match(studio, /toast_zip_fail_title/);
  assert.match(studio, /storePlaceholder/);
  assert.match(studio, /store_ph_local/);
  assert.match(studio, /htmlFor=\{`studio-\$\{sk\}-uri`\}/);
  assert.match(studio, /id=\{`studio-\$\{sk\}-uri`\}/);
  assert.doesNotMatch(studio, /STORES\.find\(\(x\) => x\.id === s\[sk\]\)\?\.placeholder/);
  assert.match(studio, /return t\("toast_save_fail"/);
  assert.match(studio, /return t\("zip_err"/);
  assert.doesNotMatch(studio, /return error instanceof Error \? error\.message/);
  assert.doesNotMatch(studio, /return code \|\| t\("zip_err"/);
  assert.doesNotMatch(studio, /\buseId\b/);
  assert.doesNotMatch(studio, /generatedId/);
});

test("Studio joins source notes with appendNote and keeps four provenance slots", () => {
  const studio = readFileSync("src/components/Studio.tsx", "utf8");
  assert.match(studio, /from "@\/lib\/notes"/);
  assert.match(studio, /appendNote\(/);
  assert.doesNotMatch(studio, /\.join\("\\\\n"\)/);
  assert.match(studio, /data-provenance/);
  assert.match(studio, /prov_uri/);
  assert.match(studio, /prov_rev/);
  assert.match(studio, /prov_license/);
  assert.match(studio, /prov_sha/);
  assert.match(studio, /datasetChecksum/);
  assert.match(studio, /inert=\{workspace !== "build"/);
  assert.match(studio, /inert=\{workspace !== "explore"/);
});

test("Studio paints a status rail and folds methods into five families", () => {
  const studio = readFileSync("src/components/Studio.tsx", "utf8");
  assert.match(studio, /data-status-rail/);
  assert.match(studio, /from "@\/lib\/method-families"/);
  assert.match(studio, /METHOD_FAMILIES/);
  assert.match(studio, /FOLDED_METHOD_IDS/);
  assert.match(studio, /data-method-family/);
  assert.match(studio, /fam_reuse/);
  assert.match(studio, /fam_edit/);
  assert.match(studio, /rail_next/);
});

test("Studio listens for papers put-source events", () => {
  const studio = readFileSync("src/components/Studio.tsx", "utf8");
  assert.match(studio, /PUT_SOURCE_EVENT/);
  assert.match(studio, /applySource/);
  assert.match(studio, /param_group_apostate/);
  assert.match(studio, /apostate_kcrn/);
});
