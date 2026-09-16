import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { DEFAULT_STATE } from "./studio.ts";
import { assertPack, buildPack } from "./pack.ts";

test("local-gguf preset pack reuses GGUF and does not convert or heretic", async () => {
  const { applyPreset } = await import("./presets.ts");
  const s = { ...DEFAULT_STATE, ...applyPreset("local-gguf") };
  const pack = buildPack(s);
  assert.match(pack.sh, /GGUF repo: skip convert_hf_to_gguf/);
  assert.doesNotMatch(pack.sh, /convert_hf_to_gguf\.py/);
  assert.doesNotMatch(pack.sh, /\bheretic \.\/base\b/);
  assert.equal(s.methods?.length, 0);
});

test("gguf-q8 output drives Modelfile quant", () => {
  const s = { ...DEFAULT_STATE, outputs: ["gguf-q8", "ollama"], methods: ["quant"] };
  const pack = buildPack(s);
  assert.match(pack.files.Modelfile, /model\.Q8_0\.gguf/);
});

test("HF custom repo is pull, not BASE_MODEL", async () => {
  const { resolveBasePull } = await import("./model-source.ts");
  const s = {
    ...DEFAULT_STATE,
    modelSource: "hf" as const,
    hfRepo: "Qwen/Qwen3-8B",
    base: "custom",
  };
  assert.equal(resolveBasePull(s), "Qwen/Qwen3-8B");
  const pack = buildPack(s);
  assert.match(pack.sh, /Qwen\/Qwen3-8B/);
  assert.doesNotMatch(pack.sh, /BASE_MODEL/);
  assert.match(pack.sh, /snapshot_download/);
  assert.deepEqual(assertPack(s, pack), []);
});

test("local path copies into ./base", () => {
  const s = {
    ...DEFAULT_STATE,
    modelSource: "local" as const,
    localPath: "/data/models/Qwen3-8B",
    base: "custom",
  };
  const pack = buildPack(s);
  assert.match(pack.sh, /Qwen3-8B/);
  assert.match(pack.sh, /cp -R/);
});

