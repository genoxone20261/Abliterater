# Push Abliterater to a private GitHub repo (default: YOUR_GITHUB_ORG/Abliterater).
# Run from repo root:  powershell -ExecutionPolicy Bypass -File scripts/push-github-private.ps1
# Requires: Git, GitHub CLI (gh), logged in as the target account.

param(
  [string]$Owner = "YOUR_GITHUB_ORG",
  [string]$Repo = "Abliterater",
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

function Require-Cmd($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "$name not found. Install it and retry."
  }
}

Require-Cmd git
Require-Cmd gh

Write-Host "== GitHub account =="
$active = gh api user --jq .login
Write-Host "Active gh user: $active"
if ($active -ne $Owner) {
  Write-Host ""
  Write-Host "Target owner is '$Owner' but gh is '$active'."
  Write-Host "Run:  gh auth switch -u $Owner"
  Write-Host "  or: gh auth login   (choose $Owner when prompted)"
  throw "Wrong GitHub account for this push."
}

$remoteName = "origin"
$slug = "$Owner/$Repo"
$remoteUrl = "https://github.com/$slug.git"

Write-Host "== Recoverable snapshot (no working-tree change) =="
$stashSha = git stash create "pre-github-push"
if ($stashSha) {
  $backupRef = "refs/backup/pre-github-push-$(Get-Date -Format 'yyyyMMddHHmmss')"
  git update-ref $backupRef $stashSha
  Write-Host "Backup ref: $backupRef"
}

if (-not (Test-Path ".git")) {
  Write-Host "== git init =="
  git init -b $Branch
}

Write-Host "== Stage (respects .gitignore; no node_modules) =="
git add -A
$staged = git diff --cached --stat
if (-not $staged) {
  Write-Host "Nothing to stage."
} else {
  Write-Host $staged
}

$hasHead = $false
try {
  git rev-parse HEAD 2>$null | Out-Null
  $hasHead = $true
} catch {
  $hasHead = $false
}

if (-not $hasHead) {
  Write-Host "== Initial commit =="
  git commit -m @"
feat: Abliterated Korean workbench

Azure CPU pack path, runners, presets/jobs, studio UI, pack assembly.
"@
}

Write-Host "== Remote =="
$existing = git remote get-url $remoteName 2>$null
if ($existing -and $existing -ne $remoteUrl) {
  Write-Host "Replacing remote $remoteName ($existing -> $remoteUrl)"
  git remote remove $remoteName
}
if (-not (git remote get-url $remoteName 2>$null)) {
  git remote add $remoteName $remoteUrl
}

Write-Host "== Create private repo if missing =="
gh repo view $slug 2>$null
if ($LASTEXITCODE -ne 0) {
  gh repo create $slug --private --description "Korean UI workbench — uncensored/abliterated model packs (Azure CPU default)"
}

Write-Host "== Push =="
git push -u $remoteName $Branch

Write-Host ""
Write-Host "Done: https://github.com/$slug"
