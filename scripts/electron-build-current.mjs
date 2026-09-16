import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const script =
  process.platform === "win32"
    ? "build:win"
    : process.platform === "darwin"
      ? "build:mac"
      : "build:linux";

const electronDir = join(dirname(fileURLToPath(import.meta.url)), "..", "electron");
const env = { ...process.env };
if (!env.CSC_LINK && !env.WIN_CSC_LINK) {
  env.CSC_IDENTITY_AUTO_DISCOVERY = "false";
}
const result = spawnSync("npm", ["run", script], {
  cwd: electronDir,
  stdio: "inherit",
  shell: true,
  env,
});
process.exit(result.status ?? 1);
