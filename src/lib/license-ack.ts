export const LICENSE_ACK_ERROR = { missing: "LICENSE_ACK_MISSING" } as const;

/** Analog gate: unknown/unchecked licenses cannot be treated as accepted. */
export function requireLicenseAck(acknowledged: boolean, license: string): void {
  if (
    !acknowledged ||
    !license.trim() ||
    license === "LICENSE_UNCHECKED" ||
    license === "unknown"
  ) {
    throw new Error(LICENSE_ACK_ERROR.missing);
  }
}
