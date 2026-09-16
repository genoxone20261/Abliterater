import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  assertDistributedUnrun,
  assertGgufUnrun,
  assertQloraUnrun,
  assertServingUnrun,
  classifyCartPole,
  classifyHttpFixture,
  classifyIrisAccuracy,
  COMMAND_CENTER_VIEWS,
  CLI_MONITOR_ERROR,
  onSpotInterrupt,
  packVsDownloadHash,
  paidCleanupLedger,
  parseCliJobList,
  recordSpotCheckpoint,
  runCliMonitor,
  SPOT_ERROR,
  wizardSteps,
  workloadProvenance,
  WORKLOAD_ERROR,
} from "./analog-wave3.ts";

test("M-005/006/007 analog: CLI monitor never shells out and rejects bad schema", () => {
  assert.throws(() => runCliMonitor("azure-ml"), new RegExp(CLI_MONITOR_ERROR.unimplemented));
  assert.throws(() => runCliMonitor("aws"), new RegExp(CLI_MONITOR_ERROR.unimplemented));
  assert.throws(() => runCliMonitor("gcp"), new RegExp(CLI_MONITOR_ERROR.unimplemented));
  const rows = parseCliJobList([{ id: "job-1", status: "Running" }]);
  assert.equal(rows[0].rawState, "Running");
  assert.throws(() => parseCliJobList({ jobs: [] }), new RegExp(CLI_MONITOR_ERROR.schema));
});

test("L-005 analog: spot interrupt is unhandled and checkpoints stay unverified", () => {
  assert.throws(() => onSpotInterrupt(), new RegExp(SPOT_ERROR.interrupt));
  assert.equal(recordSpotCheckpoint("./ckpt").verified, false);
});

test("에코 W-001–W-006 analog: golden labels do not close GPU/RL/serving", () => {
  assert.throws(() => assertQloraUnrun(), new RegExp(WORKLOAD_ERROR.qlora));
  assert.throws(() => assertGgufUnrun(), new RegExp(WORKLOAD_ERROR.gguf));
  assert.deepEqual(classifyIrisAccuracy(0.947368), {
    isLora: false,
    isQlora: false,
    sklearnSplit: true,
  });
  assert.deepEqual(classifyCartPole(50, 50), { isRlTrain: false, envPass: true });
  assert.throws(() => assertDistributedUnrun(), new RegExp(WORKLOAD_ERROR.dist));
  assert.throws(() => assertServingUnrun(), new RegExp(WORKLOAD_ERROR.serve));
});

test("에코 W-007/D-002/D-011 analog: provenance and pack hash stay unverified", () => {
  const row = workloadProvenance({ codeRevision: "abc", seed: 42 });
  assert.equal(row.executionVerified, false);
  assert.equal(row.seed, 42);
  const cmp = packVsDownloadHash("pack", "dl");
  assert.equal(cmp.equal, false);
  assert.equal(cmp.downloadVerified, false);
});

test("U-001/U-002 analog: wizard is auth-capability driven; command center views are explicit", () => {
  assert.deepEqual(wizardSteps("oauth2"), ["pkce", "callback", "scope"]);
  assert.deepEqual(wizardSteps("api-key"), ["paste", "memory-only"]);
  assert.deepEqual(wizardSteps("cloud-cli"), ["detect-session", "no-copy"]);
  assert.deepEqual(
    [...COMMAND_CENTER_VIEWS],
    ["list", "detail", "log", "artifact", "cost", "cleanup"],
  );
});

test("Q-001/Q-002 analog: fixture kinds cover 429/5xx/401/403/timeout/schema", () => {
  assert.equal(classifyHttpFixture(429, {}), "rate-limit");
  assert.equal(classifyHttpFixture(503, {}), "server");
  assert.equal(classifyHttpFixture(401, {}), "expired");
  assert.equal(classifyHttpFixture(403, {}), "denied");
  assert.equal(classifyHttpFixture(408, {}), "timeout");
  assert.equal(classifyHttpFixture(200, {}), "schema");
  assert.equal(classifyHttpFixture(200, [{ id: "1" }]), "ok");
});

