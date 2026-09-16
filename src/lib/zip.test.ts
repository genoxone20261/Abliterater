import { test } from "node:test";
import assert from "node:assert/strict";
import { validateZipEntries, zipUtf8Files, ZIP_ERROR } from "./zip.ts";

test("zip rejects unsafe and duplicate paths", () => {
  assert.throws(() => zipUtf8Files([{ name: "../secret", body: "x" }]), new RegExp(ZIP_ERROR.path));
  assert.throws(
    () => zipUtf8Files([{ name: "/etc/passwd", body: "x" }]),
    new RegExp(ZIP_ERROR.path),
  );
  assert.throws(
    () => zipUtf8Files([{ name: "C:/Windows/secret", body: "x" }]),
    new RegExp(ZIP_ERROR.path),
  );
  assert.throws(
    () => zipUtf8Files([{ name: "C:\\Windows\\secret", body: "x" }]),
    new RegExp(ZIP_ERROR.path),
  );
  assert.throws(
    () => zipUtf8Files([{ name: "//server/share", body: "x" }]),
    new RegExp(ZIP_ERROR.path),
  );
  assert.throws(
    () => zipUtf8Files([{ name: "ok//nested", body: "x" }]),
    new RegExp(ZIP_ERROR.path),
  );
  assert.throws(
    () =>
      zipUtf8Files([
        { name: "a", body: "x" },
        { name: "a", body: "y" },
      ]),
    new RegExp(ZIP_ERROR.dup),
  );
});
test("zip rejects classic ZIP count and name overflows", () => {
  const entry = { name: "a", body: "" };
  assert.throws(() => zipUtf8Files(new Array(65536).fill(entry)), new RegExp(ZIP_ERROR.count));
  assert.throws(
    () => zipUtf8Files([{ name: "한".repeat(22000), body: "" }]),
    new RegExp(ZIP_ERROR.name),
  );
});
test("zip writes UTF-8 names and payload", async () => {
  const bytes = new Uint8Array(
    await zipUtf8Files([{ name: "보고서.txt", body: "안녕" }]).arrayBuffer(),
  );
  assert.equal(new DataView(bytes.buffer).getUint32(0, true), 0x04034b50);
  assert.ok(new TextDecoder().decode(bytes).includes("보고서.txt"));
});

test("zip validator is independently callable before download", () => {
  assert.doesNotThrow(() => validateZipEntries([{ name: "ok/file.txt", body: "x" }]));
});

test("zip rejects oversized entries", () => {
  const huge = "x".repeat(8 * 1024 * 1024 + 1);
  assert.throws(() => zipUtf8Files([{ name: "big.txt", body: huge }]), new RegExp(ZIP_ERROR.entry));
});

test("python zipfile roundtrip reads UTF-8 payload", async () => {
  const { mkdtempSync, writeFileSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { spawnSync } = await import("node:child_process");
  const dir = mkdtempSync(join(tmpdir(), "ablit-zip-"));
  const zipPath = join(dir, "t.zip");
  try {
    writeFileSync(
      zipPath,
      Buffer.from(await zipUtf8Files([{ name: "보고서.txt", body: "안녕" }]).arrayBuffer()),
    );
    const py = spawnSync(
      "python",
      [
        "-c",
        "import zipfile, sys\nz=zipfile.ZipFile(sys.argv[1])\nassert z.namelist()==['보고서.txt']\nassert z.read('보고서.txt').decode('utf-8')=='안녕'\nprint('ok')",
        zipPath,
      ],
      { encoding: "utf8" },
    );
    assert.equal(py.status, 0, py.stderr || py.stdout);
    assert.match(py.stdout, /ok/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
