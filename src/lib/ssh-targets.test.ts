import test from "node:test";
import assert from "node:assert/strict";
import { SSH_ERROR, sshCommand, validateSshTarget } from "./ssh-targets.ts";

test("SSH rejects leading option characters and shell expressions", () => {
  for (const user of ["-oProxyCommand=calc", "-v", "--help"]) {
    assert.throws(() => validateSshTarget({ name: "lab", host: "host", user, port: 22 }));
  }
  const target = { name: "lab", host: "host", user: "ubuntu", port: 22 };
  for (const command of [
    "bash run.sh; touch /tmp/injected",
    "$(whoami)",
    "bash run.sh && reboot",
  ]) {
    assert.throws(() => sshCommand(target, command));
  }
});

test("SSH target accepts a normal remote machine without a private-key field", () => {
  const target = validateSshTarget({
    name: "lab-4090",
    host: "gpu.example.com",
    user: "ubuntu",
    port: 2222,
  });
  assert.deepEqual(target, {
    name: "lab-4090",
    host: "gpu.example.com",
    user: "ubuntu",
    port: 2222,
  });
  assert.equal(
    sshCommand(target),
    "ssh -o BatchMode=yes -o ConnectTimeout=10 -p 2222 -- ubuntu@gpu.example.com 'bash run.sh'",
  );
});

test("SSH target rejects shell injection, traversal and invalid ports", () => {
  assert.throws(
    () => validateSshTarget({ name: "x", host: "host;calc", user: "u", port: 22 }),
    new RegExp(SSH_ERROR.host),
  );
  assert.throws(
    () => validateSshTarget({ name: "x", host: "example..com", user: "u", port: 22 }),
    new RegExp(SSH_ERROR.host),
  );
  assert.throws(
    () => validateSshTarget({ name: "x", host: "host", user: "u", port: 0 }),
    new RegExp(SSH_ERROR.port),
  );
  assert.throws(
    () => sshCommand({ name: "x", host: "host", user: "u", port: 22 }, "bash run.sh'; calc"),
    new RegExp(SSH_ERROR.command),
  );
});