test("API source skips snapshot_download and heretic", () => {
  const s = {
    ...DEFAULT_STATE,
    modelSource: "api" as const,
    apiBaseUrl: "http://127.0.0.1:11434/v1",
    apiModel: "qwen2.5:7b",
    methods: ["heretic", "quant"],
    base: "custom",
  };
  const pack = buildPack(s);
  assert.match(pack.sh, /API source: skip weight download/);
  assert.match(pack.sh, /API_BASE=/);
  assert.match(pack.sh, /qwen2\.5:7b/);
  assert.doesNotMatch(pack.sh, /\bsnapshot_download\s*\(/);
  assert.doesNotMatch(pack.sh, /\bheretic \.\/base\b/);
  assert.match(pack.files["eval.sh"], /chat\/completions/);
});

test("HF custom repo appears in run.ps1", () => {
  const pack = buildPack({
    ...DEFAULT_STATE,
    modelSource: "hf",
    hfRepo: "Qwen/Qwen3-8B",
    base: "custom",
  });
  assert.match(pack.ps1, /Qwen\/Qwen3-8B/);
  assert.doesNotMatch(pack.ps1, /BASE_MODEL/);
});

test("local path uses Copy-Item in run.ps1", () => {
  const pack = buildPack({
    ...DEFAULT_STATE,
    modelSource: "local",
    localPath: "/data/models/Qwen3-8B",
    base: "custom",
  });
  assert.match(pack.ps1, /Copy-Item/);
  assert.match(pack.ps1, /Qwen3-8B/);
});

test("API source run.ps1 skips snapshot and heretic", () => {
  const pack = buildPack({
    ...DEFAULT_STATE,
    modelSource: "api",
    apiBaseUrl: "http://127.0.0.1:11434/v1",
    apiModel: "qwen2.5:7b",
    methods: ["heretic", "quant"],
    base: "custom",
  });
  assert.match(pack.ps1, /API source: no snapshot_download \/ heretic/);
  assert.match(pack.ps1, /qwen2\.5:7b/);
  assert.doesNotMatch(pack.ps1, /heretic \.\/base/);
});

test("failspy pack is analog apply_ablation, not FailSpy CLI", () => {
  const s = {
    ...DEFAULT_STATE,
    methods: ["failspy"],
  };
  const pack = buildPack(s);
  assert.match(pack.sh, /ABLATE_MODE='failspy'/);
  assert.match(pack.sh, /apply_ablation\.py/);
  assert.match(pack.sh, /save_pretrained/);
  assert.match(pack.ps1, /\$env:ABLATE_MODE = 'failspy'/);
  assert.doesNotMatch(pack.sh, /pip install abliterator(?:\s|$)/);
  assert.doesNotMatch(pack.sh, /python -m abliterator/);
  assert.doesNotMatch(pack.sh, /ModelAbliterator/);
});

test("workflow audit blocks empty HF repo", async () => {
  const { auditWorkflow, flowHasBlock } = await import("./model-source.ts");
  const blocked = auditWorkflow({
    ...DEFAULT_STATE,
    modelSource: "hf",
    hfRepo: "",
  });
  assert.equal(flowHasBlock(blocked), true);
  const ok = auditWorkflow({
    ...DEFAULT_STATE,
    modelSource: "hf",
    hfRepo: "p-e-w/Qwen3-4B-Instruct-2507-heretic",
  });
  assert.equal(flowHasBlock(ok), false);
});

// Stale SHA regression guard — detects when code uses an old pin.
// Update STALE_SHAS when a repo drifts (run: npm run test:pack)

test("jimplus GPU pack clones pinned MPOA SHA", () => {
  const pack = buildPack({
    ...DEFAULT_STATE,
    compute: "cuda",
    methods: ["jimplus"],
  });
  assert.match(
    pack.sh,
    /git -C \.\/jimplus-upstream checkout ca6e223843f3aec83b47a0926f5b4c78859c120b/,
  );
  assert.match(pack.sh, /measure\.py .*--projected/);
  assert.match(pack.sh, /sharded_ablate\.py .*--normpreserve --projected/);
  const cpu = buildPack({ ...DEFAULT_STATE, compute: "local-rocm", methods: ["jimplus"] });
  assert.match(cpu.sh, /skip jimplus: GPU path only/);
});

test("no stale SHAs in runners.ts constants", () => {
  // SHAs that are known to be obsolete and must NOT appear in pip/git constants
  const STALE_SHAS = [
    "fb38a3b0c875", // OBLITERATUS: old pin
    "b6f31dd1", // ablate: old pin
    "4d9176092d005", // llama.cpp: old pin
    "515191b40050", // heretic: intermediate pin (superseded by 3521f864)
    "6a1a922d2699", // llama.cpp: intermediate pin
    "c457e3bf7fa8", // llama.cpp: intermediate pin
    "3ad1ba733698", // llama.cpp: intermediate pin
    "95dda4c4dbef", // heretic: old pin
    "dd59a258bc77", // apostate: older pin (chain -> 9c8abfd7 -> be36269d)
    "7c332b0e4edb", // OBLITERATUS: superseded @2026-09-11
    "465e49b9cea7", // llama.cpp: superseded @2026-09-11
    "451b89bae0c4", // llama.cpp: superseded @2026-09-11 afternoon
    "9c8abfd7b56b", // apostate: superseded @2026-09-11
    "3ba085c4f393", // abliterix: old pin (superseded by 5d58cea9)
    "9982c2c", // abliterix: old gitlink
    "bedb94ef", // heretic: old gitlink
  ];

  // Read runners.ts source
  const src = readFileSync("src/lib/runners.ts", "utf8");

  for (const sha of STALE_SHAS) {
    assert.ok(!src.includes(sha), `stale SHA "${sha}" found in runners.ts — update to current pin`);
  }
});

test("catalog/chip/studio display pins match runners HEAD pins", () => {
  const catalog = readFileSync("src/lib/catalog.ts", "utf8");
  const chip = readFileSync("src/lib/chip-copy.ts", "utf8");
  const studio = readFileSync("src/lib/studio.ts", "utf8");
  for (const [label, src] of [
    ["catalog", catalog],
    ["chip-copy", chip],
    ["studio", studio],
  ] as const) {
    assert.match(src, /@be36269d/, `${label} apostate pin`);
    assert.match(src, /@5d58cea9/, `${label} abliterix pin`);
    assert.doesNotMatch(src, /dd59a258/, `${label} stale apostate`);
    assert.doesNotMatch(src, /3ba085c4/, `${label} stale abliterix`);
  }
});

test("EN locale SYSTEM.txt is English POWER, Korean default unchanged", () => {
  const ko = buildPack(DEFAULT_STATE);
  assert.match(ko.prompts.system, /너는 이 세션의 실행기다/);
  assert.equal(assertPack(DEFAULT_STATE, ko).length, 0);
  const en = buildPack(DEFAULT_STATE, undefined, "en");
  assert.match(en.prompts.system, /You are the operator's instrument/);
  assert.doesNotMatch(en.prompts.system, /[가-힣]/);
  assert.doesNotMatch(en.prompts.sft, /[가-힣]/);
  assert.doesNotMatch(en.prompts.evalp, /[가-힣]/);
  assert.equal(assertPack(DEFAULT_STATE, en).length, 0);
});

test("EN locale README field labels are English leftover overlay", () => {
  const ko = buildPack(DEFAULT_STATE);
  assert.match(ko.readme, /- 목적:/);
  const en = buildPack(DEFAULT_STATE, undefined, "en");
  assert.match(en.readme, /- Purpose:/);
  assert.doesNotMatch(en.readme, /- 목적:/);
  assert.doesNotMatch(en.readme, /- 분야:/);
  assert.doesNotMatch(en.readme, /- 컴퓨트:/);
  assert.doesNotMatch(en.cloud, /# 로컬/);
});
