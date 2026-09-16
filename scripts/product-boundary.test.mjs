import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");

test("arbitrary model endpoints are browser-only, never unauthenticated server proxies", () => {
  assert.doesNotMatch(read("src/lib/model-hub.ts"), /export const listCompatModels\s*=/);
  assert.doesNotMatch(read("src/components/ModelSource.tsx"), /listCompatModels\(\{/);
});
test("provider keys are not automatically persisted in localStorage", () => {
  assert.doesNotMatch(read("src/components/ModelSource.tsx"), /writeLocal\(API_KEY_KEY/);
  assert.doesNotMatch(read("src/components/ModelSource.tsx"), /ablit\.hf-token|TOKEN_KEY/);
});
test("workbench pack and chrome do not ship author KDP reports", () => {
  assert.doesNotMatch(read("src/lib/pack.ts"), /public\/reports/);
  assert.doesNotMatch(read("src/routes/index.tsx"), /\/reports\//);
  assert.doesNotMatch(read("src/lib/pack.ts"), /abliteration-report\.pdf/);
});
test("dockerignore and gitignore keep research dumps and KDP reports out of image/git", () => {
  const docker = read(".dockerignore");
  const git = read(".gitignore");
  assert.match(docker, /public\/reports/);
  assert.match(docker, /docs\/research/);
  assert.match(git, /public\/reports/);
  assert.match(git, /docs\/research/);
});
test("README does not point at session research dumps", () => {
  assert.doesNotMatch(read("README.md"), /research20260905_master_todo/);
  assert.doesNotMatch(read("README.md"), /docs\/research-/);
});
test("LICENSE.md does not point at session research dumps", () => {
  assert.doesNotMatch(read("LICENSE.md"), /research20260905_master_todo/);
  assert.doesNotMatch(read("LICENSE.md"), /docs\/research/);
});
test("root ships bilingual user guide, contributing, and acceptable use", () => {
  for (const name of [
    "USER-GUIDE.ko.md",
    "USER-GUIDE.en.md",
    "CONTRIBUTING.ko.md",
    "CONTRIBUTING.en.md",
    "ACCEPTABLE-USE.ko.md",
    "ACCEPTABLE-USE.en.md",
    "README.ko.md",
    "SUPPORT.ko.md",
    "SUPPORT.en.md",
  ]) {
    const body = read(name);
    assert.ok(body.length > 400, name);
  }
  const aup = read("ACCEPTABLE-USE.en.md");
  assert.match(aup, /No third-party commercial use/i);
  assert.match(aup, /illegal/i);
  assert.match(aup, /abuse/i);
  assert.match(read("README.md"), /ACCEPTABLE-USE/);
  assert.match(read("README.md"), /USER-GUIDE\.ko\.md/);
  assert.match(read("LICENSE.md"), /ACCEPTABLE-USE/);
  assert.match(read("README.md"), /Educational/);
  assert.match(read("README.md"), /worldwide attention/);
  assert.match(read("ACCEPTABLE-USE.en.md"), /educational/i);
  assert.match(read("ACCEPTABLE-USE.en.md"), /worldwide attention/i);
  assert.match(read("ACCEPTABLE-USE.ko.md"), /교육용/);
  assert.match(read("ACCEPTABLE-USE.ko.md"), /전 세계의 관심/);
  assert.match(read("SUPPORT.en.md"), /Sponsor \(donation\)/);
  assert.match(read("SUPPORT.en.md"), /Invest \(inquiry\)/);
  assert.match(read("SUPPORT.ko.md"), /후원/);
  assert.match(read("SUPPORT.ko.md"), /투자/);
  assert.match(read("README.ko.md"), /교육 목적/);
  assert.doesNotMatch(read("README.md"), /[가-힣]/);
  assert.match(read("README.md"), /Contributions are welcome/);
  assert.match(read("README.md"), /Contribute with us/);
  assert.match(read("README.md"), /Why this exists/);
  assert.match(read("README.md"), /First session/);
  assert.match(read("README.md"), /What abliteration means here/);
  assert.match(read("README.ko.md"), /첫 세션/);
  assert.match(read("USER-GUIDE.en.md"), /What abliteration means here/);
  assert.match(read("USER-GUIDE.ko.md"), /여기서 abliteration이 의미하는 것/);
  assert.match(read("README.md"), /not licensed/);
  assert.match(read("README.md"), /README\.ja\.md/);
  assert.match(read("README.md"), /README\.zh-Hans\.md/);
  assert.match(read("README.ko.md"), /같이 기여/);
  for (const name of [
    "README.ja.md",
    "README.zh-Hans.md",
    "README.zh-Hant.md",
    "README.es.md",
    "README.fr.md",
    "README.de.md",
    "README.pt-BR.md",
    "README.ru.md",
    "README.ar.md",
    "README.vi.md",
    "README.id.md",
  ]) {
    const body = read(name);
    assert.ok(body.length > 2000, name);
    assert.match(body, /genoxone20261\/Abliterater_public/);
    assert.match(body, /support@genox\.one/);
    assert.match(body, /analog IMPLEMENTED/);
    assert.match(body, /ACCEPTABLE-USE/);
  }
  assert.match(read("CONTRIBUTING.en.md"), /Help wanted/);
  assert.match(read("CONTRIBUTING.ko.md"), /함께 기여/);
  assert.match(read("USER-GUIDE.en.md"), /C-001 and C-008/);
  assert.match(read("SECURITY.md"), /support@genox.one/);
  assert.ok(read("SECURITY.md").length > 200);
  assert.match(read("README.md"), /Thank you/);
  assert.match(read("README.ko.md"), /감사합니다/);
  assert.match(read("USER-GUIDE.en.md"), /Acknowledgments — repositories/);
  assert.match(read("USER-GUIDE.ko.md"), /감사의 말 — 리포지토리/);
});
test("public product text does not embed personal machine SKUs or home paths", () => {
  const bodies = [
    read("src/data/WORKFLOW.md"),
    read("src/data/TODO-WORKLOAD-SPEC-20260912.md"),
    read("src/data/ECOSYSTEM-MASTER-TODO.md"),
    read("electron/main/hardware-profile.test.mjs"),
    read("README.md"),
    read("USER-GUIDE.ko.md"),
    read("USER-GUIDE.en.md"),
    read("README.ko.md"),
    read("SUPPORT.ko.md"),
    read("SUPPORT.en.md"),
  ].join("\n");
  assert.doesNotMatch(bodies, /14650HX/);
  assert.doesNotMatch(bodies, /RTX 5070/);
  assert.doesNotMatch(bodies, /Users\/Juno/);
  assert.doesNotMatch(bodies, /Users\\\\Juno/);
  assert.doesNotMatch(bodies, /:18081/);
  assert.doesNotMatch(bodies, /hermes3:8b/);
});
test(".env.example is comments only", () => {
  const env = read(".env.example");
  for (const line of env.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    assert.ok(t.startsWith("#"), t);
  }
});
test("production build omits author KDP reports from output and extraResources", () => {
  assert.match(read("package.json"), /omit-kdp-from-output/);
  assert.match(read("scripts/omit-kdp-from-output.mjs"), /static\/reports/);
  const extras = JSON.parse(read("electron/package.json")).build.extraResources;
  const web = extras.find((e) => e.from === "../.vercel/output");
  assert.ok(web?.filter?.some((f) => f.includes("reports")));
});
