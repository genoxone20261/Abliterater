import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("SshConnection Field labels bind htmlFor to input ids", () => {
  const src = readFileSync("src/components/SshConnection.tsx", "utf8");
  for (const id of ["ssh-name", "ssh-host", "ssh-user", "ssh-port"]) {
    assert.match(src, new RegExp(`htmlFor="${id}"`));
    assert.match(src, new RegExp(`id="${id}"`));
  }
});

test("SshConnection maps SSH_ERROR codes through i18n", () => {
  const src = readFileSync("src/components/SshConnection.tsx", "utf8");
  assert.match(src, /SSH_ERROR/);
  assert.match(src, /sshMessage/);
  assert.doesNotMatch(src, /return code \|\| t\("ssh_err"/);
  assert.match(src, /return t\("ssh_err"/);
});
