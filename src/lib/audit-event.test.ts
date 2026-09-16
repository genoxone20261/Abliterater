import assert from "node:assert/strict";
import { test } from "node:test";
import { AUDIT_ERROR, makeAuditEvent } from "./audit-event.ts";

test("audit events redact secrets and keep a correlation id", () => {
  const event = makeAuditEvent({
    action: "provider.list",
    correlationId: "corr-1",
    provider: "runpod",
    outcome: "err",
    detail: "Bearer secret-value failed",
  });
  assert.equal(event.correlationId, "corr-1");
  assert.doesNotMatch(event.detail, /secret-value/);
  assert.match(event.detail, /REDACTED/);
});

test("audit events reject malformed action names", () => {
  assert.throws(
    () => makeAuditEvent({ action: "list jobs", outcome: "ok", detail: "x" }),
    new RegExp(AUDIT_ERROR.action),
  );
});
