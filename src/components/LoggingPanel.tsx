/**
 * P3-8: provider-call logging panel.
 *
 * This is intentionally localStorage-backed for the current app:
 * it gives us a visible log without introducing migrations or
 * server auth just to inspect developer-side provider traffic.
 */
import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Download, RotateCcw, Trash2 } from "lucide-react";
import { t, useLocale } from "@/lib/i18n";
import { Dialog } from "@/components/ui/Dialog";
import {
  clearLog,
  exportLog,
  listCalls,
  loggingAvailable,
  type ProviderCall,
} from "@/lib/provider-log";

const TONE: Record<ProviderCall["status"], string> = {
  ok: "text-ok",
  warn: "text-warn",
  err: "text-danger",
};

export function LoggingPanel() {
  const [locale] = useLocale();
  const [rows, setRows] = useState<ProviderCall[]>([]);
  const [available, setAvailable] = useState(true);
  const [pendingClear, setPendingClear] = useState(false);
  useEffect(() => {
    const update = () => setRows(listCalls(50));
    setAvailable(loggingAvailable());
    update();
    window.addEventListener("ablit-provider-log", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("ablit-provider-log", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  const count = rows.length;
  const summary = useMemo(() => {
    const ok = rows.filter((r) => r.status === "ok").length;
    const warn = rows.filter((r) => r.status === "warn").length;
    const err = rows.filter((r) => r.status === "err").length;
    return { ok, warn, err };
  }, [rows]);

  function refresh() {
    setRows(listCalls(50));
  }
  function onClear() {
    clearLog();
    refresh();
  }
  function onExport() {
    const body = exportLog();
    const blob = new Blob([body], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = t("log_export_filename", locale);
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="panel space-y-3 rounded-lg p-4" aria-label={t("log_aria", locale)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
          <ClipboardList className="size-4" /> {t("log_title", locale)}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2 text-sm"
            onClick={refresh}
          >
            <RotateCcw className="size-4" /> {t("log_refresh", locale)}
          </button>
          <button
            type="button"
            className="btn-ghost inline-flex items-center gap-2 text-sm"
            onClick={onExport}
          >
            <Download className="size-4" /> {t("log_export", locale)}
          </button>
          <button
            type="button"
            className="btn-ghost inline-flex items-center gap-2 text-sm text-danger"
            onClick={() => setPendingClear(true)}
            aria-label={t("log_clear_aria", locale)}
          >
            <Trash2 className="size-4" /> {t("log_clear", locale)}
          </button>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        {t("log_summary", locale).replace("{count}", String(count))}
      </p>
      {!available && (
        <p role="alert" className="text-sm text-warn">
          {t("log_unavailable", locale)}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <Stat label={t("log_stat_ok", locale)} value={summary.ok} tone="text-ok" />
        <Stat label={t("log_stat_warn", locale)} value={summary.warn} tone="text-warn" />
        <Stat label={t("log_stat_err", locale)} value={summary.err} tone="text-danger" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <caption className="sr-only">{t("log_caption", locale)}</caption>
          <thead>
            <tr className="border-b border-border text-muted">
              <th scope="col" className="py-1 pr-2">
                {t("log_col_provider", locale)}
              </th>
              <th scope="col" className="py-1 pr-2">
                {t("log_col_endpoint", locale)}
              </th>
              <th scope="col" className="py-1 pr-2 text-right">
                {t("log_col_ms", locale)}
              </th>
              <th scope="col" className="py-1 pr-2 text-right">
                {t("log_col_status", locale)}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="py-3 text-muted" colSpan={4}>
                  {t("log_empty", locale)}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-border/50 align-top">
                  <th scope="row" className="py-1 pr-2 font-medium">
                    {t(
                      row.provider === "hf"
                        ? "log_kind_hf"
                        : row.provider === "api"
                          ? "log_kind_api"
                          : row.provider === "ollama"
                            ? "log_kind_ollama"
                            : row.provider === "vllm"
                              ? "log_kind_vllm"
                              : row.provider === "openai"
                                ? "log_kind_openai"
                                : "log_kind_azure",
                      locale,
                    )}
                  </th>
                  <td className="py-1 pr-2">
                    <div className="max-w-[18rem] truncate">{row.endpoint}</div>
                    {row.note && <div className="mt-0.5 text-[11px] text-muted">{row.note}</div>}
                  </td>
                  <td className="py-1 pr-2 text-right tabular-nums">{row.durationMs}</td>
                  <td className={`py-1 pr-2 text-right font-semibold ${TONE[row.status]}`}>
                    {t(
                      row.status === "ok"
                        ? "log_stat_ok"
                        : row.status === "warn"
                          ? "log_stat_warn"
                          : "log_stat_err",
                      locale,
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Dialog
        open={pendingClear}
        onClose={() => setPendingClear(false)}
        title={t("log_clear_title", locale)}
        description={t("log_clear_confirm", locale)}
      >
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn-ghost min-h-11"
            onClick={() => setPendingClear(false)}
          >
            {t("confirm_cancel", locale)}
          </button>
          <button
            type="button"
            className="btn-secondary min-h-11 text-danger"
            onClick={() => {
              setPendingClear(false);
              onClear();
            }}
          >
            {t("log_clear", locale)}
          </button>
        </div>
      </Dialog>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-0.5 text-xl font-bold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
