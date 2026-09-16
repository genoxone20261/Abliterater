import { createHmac, timingSafeEqual } from "node:crypto";

export const WEBHOOK_ERROR = { signature: "WEBHOOK_SIGNATURE", secret: "WEBHOOK_SECRET" } as const;

export function verifyWebhookSignature(payload: string, secret: string, header: string): boolean {
  if (!secret.trim()) throw new Error(WEBHOOK_ERROR.secret);
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const got = header.replace(/^sha256=/i, "").trim();
  if (!/^[0-9a-f]+$/i.test(got) || got.length !== expected.length)
    throw new Error(WEBHOOK_ERROR.signature);
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(got, "hex"));
}