test("Q-008 analog: paid cleanup ledger never self-verifies", () => {
  assert.deepEqual(paidCleanupLedger([]), { remaining: 0, verified: false });
  assert.equal(paidCleanupLedger(["pod"]).verified, false);
});

test("U-004 analog: SourceHub maps 401/403 separately from 429", () => {
  const src = readFileSync("src/components/SourceHub.tsx", "utf8");
  assert.match(src, /sh_err_expired/);
  assert.match(src, /sh_err_denied/);
  assert.match(src, /status === "401"/);
  assert.match(src, /status === "403"/);
});

test("Q-007 analog: command-center and wizard i18n keys exist in both dictionaries", () => {
  const i18n = readFileSync("src/lib/i18n.ts", "utf8");
  for (const key of ["wiz_step_pkce", "cmd_view_list", "sh_err_expired", "sh_err_denied"]) {
    assert.equal(i18n.split(`${key}:`).length - 1, 2);
  }
});

test("W09 analog leftover: stepper n matches section-n (ModelSource is section-1)", () => {
  const src = readFileSync("src/components/Studio.tsx", "utf8");
  assert.match(src, /n: 1, label: t\("step_base"/);
  assert.match(src, /n: 4, label: t\("step_presets"/);
  assert.match(src, /<section id="section-1"[\s\S]*?<ModelSource/);
  assert.match(src, /<section id="section-4"[\s\S]*?step_presets/);
});

test("Q-007 analog leftover: text-subtle meets 4.5:1 on graphite bg", () => {
  const css = readFileSync("src/styles.css", "utf8");
  assert.match(css, /--color-subtle: #7a8490;/);
  assert.doesNotMatch(css, /--color-subtle: #707784;/);
});

test("Studio method Field labels go through t()", () => {
  const src = readFileSync("src/components/Studio.tsx", "utf8");
  assert.doesNotMatch(src, /Field label="n_trials"/);
  assert.match(src, /t\("fld_n_trials"/);
  assert.match(src, /t\("fld_lora_r"/);
});

test("SourceHub catalog badge uses text-muted not 10px text-subtle", () => {
  const src = readFileSync("src/components/SourceHub.tsx", "utf8");
  assert.match(src, /uppercase text-muted/);
  assert.doesNotMatch(src, /uppercase text-subtle/);
});

test("ModelSource placeholders and HF chips go through t()", () => {
  const src = readFileSync("src/components/ModelSource.tsx", "utf8");
  assert.doesNotMatch(src, /placeholder="owner\/name"/);
  assert.doesNotMatch(src, /placeholder="http:\/\/127\.0\.0\.1:11434\/v1"/);
  assert.match(src, /t\("ms_ph_repo"/);
  assert.match(src, /t\("ms_ph_api"/);
  assert.match(src, /t\("ms_chip_gguf"/);
});

test("SSH host placeholder goes through t()", () => {
  const src = readFileSync("src/components/SshConnection.tsx", "utf8");
  assert.doesNotMatch(src, /placeholder="gpu\.example\.com"/);
  assert.match(src, /t\("ssh_ph_host"/);
});

test("LoggingPanel export filename goes through t()", () => {
  const src = readFileSync("src/components/LoggingPanel.tsx", "utf8");
  assert.doesNotMatch(src, /a\.download = "provider-log\.json"/);
  assert.match(src, /t\("log_export_filename"/);
});

test("TitleBar brand goes through t()", () => {
  const src = readFileSync("src/components/TitleBar.tsx", "utf8");
  assert.doesNotMatch(src, />Abliterater</);
  assert.match(src, /t\("app_name"/);
});

test("StorageSettings unknown size goes through t()", () => {
  const src = readFileSync("src/components/StorageSettings.tsx", "utf8");
  assert.doesNotMatch(src, /return "unknown"/);
  assert.match(src, /t\("ws_size_unknown"/);
});

test("ConnectionWizard and JobCommandCenter have i18n aria-label", () => {
  const wiz = readFileSync("src/components/ConnectionWizard.tsx", "utf8");
  const cmd = readFileSync("src/components/JobCommandCenter.tsx", "utf8");
  assert.match(wiz, /aria-label=\{t\("wiz_aria"/);
  assert.match(cmd, /aria-label=\{t\("cmd_aria"/);
});

test("LoggingPanel provider kinds go through t()", () => {
  const src = readFileSync("src/components/LoggingPanel.tsx", "utf8");
  assert.doesNotMatch(src, /KIND\[row\.provider\]/);
  assert.match(src, /t\(\s*row\.provider === "hf"/);
});

test("SourceHub searches through server fn, not browser CORS fetch", () => {
  const src = readFileSync("src/components/SourceHub.tsx", "utf8");
  assert.match(src, /searchSources/);
  assert.doesNotMatch(src, /fetchSourceResults\(/);
  assert.match(src, /sh_err_cors/);
});

test("model-hub throws HUB_ERROR codes, not Hugging Face English", () => {
  const src = readFileSync("src/lib/model-hub.ts", "utf8");
  assert.doesNotMatch(src, /Hugging Face \$\{/);
  assert.doesNotMatch(src, /Hugging Face response/);
  assert.match(src, /HUB_ERROR\.http/);
  assert.match(src, /HUB_ERROR\.network/);
});

test("Studio method param group headings go through t()", () => {
  const src = readFileSync("src/components/Studio.tsx", "utf8");
  assert.doesNotMatch(src, />Heretic</);
  assert.doesNotMatch(src, />LoRA \(SFT \/ DPO \/ CPT\)</);
  assert.doesNotMatch(src, />CAST</);
  assert.match(src, /param_group_heretic/);
  assert.match(src, /param_group_lora/);
  assert.match(src, /param_group_cast/);
});

test("PdfViewer errors go through t(), not pdfjs English", () => {
  const src = readFileSync("src/components/PdfViewer.tsx", "utf8");
  assert.doesNotMatch(src, /e instanceof Error \? e\.message/);
  assert.match(src, /t\("pdf_open_fail"/);
  assert.match(src, /t\("pdf_page_fail"/);
});

test("ModelSource Hub errors go through t()", () => {
  const src = readFileSync("src/components/ModelSource.tsx", "utf8");
  assert.doesNotMatch(src, /setErr\(e instanceof Error \? e\.message/);
  assert.match(src, /ms_err_hub_size/);
  assert.match(src, /inspectMessage\(e, locale\)/);
  assert.match(src, /COMPAT_ERROR\.network/);
  assert.doesNotMatch(src, /replace\("\{msg\}", e\.message\)/);
});

test("Recommendations Hub live overlay does not rewrite BASES", () => {
  const rec = readFileSync("src/components/Recommendations.tsx", "utf8");
  const hub = readFileSync("src/lib/model-hub.ts", "utf8");
  assert.match(rec, /refreshCatalogLive/);
  assert.match(rec, /data-hub-live-btn/);
  assert.match(rec, /CATALOG_AS_OF/);
  assert.doesNotMatch(rec, /BASES\s*=/);
  assert.match(hub, /export const refreshCatalogLive/);
});

test("electron workspace dialog title is locale-split, not bilingual leftover", () => {
  const src = readFileSync("electron/main/main.mjs", "utf8");
  assert.doesNotMatch(src, /Workspace \/ /);
  assert.match(src, /getLocale\(\)/);
});

test("Studio store placeholders go through t(), not STORES Hangul leftover", () => {
  const src = readFileSync("src/components/Studio.tsx", "utf8");
  assert.doesNotMatch(src, /STORES\.find\(\(x\) => x\.id === s\[sk\]\)\?\.placeholder/);
  assert.match(src, /storePlaceholder/);
  assert.match(src, /store_ph_local/);
  assert.match(src, /store_ph_nfs/);
});

test("Studio storage/zip unknown errors do not leak error.message", () => {
  const src = readFileSync("src/components/Studio.tsx", "utf8");
  assert.doesNotMatch(
    src,
    /return error instanceof Error \? error\.message : t\("toast_save_fail"/,
  );
  assert.match(src, /return t\("toast_save_fail"/);
  assert.doesNotMatch(src, /return code \|\| t\("zip_err"/);
  assert.match(src, /return t\("zip_err"/);
});

test("AppErrorComponent chrome goes through t(), keeps error.message", () => {
  const src = readFileSync("src/lib/error-component.tsx", "utf8");
  assert.doesNotMatch(src, /Something went wrong/);
  assert.match(src, /t\("err_unexpected_title"/);
  assert.match(src, /error\.message/);
});

test("execution-jobs throws codes, not English leftover", () => {
  const src = readFileSync("src/lib/execution-jobs.ts", "utf8");
  assert.match(src, /EXEC_ERROR/);
  assert.doesNotMatch(src, /manifest must be an object/);
  assert.doesNotMatch(src, /invalid budget/);
  assert.doesNotMatch(src, /invalid maxMinutes/);
});

test("electron lifecycle/gateway/ssh throws codes, not English leftover", () => {
  const life = readFileSync("electron/main/provider-lifecycle.mjs", "utf8");
  const gate = readFileSync("electron/main/provider-gateway.mjs", "utf8");
  const ssh = readFileSync("electron/main/ssh-execution.mjs", "utf8");
  assert.match(life, /LIFECYCLE_ERROR/);
  assert.doesNotMatch(life, /explicit cost approval required/);
  assert.doesNotMatch(life, /unsupported lifecycle/);
  assert.match(gate, /GATEWAY_ERROR/);
  assert.doesNotMatch(gate, /invalid request/);
  assert.doesNotMatch(gate, /Provider request failed/);
  assert.match(ssh, /SSH_PLAN_ERROR/);
  assert.doesNotMatch(ssh, /invalid SSH target/);
});

test("electron main IPC throws codes, not English leftover", () => {
  const src = readFileSync("electron/main/main.mjs", "utf8");
  assert.match(src, /MAIN_ERROR/);
  assert.doesNotMatch(src, /Untrusted sender/);
  assert.doesNotMatch(src, /Hydration timeout/);
  assert.doesNotMatch(src, /Desktop smoke failed/);
  assert.doesNotMatch(src, /Provider request already in progress/);
});

test("EN locale pack SYSTEM uses POWER_PROMPT_EN, not Korean leftover", () => {
  const studio = readFileSync("src/lib/studio.ts", "utf8");
  const pack = readFileSync("src/lib/pack.ts", "utf8");
  const ui = readFileSync("src/components/Studio.tsx", "utf8");
  assert.match(studio, /locale: "ko" \| "en"/);
  assert.match(studio, /function buildPromptsEn/);
  assert.match(studio, /POWER_PROMPT_EN/);
  assert.match(pack, /POWER_HEAD_EN/);
  assert.match(pack, /buildPrompts\(s, locale\)/);
  assert.match(ui, /buildPack\(input, paramsOf\(s\), locale\)/);
});

test("W01 analog leftover: Studio summary overlays chipCopy, not pack.title BASES Hangul", () => {
  const src = readFileSync("src/components/Studio.tsx", "utf8");
  assert.doesNotMatch(src, /\{pack\.title\}/);
  assert.match(src, /chipCopy\("purpose", s\.purpose, "title"/);
  assert.match(src, /chipCopy\("domain", s\.domain, "title"/);
  assert.match(src, /\{s\.gpu \|\| s\.compute\}/);
});
