import { useCallback, useEffect, useState } from "react";

export type Tone = "ok" | "warn" | "danger" | "info";

export type Toast = {
  id: string;
  tone: Tone;
  title: string;
  body?: string;
  ttl?: number;
};

type Listener = (next: Toast[]) => void;
const listeners = new Set<Listener>();
let store: Toast[] = [];

function emit() {
  for (const l of listeners) l(store);
}

function push(t: Omit<Toast, "id">) {
  const id = `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const next: Toast = { id, ttl: 3200, ...t };
  store = [...store, next];
  emit();
  if (next.ttl && next.ttl > 0) {
    setTimeout(() => dismiss(id), next.ttl);
  }
  return id;
}

function dismiss(id: string) {
  store = store.filter((t) => t.id !== id);
  emit();
}

export const toast = push;
export const dismissToast = dismiss;

export function useToast() {
  const [items, setItems] = useState<Toast[]>(store);
  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);
  const remove = useCallback((id: string) => dismiss(id), []);
  return { items, push, dismiss: remove };
}
