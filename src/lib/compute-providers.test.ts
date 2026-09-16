import assert from "node:assert/strict";
import test from "node:test";
import {
  COMPUTE_PROVIDERS,
  computeProviderById,
  computeProviderIds,
  computeProvidersByKind,
  byId,
  byKind,
  ids,
} from "./compute-providers.ts";

const REQUIRED = [
  "runpod",
  "vast",
  "modal",
  "thunder-compute",
  "massed-compute",
  "shadeform",
  "lambda",
  "nebius",
  "naver-cloud",
  "kt-cloud",
  "aws-ec2",
  "gcp-gce",
  "azure-ml",
  "oracle-oci",
  "localhost-ollama",
  "localhost-lmstudio",
  "hf-jobs",
  "together",
  "fireworks",
  "baseten",
  "replicate",
  "saladcloud",
  "coreweave",
  "crusoe",
  "voltage-park",
  "paperspace",
  "samsung-sds",
  "kakao-cloud",
  "alibaba-egs",
  "tencent-gpu",
  "nvidia-nim",
  "dgx-cloud",
  "tensordock",
  "local-cuda",
  "local-rocm",
  "local-metal",
  "local-cpu",
  "ssh",
  // research 2026-09-11
  "jarvislabs",
  "oblivus",
  "prime-intellect",
  "cherry-servers",
  "latitude-sh",
  "hostkey",
  "seeweb",
  "contabo-gpu",
  "gcore-gpu",
  "together-compute",
  "deep-infra-gpu",
  "hyperbolic",
  "spheron",
  "digitalocean-gpu",
  "exoscale-gpu",
  "hot-aisle",
  "sf-compute",
  "novita",
  "clore-ai",
  "fireworks-training",
  "local-cpu",
  "azure-vm",
  "aws-sagemaker",
  "gcp-vertex",
  "colab",
  "lightning",
];

test("required compute provider ids present", () => {
  const ids = new Set(computeProviderIds);
  for (const id of REQUIRED) {
    assert.ok(ids.has(id), `missing id: ${id}`);
  }
});

test("compute provider ids are unique", () => {
  const ids = COMPUTE_PROVIDERS.map((p) => p.id);
  assert.equal(ids.length, new Set(ids).size);
});

test("tensordock is degraded", () => {
  const t = computeProviderById("tensordock");
  assert.ok(t);
  assert.equal(t.status, "degraded");
});

test("azure-ml present and not default-only", () => {
  const a = computeProviderById("azure-ml");
  assert.ok(a);
  assert.equal(a.status, "catalog");
  assert.equal(a.kind, "iaas");
  // peers exist
  assert.ok(computeProviderById("aws-ec2"));
  assert.ok(computeProviderById("gcp-gce"));
  assert.ok(computeProviderById("oracle-oci"));
  assert.notEqual(COMPUTE_PROVIDERS[0]?.id, "azure-ml");
});

test("vast alias note", () => {
  const v = computeProviderById("vast");
  assert.ok(v);
  assert.equal(v.status, "active");
  assert.equal(v.aliasOf, "vastai");
});

test("runpod and lambda active", () => {
  assert.equal(computeProviderById("runpod")?.status, "active");
  assert.equal(computeProviderById("lambda")?.status, "active");
});

test("locals active", () => {
  for (const id of [
    "local-cuda",
    "local-rocm",
    "local-metal",
    "local-cpu",
    "localhost-ollama",
    "localhost-lmstudio",
    "ssh",
  ]) {
    assert.equal(computeProviderById(id)?.status, "active", id);
  }
});

test("computeProvidersByKind filters", () => {
  const locals = computeProvidersByKind("local");
  assert.ok(locals.length >= 3);
  assert.ok(locals.every((p) => p.kind === "local"));
});

test("byId / byKind / ids aliases", () => {
  assert.equal(byId("runpod")?.id, "runpod");
  assert.equal(byId("vastai")?.id, "vast");
  assert.ok(byKind("local").every((p) => p.kind === "local"));
  assert.deepEqual([...ids()], [...computeProviderIds]);
});

test("local-cpu and existing studio ids present", () => {
  for (const id of ["local-cpu", "azure-vm", "aws-sagemaker", "gcp-vertex", "colab", "lightning"]) {
    assert.ok(byId(id), id);
  }
});
