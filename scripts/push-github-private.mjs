#!/usr/bin/env node
/**
 * Cross-platform twin of push-github-private.ps1.
 * Run from repo root: node scripts/push-github-private.mjs
 * Requires: git, gh (logged in as the target owner).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
process.chdir(root);

const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a) => {
    const m = /^--([^=]+)=(.*)$/.exec(a);
    return m ? [[m[1], m[2]]] : [];
  }),
);
const Owner = args.owner || "YOUR_GITHUB_ORG";
const Repo = args.repo || "Abliterater";
const Branch = args.branch || "main";

function run(cmd, cmdArgs, opts = {}) {
  const r = spawnSync(cmd, cmdArgs, { encoding: "utf8", shell: true, ...opts });
  if (opts.check !== false && (r.status ?? 1) !== 0) {
    const err = (r.stderr || r.stdout || "").trim();
    throw new Error(err || `${cmd} ${cmdArgs.join(" ")} failed`);
  }
  return r;
}

function requireCmd(name) {
  const r = spawnSync(name, ["--version"], { encoding: "utf8", shell: true });
  if ((r.status ?? 1) !== 0) throw new Error(`${name} not found. Install it and retry.`);
}

requireCmd("git");
requireCmd("gh");

console.log("== GitHub account ==");
const active = run("gh", ["api", "user", "--jq", ".login"]).stdout.trim();
console.log(`Active gh user: ${active}`);
if (active !== Owner) {
  console.log(`\nTarget owner is '${Owner}' but gh is '${active}'.`);
  console.log(`Run:  gh auth switch -u ${Owner}`);
  console.log(`  or: gh auth login   (choose ${Owner} when prompted)`);
  throw new Error("Wrong GitHub account for this push.");
}

const remoteName = "origin";
const slug = `${Owner}/${Repo}`;
const remoteUrl = `https://github.com/${slug}.git`;

console.log("== Recoverable snapshot (no working-tree change) ==");
const stash = run("git", ["stash", "create", "pre-github-push"], { check: false });
const stashSha = (stash.stdout || "").trim();
if (stashSha) {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const backupRef = `refs/backup/pre-github-push-${stamp}`;
  run("git", ["update-ref", backupRef, stashSha]);
  console.log(`Backup ref: ${backupRef}`);
}

if (!existsSync(join(root, ".git"))) {
  console.log("== git init ==");
  run("git", ["init", "-b", Branch]);
}

console.log("== Stage (respects .gitignore; no node_modules) ==");
run("git", ["add", "-A"]);
const staged = run("git", ["diff", "--cached", "--stat"], { check: false }).stdout.trim();
console.log(staged || "Nothing to stage.");

const head = run("git", ["rev-parse", "HEAD"], { check: false });
if ((head.status ?? 1) !== 0) {
  console.log("== Initial commit ==");
  run("git", [
    "commit",
    "-m",
    "feat: Abliterated Korean workbench\n\nAzure CPU pack path, runners, presets/jobs, studio UI, pack assembly.",
  ]);
}

console.log("== Remote ==");
const existing = run("git", ["remote", "get-url", remoteName], { check: false }).stdout.trim();
if (existing && existing !== remoteUrl) {
  console.log(`Replacing remote ${remoteName} (${existing} -> ${remoteUrl})`);
  run("git", ["remote", "remove", remoteName]);
}
if ((run("git", ["remote", "get-url", remoteName], { check: false }).status ?? 1) !== 0) {
  run("git", ["remote", "add", remoteName, remoteUrl]);
}

console.log("== Create private repo if missing ==");
const view = run("gh", ["repo", "view", slug], { check: false });
if ((view.status ?? 1) !== 0) {
  run("gh", [
    "repo",
    "create",
    slug,
    "--private",
    "--description",
    "Korean UI workbench — uncensored/abliterated model packs",
  ]);
}

console.log("== Push ==");
run("git", ["push", "-u", remoteName, Branch]);
console.log(`\nDone: https://github.com/${slug}`);
