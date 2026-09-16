import { describe, it } from "node:test";
import assert from "node:assert/strict";

// localStorage shim for Node
class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
  clear() {
    this.m.clear();
  }
}
(globalThis as { localStorage?: unknown }).localStorage = new MemoryStorage();

const {
  recordCall,
  listCalls,
  clearLog,
  exportLog,
  exportSupportBundle,
  timed,
  redactLogText,
  loggingAvailable,
} = await import("./provider-log.ts");

describe("provider-log: record/list/clear/export", () => {
  it("records a call and reads it back", () => {
    clearLog();
    const row = recordCall({
      provider: "hf",
      endpoint: "https://huggingface.co/api/models",
      status: "ok",
      durationMs: 120,
    });
    assert.ok(row.id);
    const rows = listCalls(10);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].id, row.id);
    assert.equal(rows[0].provider, "hf");
  });

  it("caps at MAX_ROWS (200) and is newest-first", () => {
    clearLog();
    for (let i = 0; i < 250; i++) {
      recordCall({
        provider: "api",
        endpoint: "/v1/chat/completions",
        status: "ok",
        durationMs: i,
      });
    }
    const rows = listCalls(500);
    assert.equal(rows.length, 200);
    assert.equal(rows[0].durationMs, 249);
    assert.equal(rows[199].durationMs, 50);
  });

  it("clearLog wipes the storage", () => {
    recordCall({
      provider: "ollama",
      endpoint: "/api/tags",
      status: "ok",
      durationMs: 5,
    });
    clearLog();
    assert.equal(listCalls(10).length, 0);
  });

  it("exportLog returns valid JSON", () => {
    clearLog();
    recordCall({
      provider: "azure",
      endpoint: "ml/job",
      status: "err",
      durationMs: 1,
      note: "quota",
    });
    const json = exportLog();
    const parsed = JSON.parse(json);
    assert.ok(Array.isArray(parsed));
    assert.equal(parsed[0].note, "quota");
  });

  it("support bundle is marked redacted and does not keep raw secrets", () => {
    recordCall({
      provider: "hf",
      endpoint: "https://example/v1",
      status: "err",
      durationMs: 1,
      note: "Bearer secret-value",
    });
    const bundle = exportSupportBundle();
    assert.match(bundle, /"redacted": true/);
    assert.match(bundle, /"secrets": false/);
    assert.doesNotMatch(bundle, /secret-value/);
  });

  it("redacts bearer tokens and key-like details", () => {
    assert.doesNotMatch(redactLogText("Bearer secret-value"), /secret-value/);
    assert.doesNotMatch(redactLogText("api_key=secret-value"), /secret-value/);
    assert.doesNotMatch(redactLogText("token: secret-value"), /secret-value/);
    assert.doesNotMatch(redactLogText("https://user:pass@example.com/v1"), /user:pass/);
  });

  it("reports unavailable storage without breaking model calls", () => {
    const original = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error("denied");
    };
    assert.equal(loggingAvailable(), false);
    assert.doesNotThrow(() =>
      recordCall({ provider: "api", endpoint: "x", status: "ok", durationMs: 1 }),
    );
    localStorage.setItem = original;
  });
});

describe("provider-log: timed wrapper", () => {
  it("records ok status on success", async () => {
    clearLog();
    const out = await timed("hf", "x", async () => "result");
    assert.equal(out, "result");
    const rows = listCalls(10);
    assert.equal(rows[0].status, "ok");
    assert.equal(rows[0].endpoint, "x");
  });

  it("records err status on throw and re-throws", async () => {
    clearLog();
    await assert.rejects(
      () =>
        timed("api", "y", async () => {
          throw new Error("boom");
        }),
      /boom/,
    );
    const rows = listCalls(10);
    assert.equal(rows[0].status, "err");
    assert.equal(rows[0].note, "boom");
  });
});
