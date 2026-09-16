import test from "node:test";
import assert from "node:assert/strict";
import { collectHardwareProfile } from "./hardware-profile.mjs";

function runner(fixtures) {
  return async (command, args) => {
    const key = `${command} ${args.join(" ")}`;
    const value = fixtures[key];
    if (value instanceof Error) throw value;
    if (value === undefined) throw new Error(`unexpected command ${key}`);
    return value;
  };
}

test("hardware profile normalizes Windows CPU, memory, disks and NVIDIA GPU", async () => {
  const profile = await collectHardwareProfile({
    platform: "win32",
    cpus: [
      { model: "AMD Ryzen 9", speed: 4200 },
      { model: "AMD Ryzen 9", speed: 4200 },
    ],
    totalmem: 64 * 1024 ** 3,
    homedir: "C:/Users/Demo",
    run: runner({
      "nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader,nounits":
        "NVIDIA GeForce RTX 4090, 24564, 560.00\n",
      "docker version --format {{.Server.Version}}": "28.3.3\n",
      "wsl.exe --status": "Default Distribution: Ubuntu\n",
    }),
    disk: async () => ({ free: 200 * 1024 ** 3, size: 1000 * 1024 ** 3 }),
  });
  assert.equal(profile.cpu.logicalCores, 2);
  assert.equal(profile.memory.totalBytes, 64 * 1024 ** 3);
  assert.deepEqual(profile.gpus[0], {
    vendor: "nvidia",
    name: "NVIDIA GeForce RTX 4090",
    memoryBytes: 24564 * 1024 ** 2,
    driver: "560.00",
    memoryEvidence: "observed",
  });
  assert.equal(profile.capabilities.cuda.available, false);
  assert.equal(profile.capabilities.cuda.driverDetected, true);
  assert.equal(profile.capabilities.docker.available, true);
  assert.equal(profile.capabilities.wsl.available, true);
  assert.equal(JSON.stringify(profile).includes("Demo"), false);
});

test("hardware profile reports unavailable probes without inventing VRAM", async () => {
  const profile = await collectHardwareProfile({
    platform: "linux",
    cpus: [{ model: "CPU", speed: 1 }],
    totalmem: 8,
    run: async () => {
      throw new Error("not found /home/private");
    },
    disk: async () => ({ free: 4, size: 8 }),
    homedir: "/home/private",
  });
  assert.deepEqual(profile.gpus, []);
  assert.equal(profile.capabilities.docker.available, false);
  assert.equal(profile.capabilities.cuda.available, false);
  assert.equal(JSON.stringify(profile).includes("/home/private"), false);
});
