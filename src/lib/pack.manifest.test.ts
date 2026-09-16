import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPack } from "./pack.ts";
import { DEFAULT_STATE } from "./studio.ts";

test("non-Azure packs omit Azure deployment files", () => {
  const pack = buildPack({ ...DEFAULT_STATE, compute: "local-cuda" });
  assert.equal(pack.files["az-startup.sh"], "");
  assert.equal(pack.files["az-startup.ps1"], "");
  assert.equal(pack.files["azure-job.yml"], "");
});
test("job manifest records selected sources without claiming verified provenance", () => {
  const state = {
    ...DEFAULT_STATE,
    modelSource: "hf" as const,
    hfRepo: "org/model",
    hfRevision: "a".repeat(40),
    storeData: "hf",
    storeDataUri: "org/data",
  };
  const job = JSON.parse(buildPack(state).json);
  assert.equal(job.lineage.schemaVersion, 1);
  assert.equal(job.lineage.model.id, "org/model");
  assert.equal(job.lineage.model.revision, "a".repeat(40));
  assert.equal(job.lineage.model.immutable, true);
  assert.equal(job.lineage.dataset.id, "org/data");
  assert.equal(job.lineage.dataset.license, "unknown");
  assert.deepEqual(
    job.lineage.methods.map((m: { id: string }) => m.id),
    state.methods,
  );
  assert.equal(job.lineage.evidence, "configuration-only");
});

test("dataset metadata remains explicitly unverified when only a free-form URI is available", () => {
  const job = JSON.parse(
    buildPack({ ...DEFAULT_STATE, storeData: "hf", storeDataUri: "org/data" }).json,
  );
  assert.deepEqual(job.lineage.dataset, {
    source: "hf",
    id: "org/data",
    revision: null,
    immutable: false,
    license: "unknown",
    checksum: null,
    checksumVerified: false,
  });
  assert.match(job.lineage.warnings.join(" "), /revision\/checksum/);
});

test("dataset lineage preserves selected immutable revision and license", () => {
  const state = {
    ...DEFAULT_STATE,
    storeData: "hf",
    storeDataUri: "org/data",
    datasetRevision: "b".repeat(40),
    datasetLicense: "apache-2.0",
    datasetChecksum: "c".repeat(64),
  };
  const d = JSON.parse(buildPack(state).json).lineage.dataset;
  assert.equal(d.revision, state.datasetRevision);
  assert.equal(d.license, "apache-2.0");
  assert.equal(d.checksum, state.datasetChecksum);
  assert.equal(d.immutable, true);
  assert.equal(d.checksumVerified, false);
});

test("Azure ML is catalog-only and does not emit az CLI files", () => {
  const pack = buildPack({ ...DEFAULT_STATE, compute: "azure-ml" });
  assert.equal(pack.files["az-startup.sh"], "");
  assert.equal(pack.files["az-startup.ps1"], "");
  assert.equal(pack.files["azure-job.yml"], "");
  assert.match(pack.cloud, /launch hint only/);
});
