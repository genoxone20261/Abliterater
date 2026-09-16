import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createWorkspaceStorage } from "./workspace-storage.mjs";

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "ablit-storage-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const settingsDir = join(root, "settings");
  const defaultRoot = join(root, "data");
  const repositoryRoot = join(root, "source");
  await mkdir(repositoryRoot);
  return { root, settingsDir, defaultRoot, repositoryRoot };
}

test("workspace creates OS-selected default, probes disk and survives restart", async (t) => {
  const options = await fixture(t);
  const service = createWorkspaceStorage(options);
  const initial = await service.get();
  assert.equal(initial.root, await realpath(options.defaultRoot));
  assert.ok(initial.freeBytes > 0);
  assert.equal(initial.writable, true);
  const selected = join(options.root, "selected");
  await mkdir(selected);
  const changed = await service.select(selected);
  assert.equal(changed.root, await realpath(selected));
  assert.equal((await createWorkspaceStorage(options).get()).root, changed.root);
  const persisted = JSON.parse(await readFile(join(options.settingsDir, "workspace.json"), "utf8"));
  assert.deepEqual(Object.keys(persisted).sort(), ["root", "version"]);
});

test("workspace rejects source roots and realpath aliases without changing selection", async (t) => {
  const options = await fixture(t);
  const service = createWorkspaceStorage(options);
  const initial = await service.get();
  await assert.rejects(service.select(options.repositoryRoot), /WS_REPO/);
  const link = join(options.root, "alias");
  await symlink(options.repositoryRoot, link, process.platform === "win32" ? "junction" : "dir");
  await assert.rejects(service.select(link), /WS_REPO/);
  assert.equal((await service.get()).root, initial.root);
});

test("workspace rejects invalid persisted state rather than silently replacing it", async (t) => {
  const options = await fixture(t);
  await mkdir(options.settingsDir);
  await writeFile(join(options.settingsDir, "workspace.json"), "{broken");
  await assert.rejects(createWorkspaceStorage(options).get(), /WS_SETTINGS/);
});

test("workspace rejects non-directory selections and malformed IPC values", async (t) => {
  const options = await fixture(t);
  const service = createWorkspaceStorage(options);
  const file = join(options.root, "file");
  await writeFile(file, "existing");
  for (const value of [null, {}, "relative", file]) await assert.rejects(service.select(value));
});
