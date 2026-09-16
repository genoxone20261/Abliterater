export function appendNote(prev: string, clause: string): string {
  const a = (prev ?? "").trim();
  const b = (clause ?? "").trim();
  if (!a) return b;
  if (!b) return a;
  return `${a}\n${b}`;
}
