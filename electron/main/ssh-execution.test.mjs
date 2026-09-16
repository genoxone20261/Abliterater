import test from "node:test";
import assert from "node:assert/strict";
import { buildSshPlan, parseSshLog, SSH_PLAN_ERROR } from "./ssh-execution.mjs";

test("ssh execution plan never embeds keys and uses safe remote paths", () => {
  const plan = buildSshPlan(
    { name: "gpu1", host: "gpu.example.com", user: "ubuntu", port: 22 },
    "ablit-pack.zip",
  );
  assert.equal(plan.host, "gpu.example.com");
  assert.ok(plan.commands[0].includes("BatchMode=yes"));
  assert.ok(plan.commands.some((x) => x.includes("scp")));
  assert.ok(plan.commands.some((x) => x.includes("bash run.sh")));
  assert.ok(plan.commands.some((x) => x.includes("artifacts.tgz")));
  assert.equal(JSON.stringify(plan).includes("PRIVATE KEY"), false);
  assert.throws(
    () => buildSshPlan({ name: "bad", host: "../x", user: "-oProxy", port: 22 }, "pack.zip"),
    new RegExp(SSH_PLAN_ERROR.target),
  );
});
test("SSH plans reject traversal and do not hide execution failures", () => {
  const target = { name: "gpu1", host: "gpu.example.com", user: "ubuntu", port: 22 };
  assert.throws(
    () => buildSshPlan({ ...target, name: ".." }, "pack.zip"),
    new RegExp(SSH_PLAN_ERROR.target),
  );
  assert.throws(() => buildSshPlan(target, "-option.zip"), new RegExp(SSH_PLAN_ERROR.pack));
  const plan = buildSshPlan(target, "pack.zip");
  assert.ok(plan.commands.some((x) => x.includes("pipefail")));
  assert.ok(plan.commands.every((x) => !x.includes("|| tar")));
  assert.equal(parseSshLog("ARTIFACT sha256=abc123 path=artifacts.tgz").artifacts.length, 0);
});

test("ssh log parser extracts stages and artifact checksums", () => {
  const parsed = parseSshLog(
    `UPLOAD ok\nRUN exit=0\nARTIFACT sha256=${"a".repeat(64)} path=artifacts.tgz\nCLEANUP ok`,
  );
  assert.deepEqual(parsed.stages, ["UPLOAD", "RUN", "ARTIFACT", "CLEANUP"]);
  assert.equal(parsed.artifacts[0].sha256, "a".repeat(64));
});
