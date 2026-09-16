/**
 * Custom frameless window title bar — draggable, with min/max/close buttons.
 * Mount in the app root alongside the router outlet.
 *
 * Integrates with the Electron IPC bridge defined in preload.cjs.
 * On non-Electron (browser) environments all controls are no-ops.
 */
import { useEffect, useState } from "react";
import { t, useLocale } from "@/lib/i18n";

declare global {
  interface Window {
    electron?: {
      workspaceGet?: () => Promise<{ root: string; freeBytes: number; writable: boolean }>;
      workspaceSelect?: () => Promise<{
        root: string;
        freeBytes: number;
        writable: boolean;
      } | null>;
      hardwareProfile?: () => Promise<unknown>;
      providerRead?: (request: {
        provider: string;
        token: string;
        id?: string;
      }) => Promise<unknown>;
      providerMutate?: (request: {
        provider: string;
        token: string;
        method: string;
        url: string;
        body?: string;
        requestId?: string;
      }) => Promise<unknown>;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      isMaximized: () => Promise<boolean>;
      onMaximizeChange: (cb: (maximized: boolean) => void) => () => void;
      appVersion: () => Promise<string>;
      appName: () => Promise<string>;
    };
  }
}

export function TitleBar() {
  const [locale] = useLocale();
  const [available, setAvailable] = useState(false);
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!window.electron) return;
    setAvailable(true);
    let alive = true;
    window.electron.isMaximized().then((value) => {
      if (alive) setMaximized(value);
    });
    const unsubscribe = window.electron.onMaximizeChange(setMaximized);
    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  if (!available) return null;

  const onMinimize = () => window.electron?.minimize();
  const onMaximize = () => window.electron?.maximize();
  const onClose = () => window.electron?.close();
  const noDrag = { WebkitAppRegion: "no-drag" } as React.CSSProperties;

  return (
    <div
      data-tauri-drag-region
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      className="fixed top-0 left-0 right-0 z-50 flex h-9 items-center justify-between border-b border-border bg-surface px-2 select-none"
      aria-label={t("tb_aria", locale)}
    >
      {/* App title */}
      <div className="flex items-center gap-2 pl-2" data-tauri-drag-region>
        <span className="text-xs font-bold uppercase tracking-widest text-muted">
          {t("app_name", locale)}
        </span>
      </div>

      {/* Window controls — no-drag is required or Electron swallows clicks. */}
      <div className="flex items-center" style={noDrag}>
        <button
          type="button"
          style={noDrag}
          onClick={onMinimize}
          aria-label={t("tb_min", locale)}
          className="flex h-9 w-11 items-center justify-center rounded-none border-0 bg-transparent text-muted transition-colors hover:bg-ink/20 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" className="fill-current">
            <rect width="10" height="1" />
          </svg>
        </button>
        <button
          type="button"
          style={noDrag}
          onClick={onMaximize}
          aria-label={maximized ? t("tb_restore", locale) : t("tb_max", locale)}
          className="flex h-9 w-11 items-center justify-center rounded-none border-0 bg-transparent text-muted transition-colors hover:bg-ink/20 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          {maximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" className="fill-current">
              <rect
                x="0"
                y="2"
                width="8"
                height="8"
                rx="0"
                ry="0"
                strokeWidth="1"
                stroke="currentColor"
                fill="none"
              />
              <rect
                x="2"
                y="0"
                width="8"
                height="8"
                rx="0"
                ry="0"
                strokeWidth="1"
                stroke="currentColor"
                fill="none"
              />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" className="fill-none stroke-current">
              <rect x="0.5" y="0.5" width="9" height="9" rx="0" strokeWidth="1" />
            </svg>
          )}
        </button>
        <button
          type="button"
          style={noDrag}
          onClick={onClose}
          aria-label={t("tb_close", locale)}
          className="flex h-9 w-11 items-center justify-center rounded-none border-0 bg-transparent text-muted transition-colors hover:bg-danger hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className="fill-current">
            <path
              d="M1 1l8 8M9 1L1 9"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
