import { HardDrive } from "lucide-react";
import { useEffect, useState } from "react";
import { t, useLocale } from "@/lib/i18n";
import { WORKSPACE_ERROR } from "@/lib/workspace-storage";

type WorkspaceState = { root: string; freeBytes: number; writable: boolean };

function workspaceMessage(
  reason: unknown,
  locale: ReturnType<typeof useLocale>[0],
  fallback: "ws_read_fail" | "ws_change_fail",
): string {
  const code = reason instanceof Error ? reason.message : typeof reason === "string" ? reason : "";
  if (code === WORKSPACE_ERROR.data) return t("ws_err_data", locale);
  if (code === WORKSPACE_ERROR.home) return t("ws_err_home", locale);
  if (code === WORKSPACE_ERROR.invalid) return t("ws_err_invalid", locale);
  if (code === WORKSPACE_ERROR.absolute) return t("ws_err_absolute", locale);
  if (code === WORKSPACE_ERROR.repo) return t("ws_err_repo", locale);
  if (code === WORKSPACE_ERROR.dir) return t("ws_err_dir", locale);
  if (code === WORKSPACE_ERROR.settings) return t("ws_err_settings", locale);
  if (code === WORKSPACE_ERROR.busy) return t("ws_err_busy", locale);
  return t(fallback, locale);
}

function size(bytes: number, locale: ReturnType<typeof useLocale>[0]) {
  if (!Number.isFinite(bytes) || bytes < 0) return t("ws_size_unknown", locale);
  const gib = bytes / 1024 ** 3;
  return `${gib >= 100 ? gib.toFixed(0) : gib.toFixed(1)} GiB`;
}

export function StorageSettings() {
  const [locale] = useLocale();
  const [state, setState] = useState<WorkspaceState | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    setAvailable(Boolean(window.electron?.workspaceGet && window.electron.workspaceSelect));
  }, []);
  useEffect(() => {
    if (!available) return;
    let live = true;
    window.electron!.workspaceGet!().then(
      (value) => live && setState(value),
      (reason) => live && setError(workspaceMessage(reason, locale, "ws_read_fail")),
    );
    return () => {
      live = false;
    };
  }, [available, locale]);
  async function choose() {
    setBusy(true);
    setError("");
    try {
      const selected = await window.electron!.workspaceSelect!();
      if (selected) setState(selected);
    } catch (reason) {
      setError(workspaceMessage(reason, locale, "ws_change_fail"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel space-y-3 rounded-lg p-4" aria-label={t("ws_aria", locale)}>
      <h2 className="flex items-center gap-2 text-sm font-bold">
        <HardDrive className="size-4" />
        {t("ws_title", locale)}
      </h2>
      <p className="text-xs text-muted">{t("ws_blurb", locale)}</p>
      {available ? (
        <>
          <div className="grid gap-1 text-xs">
            <span className="text-muted">{t("ws_current", locale)}</span>
            <code className="break-all rounded border border-border bg-surface p-2">
              {state?.root ?? t("ws_checking", locale)}
            </code>
            {state && (
              <span className="text-muted">
                {t("ws_writable", locale).replace("{n}", size(state.freeBytes, locale))}
              </span>
            )}
          </div>
          <button
            type="button"
            className="btn-secondary min-h-11 px-4 text-sm"
            disabled={busy}
            onClick={() => void choose()}
          >
            {busy ? t("ws_busy", locale) : t("ws_choose", locale)}
          </button>
        </>
      ) : (
        <p className="text-xs text-muted">{t("ws_web_only", locale)}</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
