import assert from "node:assert/strict";
import { test } from "node:test";
import { REPOS } from "./catalog.ts";
import { REPO, REPO_SLUG, repoCopy } from "./repo-copy.ts";

test("repo overlay dictionaries have identical keys", () => {
  assert.deepEqual(Object.keys(REPO.ko).sort(), Object.keys(REPO.en).sort());
});

test("English repo overlay has no Hangul", () => {
  for (const [key, value] of Object.entries(REPO.en)) {
    assert.equal(/[가-힣]/.test(value), false, key);
  }
});

test("every catalog repo name has role and use overlay", () => {
  for (const name of Object.keys(REPO_SLUG)) {
    assert.ok(repoCopy(name, "role", "", "en"), name);
    assert.ok(repoCopy(name, "use", "", "en"), name);
    assert.ok(repoCopy(name, "role", "", "ko"), name);
    assert.ok(repoCopy(name, "use", "", "ko"), name);
  }
});

test("unknown repo name falls back without inventing overlay", () => {
  assert.equal(repoCopy("not-a-repo", "role", "fallback", "en"), "fallback");
});

test("every catalog REPOS name has a slug overlay", () => {
  for (const r of REPOS) {
    assert.ok(REPO_SLUG[r.name], r.name);
  }
});
