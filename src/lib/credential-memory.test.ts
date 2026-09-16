import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CRED_ERROR,
  clearApiKeyMemory,
  getApiKeyMemory,
  setApiKeyMemory,
} from "./credential-memory.ts";

test("API key memory is per-provider, memory-only, and rejects control chars", () => {
  clearApiKeyMemory();
  setApiKeyMemory("runpod", "rk-live");
  assert.equal(getApiKeyMemory("runpod"), "rk-live");
  assert.equal(getApiKeyMemory("lambda"), "");
  assert.throws(() => setApiKeyMemory("runpod", "bad\nkey"), new RegExp(CRED_ERROR.token));
  assert.throws(() => setApiKeyMemory("", "rk-live"), new RegExp(CRED_ERROR.provider));
  clearApiKeyMemory("runpod");
  assert.equal(getApiKeyMemory("runpod"), "");
  clearApiKeyMemory();
});
