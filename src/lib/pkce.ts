import { createHash, randomBytes } from "node:crypto";

function b64url(buf: Buffer): string {
  return buf.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

/** Analog PKCE pair. Does not contact an authorization server. */
export function pkcePair(): { verifier: string; challenge: string; method: "S256" } {
  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge, method: "S256" };
}
