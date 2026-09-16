import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { HERETIC_NO_STREAM_PARAMS_B } from "./recommendation.ts";

test("R-004 analog: local-cuda heretic pack pins bnb_4bit and drops removed CLI flags", () => {
  const pack = readFileSync("src/lib/pack.ts", "utf8");
  assert.match(pack, /const gpu = s\.compute === "local-cuda"/);
  assert.match(pack, /--quantization bnb_4bit/);
  assert.match(pack, /HERETIC_QUANTIZATION=bnb_4bit/);
  assert.match(pack, /Those two are Optuna search parameters/);
  assert.doesNotMatch(pack, /heretic \.\/base[^\\n]*--output /);
  assert.doesNotMatch(pack, /--max-weight \$\{/);
});

test("R-005 analog: train_lora CUDA path is 4-bit QLoRA, fallback is not mixed into the 4-bit formula", () => {
  const py = readFileSync("src/lib/pack-assets.ts", "utf8");
  assert.match(py, /BitsAndBytesConfig/);
  assert.match(py, /load_in_4bit=True/);
  assert.match(py, /bnb_4bit_quant_type=/);
  assert.match(py, /bnb = None/);
  assert.match(py, /torch_dtype=dtype/);
  assert.doesNotMatch(py, /--qlora/);
});

test("R-004 analog: 80B+ heretic no-stream threshold stays on total params", () => {
  assert.equal(HERETIC_NO_STREAM_PARAMS_B, 80);
});
