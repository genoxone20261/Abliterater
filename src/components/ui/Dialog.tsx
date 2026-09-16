import * as Primitive from "@radix-ui/react-dialog";
import { useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { t, useLocale } from "@/lib/i18n";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const opener = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(open);
  if (open && !wasOpen.current) {
    opener.current =
      typeof document !== "undefined" && document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
  }
  wasOpen.current = open;
  const [locale] = useLocale();
  return (
    <Primitive.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <Primitive.Portal>
        <Primitive.Overlay className="fixed inset-0 z-50 bg-bg/80" />
        <Primitive.Content
          className="panel-strong fixed left-1/2 top-1/2 z-50 max-h-[85dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[var(--radius-lg)] p-5"
          onCloseAutoFocus={(event) => {
            if (opener.current?.isConnected) {
              event.preventDefault();
              opener.current.focus();
            }
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Primitive.Title className="text-base font-bold">{title}</Primitive.Title>
              <Primitive.Description className="mt-1 text-sm text-muted">
                {description}
              </Primitive.Description>
            </div>
            <Primitive.Close
              aria-label={t("tb_close", locale)}
              className="btn-ghost flex min-h-11 min-w-11 items-center justify-center"
            >
              <X className="size-4" aria-hidden />
            </Primitive.Close>
          </div>
          <div className="mt-4">{children}</div>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
