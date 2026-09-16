export const CRED_ERROR = {
  provider: "CRED_PROVIDER",
  token: "CRED_TOKEN",
} as const;

const slots = new Map<string, string>();
const listeners = new Set<() => void>();

function emit(): void {
  for (const fn of listeners) fn();
}

export function subscribeApiKeyMemory(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getApiKeyMemory(provider: string): string {
  return slots.get(provider) ?? "";
}

export function setApiKeyMemory(provider: string, token: string): void {
  const id = provider.trim();
  if (!id) throw new Error(CRED_ERROR.provider);
  if (!token.trim() || token.length > 4096 || /[\r\n]/.test(token)) throw new Error(CRED_ERROR.token);
  slots.set(id, token);
  emit();
}

export function clearApiKeyMemory(provider?: string): void {
  if (provider) slots.delete(provider);
  else slots.clear();
  emit();
}
