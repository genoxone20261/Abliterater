import { redactLogText } from "./provider-log.ts";

export const AUDIT_ERROR = {
  action: "AUDIT_ACTION",
  correlation: "AUDIT_CORRELATION",
} as const;

export type AuditOutcome = "ok" | "err";
export type AuditEvent = {
  id: string;
  ts: string;
  correlationId: string;
  action: string;
  provider?: string;
  outcome: AuditOutcome;
  detail: string;
};

export function makeAuditEvent(input: {
  action: string;
  correlationId?: string;
  provider?: string;
  outcome: AuditOutcome;
  detail: string;
}): AuditEvent {
  const action = input.action.trim();
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(action)) throw new Error(AUDIT_ERROR.action);
  const correlationId =
    input.correlationId ??
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `audit-${Date.now()}`);
  if (!/^[A-Za-z0-9._-]{1,128}$/.test(correlationId)) throw new Error(AUDIT_ERROR.correlation);
  return {
    id: `evt-${correlationId}`,
    ts: new Date().toISOString(),
    correlationId,
    action,
    provider: input.provider,
    outcome: input.outcome,
    detail: redactLogText(input.detail),
  };
}
