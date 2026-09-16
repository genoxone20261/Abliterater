import { cpus, totalmem } from "node:os";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { statfs } from "node:fs/promises";

const exec = promisify(execFile);
async function defaultRun(command, args) {
  const { stdout } = await exec(command, args, {
    timeout: 5000,
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });
  return stdout;
}
function availability(value, version = null) {
  return { available: value, version, evidence: "observed" };
}
async function probe(run, command, args) {
  try {
    return String(await run(command, args)).trim();
  } catch {
    return "";
  }
}

/** Bounded, read-only probes. No environment dump, usernames or filenames are returned. */
export async function collectHardwareProfile(options = {}) {
  const platform = options.platform || process.platform;
  const cpuRows = options.cpus || cpus();
  const run = options.run || defaultRun;
  const memory = options.totalmem ?? totalmem();
  const diskInfo = await (
    options.disk ||
    (async () => {
      const value = await statfs(options.homedir || process.cwd());
      return {
        free: Number(value.bavail) * Number(value.bsize),
        size: Number(value.blocks) * Number(value.bsize),
      };
    })
  )();
  const nvidia = await probe(run, "nvidia-smi", [
    "--query-gpu=name,memory.total,driver_version",
    "--format=csv,noheader,nounits",
  ]);
  const gpus = nvidia
    ? nvidia
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
          const [name, mib, driver] = line.split(",").map((x) => x.trim());
          const memoryBytes = Number(mib) * 1024 ** 2;
          return {
            vendor: "nvidia",
            name: name.slice(0, 160),
            memoryBytes: Number.isFinite(memoryBytes) && memoryBytes > 0 ? memoryBytes : null,
            driver: (driver || "unknown").slice(0, 80),
            memoryEvidence:
              Number.isFinite(memoryBytes) && memoryBytes > 0 ? "observed" : "unknown",
          };
        })
    : [];
  const docker = await probe(run, "docker", ["version", "--format", "{{.Server.Version}}"]);
  const wsl = platform === "win32" ? await probe(run, "wsl.exe", ["--status"]) : "";
  const rocm = platform !== "win32" ? await probe(run, "rocminfo", ["--version"]) : "";
  return {
    observedAt: new Date().toISOString(),
    platform,
    cpu: {
      model: String(cpuRows[0]?.model || "unknown").slice(0, 160),
      logicalCores: cpuRows.length,
      evidence: "observed",
    },
    memory: { totalBytes: memory, evidence: "observed" },
    disk: { freeBytes: diskInfo.free, totalBytes: diskInfo.size, evidence: "observed" },
    gpus,
    capabilities: {
      cuda: {
        available: false,
        version: null,
        evidence: "unverified",
        driverDetected: gpus.length > 0,
      },
      rocm: availability(Boolean(rocm), rocm.split(/\r?\n/)[0]?.slice(0, 80) || null),
      metal: {
        available: false,
        version: null,
        evidence: platform === "darwin" ? "unverified" : "not-applicable",
      },
      docker: availability(Boolean(docker), docker.slice(0, 80) || null),
      wsl: availability(Boolean(wsl)),
    },
  };
}
