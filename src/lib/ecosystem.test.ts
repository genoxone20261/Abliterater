import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("all researched sources are exposed through the application catalog", async () => {
  const { ecosystemSources } = await import("./ecosystem.ts");
  const expected = ["compute", "dataset", "method"].flatMap((kind) =>
    JSON.parse(readFileSync(`src/data/${kind}-sources.json`, "utf8")),
  );
  assert.equal(ecosystemSources.length, expected.length);
  assert.equal(new Set(ecosystemSources.map((s) => `${s.category}:${s.id}`)).size, expected.length);
  assert.ok(ecosystemSources.every((s) => s.support === "catalog"));
});

test("invalid ecosystem source throws a stable code", async () => {
  const { validateEcosystemSource, ECOSYSTEM_ERROR } = await import("./ecosystem.ts");
  assert.throws(() => validateEcosystemSource({}, "compute"), new RegExp(ECOSYSTEM_ERROR.invalid));
});
