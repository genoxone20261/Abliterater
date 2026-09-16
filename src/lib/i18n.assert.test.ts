import assert from "node:assert/strict";
import { test } from "node:test";
import { DICTIONARY } from "./i18n.ts";

test("ko/en dictionary key sets are identical", () => {
  const ko = Object.keys(DICTIONARY.ko).sort();
  const en = Object.keys(DICTIONARY.en).sort();
  assert.deepEqual(ko, en);
});

test("chrome copy does not keep rec_est_gib leftover", () => {
  assert.doesNotMatch(JSON.stringify(DICTIONARY), /rec_est_gib/);
});

test("English dictionary values have no Hangul", () => {
  const hangul = /[\uac00-\ud7a3]/;
  const hits = Object.entries(DICTIONARY.en)
    .filter(([, value]) => hangul.test(value))
    .map(([key]) => key);
  assert.deepEqual(hits, []);
});
