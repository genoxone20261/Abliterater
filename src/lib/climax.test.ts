import assert from "node:assert/strict";
import { test } from "node:test";
import { parseClimaxIndex, parseClimaxModelPage, scoreClimaxRecords } from "./climax.ts";

const INDEX = `
<a href="/models/aion-3-0/">Aion 3.0</a>
<a href="/models/cydonia-24b-v4-1/">Cydonia</a>
<a href="/models/flux-2-pro/">FLUX.2 Pro</a>
<a href="/models/venice-sd35/">Venice SD3.5</a>
<a href="/models/sdxl-turbo/">SDXL Turbo</a>
<a href="/models/stable-diffusion-3/">SD3</a>
<a href="/archive/v02/">old</a>
`;

const PAGE = `
<h1>Aion 3.0</h1>
Canonical ID
aion-labs/aion-3.0
Creator
AionLabs
Provider route
openrouter
Modalities
text
Context
131,072 tokens
7 full / 7 lawful, 0 softened, 0 refused, 0 failed
Avg latency 13475ms
estimated cost $0.0346.
`;

test("parseClimaxIndex keeps text slugs and drops image/video routes", () => {
  assert.deepEqual(parseClimaxIndex(INDEX), ["aion-3-0", "cydonia-24b-v4-1"]);
});

test("parseClimaxModelPage reads published case counts", () => {
  const row = parseClimaxModelPage(PAGE, "aion-3-0");
  assert.ok(row);
  assert.equal(row.canonical, "aion-labs/aion-3.0");
  assert.equal(row.provider, "openrouter");
  assert.equal(row.full, 7);
  assert.equal(row.lawful, 7);
  assert.equal(row.ifPct, 100);
  assert.equal(row.quality, 100);
  assert.equal(row.latencyMs, 13475);
  assert.equal(row.costUsd, 0.0346);
});

test("scoreClimaxRecords uses 50/30/10/10 weights and does not invent ranks for excluded rows", () => {
  const cheap = parseClimaxModelPage(
    PAGE.replace("13475", "3000").replace("0.0346", "0.001"),
    "fast",
  )!;
  cheap.canonical = "fast/model";
  const slow = parseClimaxModelPage(PAGE, "aion-3-0")!;
  const excluded = {
    ...slow,
    slug: "timeout",
    excluded: true,
    ifPct: null,
    quality: null,
    lawful: 0,
  };
  const ranked = scoreClimaxRecords([slow, cheap, excluded]);
  assert.equal(ranked.find((r) => r.slug === "fast")?.rank, 1);
  assert.equal(ranked.find((r) => r.slug === "aion-3-0")?.rank, 2);
  assert.equal(ranked.find((r) => r.slug === "timeout")?.rank, null);
  const top = ranked.find((r) => r.rank === 1)!;
  assert.ok(top.composite != null && top.composite > 90);
});
