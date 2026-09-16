import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const source = readFileSync(new URL("./Studio.tsx", import.meta.url), "utf8");
test("auxiliary tools live in persistent panels separate from the initial builder", () => {
  for (const id of ["build", "explore", "connect"]) {
    assert.ok(source.includes(`id="workspace-${id}"`), `missing ${id} panel`);
    assert.ok(source.includes(`hidden={workspace !== "${id}"}`), `must preserve ${id} state`);
  }
  assert.ok(source.includes("<WorkspaceTabs"), "workspace navigation must be mounted");
});
test("workflow rail, configuration canvas and summary are direct children of the desktop grid", () => {
  assert.match(source, /<div className="workflow-grid">/);
  assert.match(source, /<nav className="workflow-rail"/);
  assert.match(source, /<div className="workflow-canvas/);
  assert.match(source, /<aside id="studio-summary" className="result-rail/);
});
test("evaluation and logging are outside the primary workflow grid", () => {
  const gridEnd = source.indexOf("</aside>");
  assert.ok(gridEnd >= 0);
  assert.ok(source.indexOf("<BenchRunner />") > gridEnd);
  assert.ok(source.indexOf("<LoggingPanel />") > gridEnd);
});
