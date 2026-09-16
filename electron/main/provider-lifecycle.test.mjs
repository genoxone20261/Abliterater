import test from "node:test";
import assert from "node:assert/strict";
import { validateCreateRequest, lifecyclePlan, LIFECYCLE_ERROR } from "./provider-lifecycle.mjs";

test("lifecycle requires explicit budget and supported capability", () => {
  assert.throws(
    () =>
      validateCreateRequest({
        provider: "runpod",
        budget: { acknowledged: false, maxUsd: 10, maxMinutes: 30, estimatedUsdPerHour: 1 },
      }),
    new RegExp(LIFECYCLE_ERROR.ack),
  );
  assert.throws(
    () =>
      validateCreateRequest({
        provider: "modal",
        budget: { acknowledged: true, maxUsd: 10, maxMinutes: 30, estimatedUsdPerHour: 1 },
      }),
    new RegExp(LIFECYCLE_ERROR.unsupported),
  );
});
test("lifecycle plan is dry-run by default and has cleanup deadline", () => {
  const plan = lifecyclePlan({
    provider: "runpod",
    requestId: "r-1",
    budget: { acknowledged: true, maxUsd: 5, maxMinutes: 30, estimatedUsdPerHour: 2 },
    dryRun: true,
  });
  assert.equal(plan.mode, "dry-run");
  assert.equal(plan.cleanupRequired, true);
  assert.equal(plan.maxMinutes, 30);
  assert.equal(plan.idleMinutes, 30);
  assert.equal(plan.ttlMinutes, 30);
  assert.equal(plan.idleIndependentOfProvider, true);
  assert.throws(
    () =>
      lifecyclePlan({
        provider: "runpod",
        requestId: "r-1",
        budget: { acknowledged: true, maxUsd: 1, maxMinutes: 30, estimatedUsdPerHour: 3 },
        dryRun: false,
      }),
    new RegExp(LIFECYCLE_ERROR.exceeded),
  );
  const live = lifecyclePlan({
    provider: "vast",
    requestId: "r-2",
    budget: { acknowledged: true, maxUsd: 5, maxMinutes: 30, estimatedUsdPerHour: 2 },
    dryRun: false,
  });
  assert.equal(live.mode, "execute-ready");
  assert.equal(live.executable, true);
  assert.equal(live.evidence, "user-key-create");
});
