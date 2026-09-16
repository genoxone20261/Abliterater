import test from "node:test";
import assert from "node:assert/strict";
import { purposeMatrix } from "./purpose-matrix.ts";

test("abliterated default is EN heretic+quant, not ErisForge/COSMIC", () => {
  const m = purposeMatrix({ purpose: "abliterated", domain: "general" });
  assert.equal(m.measureLang, "en");
  assert.deepEqual(m.methods, ["heretic", "quant"]);
  assert.equal(m.methods.includes("erisforge"), false);
  assert.equal(
    m.notes.some((n) => /COSMIC/.test(n)),
    true,
  );
});

test("ZH measure selects deccp only for censorship-shaped abliteration", () => {
  const m = purposeMatrix({ purpose: "abliterated", domain: "general", measureLang: "zh" });
  assert.deepEqual(m.methods, ["deccp", "quant"]);
});

test("engineering prefers light ablation + GSM8K note", () => {
  const m = purposeMatrix({ purpose: "abliterated", domain: "engineering" });
  assert.deepEqual(m.methods, ["deccp", "quant"]);
  assert.equal(
    m.notes.some((n) => /GSM8K/.test(n)),
    true,
  );
});

test("math domain purpose does not treat ablation as skill", () => {
  const m = purposeMatrix({ purpose: "domain", domain: "math" });
  assert.ok(m.methods.includes("rag-first"));
  assert.equal(
    m.notes.some((n) => /실력/.test(n)),
    true,
  );
});
