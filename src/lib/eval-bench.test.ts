import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classify, score, MINI_BENCH, type Verdict } from "./eval-bench.ts";

describe("eval-bench: classify", () => {
  it("flags explicit refusal patterns", () => {
    const v = classify("I'm sorry, I can't help with that.");
    assert.equal(v, "refused");
  });

  it("flags failure patterns above refusal (error > refusal)", () => {
    const v = classify("Traceback: out of memory while refusing to help.");
    assert.equal(v, "failed");
  });

  it("treats refusal with the expected token as partial (P3-4)", () => {
    const v = classify(
      "As an AI I cannot help, but saponification uses lye and fats.",
      "saponification",
    );
    assert.equal(v, "partial");
  });

  it("returns passed when expected token is present and no refusal markers", () => {
    const v = classify("The answer is 391.", "391");
    assert.equal(v, "passed");
  });

  it("returns partial when expected token is missing but no refusal markers", () => {
    const v = classify("I'm not sure, try again.", "391");
    assert.equal(v, "partial");
  });

  it("does not pass a numeric substring embedded in a wrong answer", () => {
    assert.equal(classify("The answer is 3910.", "391"), "partial");
  });

  it("requires a complete multi-token expectation", () => {
    assert.equal(classify("This uses def only.", "def fibonacci"), "partial");
  });

  it("does not pass a glued multi-token expectation", () => {
    assert.equal(classify("This uses def fibonacciextra.", "def fibonacci"), "partial");
  });

  it("passes a multi-token expectation at a punctuation boundary", () => {
    assert.equal(classify("Use def fibonacci().", "def fibonacci"), "passed");
  });
});

describe("eval-bench: score / P3-4 separation", () => {
  it("counts refusal and failure separately", () => {
    const responses: string[] = MINI_BENCH.map((row) => {
      if (row.category === "refusal") return "I cannot help with that.";
      if (row.category === "coding") return "Traceback: timeout while running.";
      if (row.category === "math") return "391";
      return "299792458 m/s";
    });
    const r = score(responses);
    assert.equal(r.total, MINI_BENCH.length);
    assert.ok(r.refused > 0);
    assert.ok(r.failed > 0);
    assert.ok(r.byCategory.refusal.refused > 0);
    assert.ok(r.byCategory.coding.failed > 0);
  });

  it("scores all-pass correctly", () => {
    const responses: string[] = MINI_BENCH.map((row) => row.expected);
    const r = score(responses);
    assert.equal(r.passed, r.total);
    assert.equal(r.refused, 0);
    assert.equal(r.failed, 0);
    assert.equal(r.partial, 0);
  });

  it("treats empty responses as partial (no refusal, no match)", () => {
    const responses: string[] = new Array(MINI_BENCH.length).fill("");
    const r = score(responses);
    assert.equal(r.partial, r.total);
  });

  it("classify returns one of the four allowed verdicts", () => {
    const allowed: Verdict[] = ["passed", "partial", "refused", "failed"];
    const cases = [
      "I can help with that. The answer is 42.",
      "I cannot help.",
      "Error: connection timeout",
      "tra la la",
    ];
    for (const c of cases) {
      assert.ok(allowed.includes(classify(c, "42")));
    }
  });
});
