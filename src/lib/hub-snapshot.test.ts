import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("Hub snapshot covers every catalog BASE name from this-session fetch", () => {
  const snap = JSON.parse(
    readFileSync("src/data/HUB-SNAPSHOT-20260912.json", "utf8"),
  );
  const studio = readFileSync("src/lib/studio.ts", "utf8");
  const block = studio.slice(
    studio.indexOf("export const BASES"),
    studio.indexOf("export const COMPUTES"),
  );
  const ids = [...block.matchAll(/id: "([^"]+)"/g)].map((m) => m[1]);
  assert.equal(snap.asOf, "2026-09-12");
  assert.match(snap.evidence, /Not an in-app Hub adapter/);
  const byId = new Map(snap.models.map((m: { id: string }) => [m.id, m]));
  assert.ok(ids.length >= 10);
  for (const id of ids) {
    const row = byId.get(id);
    assert.ok(row, id);
  }
});
