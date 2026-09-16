import type { ReactNode } from "react";
import { Check } from "lucide-react";

/** Shared selection surface: consistent pointer, focus and pressed semantics. */
export function Chip({
  on,
  children,
  onClick,
  warn,
  danger,
}: {
  on: boolean;
  children: ReactNode;
  onClick: () => void;
  warn?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      data-on={on}
      data-warn={warn}
      data-danger={danger}
      aria-pressed={on}
      onClick={onClick}
      className="chip-toggle grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm text-muted hover:text-fg"
    >
      <span className="min-w-0">{children}</span>
      {on ? (
        <span className="chip-check" data-chip-check aria-hidden>
          <Check className="size-3.5" />
        </span>
      ) : null}
    </button>
  );
}
