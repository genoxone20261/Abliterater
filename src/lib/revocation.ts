const revoked = new Set<string>();

export function revokeSourceId(id: string): void {
  const key = id.trim();
  if (key) revoked.add(key);
}

export function isRevokedSourceId(id: string): boolean {
  return revoked.has(id);
}

export function filterRevokedSources<T extends { id: string }>(rows: T[]): T[] {
  return rows.filter((row) => !revoked.has(row.id));
}

export function clearRevokedSourceIds(): void {
  revoked.clear();
}
