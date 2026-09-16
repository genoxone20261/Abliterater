import test from "node:test";
import assert from "node:assert/strict";
import {
  WORKSPACE_ERROR,
  defaultWorkspaceRoot,
  validateWorkspaceRoot,
} from "./workspace-storage.ts";

test("workspace root blocks prototype/control and repository internals", () => {
  for (const value of [
    "C:/tmp/.git/data",
    "C:/tmp/node_modules/cache",
    "C:/tmp\u0000/cache",
    "relative/path",
  ])
    assert.throws(() => validateWorkspaceRoot(value));
});
test("workspace accepts selectable absolute drive and network paths", () => {
  assert.equal(validateWorkspaceRoot("D:/AI/Abliterater"), "D:/AI/Abliterater");
  assert.equal(validateWorkspaceRoot("//nas/models/Abliterater"), "//nas/models/Abliterater");
});

test("workspace rejects Windows device paths, streams and ambiguous directory names", () => {
  for (const value of [
    "//?/C:/data",
    "//./C:/data",
    "C:/data:stream",
    "C:/data/NUL",
    "C:/data/COM1.txt",
    "C:/data/trailing.",
    "C:/data/trailing ",
    "//nas",
    "//nas/share",
    "C:/",
    "/",
    "C:/repos/project/data",
  ])
    assert.throws(() => validateWorkspaceRoot(value), value);
});

test("macOS default requires HOME even when an unrelated XDG variable exists", () => {
  assert.throws(
    () => defaultWorkspaceRoot("darwin", { XDG_DATA_HOME: "/data" }),
    new RegExp(WORKSPACE_ERROR.home),
  );
});
