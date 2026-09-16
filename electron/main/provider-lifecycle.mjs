const supported = new Set(["runpod", "lambda", "vast"]);

export const LIFECYCLE_ERROR = {
  unsupported: "LIFECYCLE_UNSUPPORTED",
  ack: "LIFECYCLE_ACK_REQUIRED",
  budget: "LIFECYCLE_INVALID_BUDGET",
  exceeded: "LIFECYCLE_BUDGET_EXCEEDED",
  live: "LIFECYCLE_LIVE_UNIMPLEMENTED",
  requestId: "LIFECYCLE_INVALID_REQUEST_ID",
};

/** Contract only: no resource is created or claimed to be cost-enforced. */
export function validateCreateRequest(request) {
  if (!request || !supported.has(request.provider)) throw new Error(LIFECYCLE_ERROR.unsupported);
  const b = request.budget;
  if (!b || b.acknowledged !== true) throw new Error(LIFECYCLE_ERROR.ack);
  if (
    ![b.maxUsd, b.maxMinutes, b.estimatedUsdPerHour].every(
      (v) => typeof v === "number" && Number.isFinite(v) && v > 0,
    )
  )
    throw new Error(LIFECYCLE_ERROR.budget);
  if (b.maxMinutes > 1440 || (b.estimatedUsdPerHour * b.maxMinutes) / 60 > b.maxUsd)
    throw new Error(LIFECYCLE_ERROR.exceeded);
  return b;
}

export function lifecyclePlan(request) {
  const budget = validateCreateRequest(request);
  const execute = request.dryRun === false;
  if (typeof request.requestId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(request.requestId))
    throw new Error(LIFECYCLE_ERROR.requestId);
  return {
    provider: request.provider,
    requestId: request.requestId,
    mode: execute ? "execute-ready" : "dry-run",
    maxMinutes: budget.maxMinutes,
    maxUsd: budget.maxUsd,
    idleMinutes: Math.min(30, budget.maxMinutes),
    ttlMinutes: budget.maxMinutes,
    idleIndependentOfProvider: true,
    estimatedComputeUsd: (budget.estimatedUsdPerHour * budget.maxMinutes) / 60,
    cleanupRequired: true,
    costEnforced: false,
    executable: execute,
    evidence: execute ? "user-key-create" : "contract-only",
  };
}
