import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { Tone, Toast } from "./toast-store";
import { t, useLocale } from "@/lib/i18n";

function toneIcon(tone: Tone) {
  if (tone === "ok") return <CheckCircle2 className="size-4 text-ok" aria-hidden />;
  if (tone === "warn") return <AlertTriangle className="size-4 text-warn" aria-hidden />;
  if (tone === "danger") return <XCircle className="size-4 text-danger" aria-hidden />;
  return <Info className="size-4 text-accent" aria-hidden />;
}

export function ToastStack({
  items,
  onDismiss,
}: {
  items: Toast[];
  onDismiss: (id: string) => void;
}) {
  const [locale] = useLocale();
  if (items.length === 0) return null;
  return (
    <div
      className="toast-stack"
      role="region"
      aria-live="polite"
      aria-label={t("toast_region", locale)}
    >
      {items.map((item) => (
        <div key={item.id} className="toast" data-tone={item.tone} role="status">
          <span className="mt-0.5 shrink-0">{toneIcon(item.tone)}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-fg">{item.title}</p>
            {item.body ? (
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.body}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onDismiss(item.id)}
            className="ml-1 shrink-0 rounded-sm text-subtle hover:text-fg"
            aria-label={t("tb_close", locale)}
          >
            <XCircle className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
