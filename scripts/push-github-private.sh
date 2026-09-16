#!/usr/bin/env sh
# Twin of push-github-private.ps1 — delegates to the node implementation.
set -eu
cd "$(dirname "$0")/.."
exec node scripts/push-github-private.mjs "$@"
