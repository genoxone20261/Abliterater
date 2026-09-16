import { mkdir, open, readFile, realpath, rename, rm, stat, statfs } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";

function contains(root, candidate) {
  const rel = relative(root, candidate);
  return rel === "" || (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`));
}

/** 사용자 선택 경로만 검사한다. 기존 데이터의 이동·삭제는 수행하지 않는다. */
const WS = {
  invalid: "WS_INVALID",
  absolute: "WS_ABSOLUTE",
  repo: "WS_REPO",
  dir: "WS_DIR",
  settings: "WS_SETTINGS",
  busy: "WS_BUSY",
};

export function createWorkspaceStorage({ settingsDir, defaultRoot, repositoryRoot }) {
  const settingsFile = join(settingsDir, "workspace.json");
  let busy = false;
  async function inspect(candidate, create = false) {
    if (
      typeof candidate !== "string" ||
      !isAbsolute(candidate) ||
      candidate.length > 4096 ||
      Array.from(candidate).some((char) => char.charCodeAt(0) < 32) ||
      candidate.split(/[\\/]/).includes("..")
    )
      throw new Error(WS.invalid);
    if (
      /^(?:\\\\|\/\/)[?.][\\/]/.test(candidate) ||
      candidate
        .split(/[\\/]/)
        .some(
          (part, index) =>
            /[. ]$/.test(part) ||
            /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part) ||
            (part.includes(":") && !(index === 0 && /^[a-z]:$/i.test(part))),
        )
    )
      throw new Error(WS.invalid);
    const lexical = resolve(candidate);
    if (resolve(lexical, "..") === lexical) throw new Error(WS.absolute);
    const repository = await realpath(repositoryRoot);
    if (contains(repository, lexical) || contains(lexical, repository)) throw new Error(WS.repo);
    if (create) await mkdir(lexical, { recursive: true });
    const root = await realpath(lexical);
    if (
      contains(repository, root) ||
      contains(root, repository) ||
      root.split(/[\\/]/).some((part) => /^(?:\.git|node_modules)$/i.test(part))
    )
      throw new Error(WS.repo);
    if (!(await stat(root)).isDirectory()) throw new Error(WS.dir);
    const probe = join(root, `.abliterater-probe-${randomUUID()}`);
    const handle = await open(probe, "wx", 0o600);
    try {
      await handle.writeFile("probe");
      await handle.sync();
    } finally {
      await handle.close();
      await rm(probe, { force: true });
    }
    const disk = await statfs(root);
    return { root, freeBytes: Number(disk.bavail) * Number(disk.bsize), writable: true };
  }
  async function get() {
    let contents;
    try {
      contents = await readFile(settingsFile, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (contents === undefined) return inspect(defaultRoot, true);
    let value;
    try {
      value = JSON.parse(contents);
    } catch {
      throw new Error(WS.settings);
    }
    if (!value || value.version !== 1 || typeof value.root !== "string")
      throw new Error(WS.settings);
    return inspect(value.root);
  }
  async function select(candidate) {
    if (busy) throw new Error(WS.busy);
    busy = true;
    let temp;
    try {
      const state = await inspect(candidate);
      await mkdir(settingsDir, { recursive: true });
      temp = join(settingsDir, `.workspace-${randomUUID()}.tmp`);
      const handle = await open(temp, "wx", 0o600);
      try {
        await handle.writeFile(JSON.stringify({ version: 1, root: state.root }));
        await handle.sync();
      } finally {
        await handle.close();
      }
      await rename(temp, settingsFile);
      return state;
    } finally {
      busy = false;
      if (temp) await rm(temp, { force: true });
    }
  }
  return { get, select };
}
