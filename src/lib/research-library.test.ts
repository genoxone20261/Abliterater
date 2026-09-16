import assert from "node:assert/strict";
import { test } from "node:test";
import { PAPERS, REPOS } from "./catalog.ts";
import { filterResearchLibrary } from "./research-library.ts";

test("research library searches paper and repository metadata case-insensitively", () => {
  const papers = filterResearchLibrary(PAPERS, REPOS, "NEURIPS", "papers");
  assert.ok(papers.papers.length > 0);
  assert.equal(papers.repos.length, 0);

  const repos = filterResearchLibrary(PAPERS, REPOS, "HERETIC", "repos");
  assert.ok(repos.repos.some((repo) => repo.name.toLowerCase().includes("heretic")));
  assert.equal(repos.papers.length, 0);
});

test("research library type filter and zero-result state are deterministic", () => {
  const all = filterResearchLibrary(PAPERS, REPOS, "", "all");
  assert.equal(all.papers.length, PAPERS.length);
  assert.equal(all.repos.length, REPOS.length);
  assert.equal(all.total, PAPERS.length + REPOS.length);

  const none = filterResearchLibrary(PAPERS, REPOS, "definitely-no-such-entry-92741", "all");
  assert.deepEqual(none, { papers: [], repos: [], total: 0 });
});
