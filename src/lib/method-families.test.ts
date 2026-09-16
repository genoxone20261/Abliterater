import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FOLDED_METHOD_IDS,
  METHOD_FAMILIES,
  methodFamilyOf,
  statusRail,
} from "./method-families.ts";

test("methodFamilyOf maps existing method ids into five families", () => {
  assert.equal(methodFamilyOf("heretic"), "edit");
  assert.equal(methodFamilyOf("apostate"), "edit");
  assert.equal(methodFamilyOf("failspy"), "edit");
  assert.equal(methodFamilyOf("sft-unc"), "train");
  assert.equal(methodFamilyOf("lora-dpo"), "train");
  assert.equal(methodFamilyOf("quant"), "quant");
  assert.equal(methodFamilyOf("cast"), "infer");
  assert.equal(methodFamilyOf("rag-first"), "infer");
  assert.equal(methodFamilyOf("nope"), null);
});

test("METHOD_FAMILIES lists each id once and folds FailSpy/ErisForge", () => {
  const ids = METHOD_FAMILIES.flatMap((f) => f.ids);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(FOLDED_METHOD_IDS, ["failspy", "erisforge"]);
  assert.ok(METHOD_FAMILIES.some((f) => f.id === "reuse" && f.ids.length === 0));
});

test("statusRail marks empty methods as skip and next as pack-not-run", () => {
  const empty = statusRail({
    pull: "bartowski/Qwen-heretic-GGUF",
    dataUri: "",
    revision: "",
    license: "",
    sha256: "",
    methods: [],
  });
  assert.equal(empty.base.state, "ok");
  assert.equal(empty.method.empty, true);
  assert.equal(empty.method.state, "ok");
  assert.equal(empty.data.state, "warn");
  assert.equal(empty.next.state, "mute");

  const hashed = statusRail({
    pull: "Qwen/Qwen3-4B",
    dataUri: "Open-Orca/OpenOrca",
    revision: "main",
    license: "mit",
    sha256: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    methods: ["heretic"],
  });
  assert.equal(hashed.data.state, "ok");
  assert.equal(hashed.method.empty, false);
  assert.deepEqual(hashed.method.ids, ["heretic"]);
});
