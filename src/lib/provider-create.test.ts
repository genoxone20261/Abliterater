import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CREATE_ERROR,
  extractCreatedId,
  planUserCreate,
  sanitizeCreateBody,
} from "./provider-create.ts";
import { BUDGET_ERROR } from "./provider-capabilities.ts";

test("user-key create plan requires budget ack and create-capable provider", () => {
  assert.throws(
    () =>
      planUserCreate({
        provider: "modal",
        requestId: "r-1",
        budget: { acknowledged: true, maxUsd: 5, maxMinutes: 30, estimatedUsdPerHour: 1 },
      }),
    new RegExp(CREATE_ERROR.unsupported),
  );
  assert.throws(
    () =>
      planUserCreate({
        provider: "runpod",
        requestId: "r-1",
        budget: { acknowledged: false, maxUsd: 5, maxMinutes: 30, estimatedUsdPerHour: 1 },
      }),
    new RegExp(BUDGET_ERROR.ack),
  );
  const plan = planUserCreate({
    provider: "runpod",
    requestId: "r-1",
    budget: { acknowledged: true, maxUsd: 5, maxMinutes: 30, estimatedUsdPerHour: 1 },
    dryRun: false,
  });
  assert.equal(plan.mode, "execute-ready");
  assert.equal(plan.costEnforced, false);
});

test("create body extra keys fail closed", () => {
  assert.throws(
    () => sanitizeCreateBody("runpod", { imageName: "x", extra: 1 }),
    new RegExp(CREATE_ERROR.fields),
  );
  assert.throws(() => sanitizeCreateBody("runpod", {}), new RegExp(CREATE_ERROR.required));
  assert.deepEqual(sanitizeCreateBody("runpod", { imageName: "runpod/pytorch" }), {
    imageName: "runpod/pytorch",
  });
});

test("created id is read back from provider JSON", () => {
  assert.equal(extractCreatedId("runpod", { id: "pod-1" }), "pod-1");
  assert.equal(extractCreatedId("lambda", { data: { instance_ids: ["i-1"] } }), "i-1");
  assert.equal(extractCreatedId("vast", { new_contract: "99" }), "99");
});
