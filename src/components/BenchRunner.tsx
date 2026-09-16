/**
 * Studio "9. 평가" sub-panel. P3-3 + P3-4: paste a model's response
 * to each MINI_BENCH row, get a {passed, partial, refused, failed}
 * score breakdown. Refusal and failure are tracked separately, so a
 * model that errors out does not look like a "censored" one.
 */
import { useState } from "react";
import { Beaker, ClipboardPaste, RotateCcw, Trash2 } from "lucide-react";
import { MINI_BENCH, classify, score, type BenchReport, type Verdict } from "@/lib/eval-bench";
import { t, useLocale } from "@/lib/i18n";

const VERDICT_TONE: Record<Verdict, string> = {
  passed: "text-ok",
  partial: "text-warn",
  refused: "text-danger",
  failed: "text-danger",
};

function verdictLabel(v: Verdict, locale: ReturnType<typeof useLocale>[0]): string {
  return t(("bench_verdict_" + v) as "bench_verdict_passed", locale);
}

function rowVerdict(response: string, expected: string): Verdict {
  const r = response.trim();
  if (!r) return "partial";
  return classify(r, expected);
}

export function BenchRunner() {
  const [locale] = useLocale();
  const [responses, setResponses] = useState<string[]>(() => new Array(MINI_BENCH.length).fill(""));
  const [report, setReport] = useState<BenchReport | null>(null);
  const [clipboardError, setClipboardError] = useState("");

  function setAt(i: number, v: string) {
    setReport(null);
    setResponses((prev) => {
      const next = prev.slice();
      next[i] = v;
      return next;
    });
  }
  function pasteAt(i: number) {
    if (!navigator.clipboard?.readText) {
      setClipboardError(t("bench_clip_unavailable", locale));
      return;
    }
    setClipboardError("");
    navigator.clipboard
      .readText()
      .then((txt) => setAt(i, txt))
      .catch(() => setClipboardError(t("bench_clip_denied", locale)));
  }
  function run() {
    setReport(score(responses));
  }
  function reset() {
    setResponses(new Array(MINI_BENCH.length).fill(""));
    setReport(null);
  }

  return (
    <section className="space-y-3" aria-label={t("bench_aria", locale)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
          <Beaker className="size-4" /> {t("bench_title", locale)}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2 text-sm"
            onClick={run}
            disabled={!responses.some((response) => response.trim())}
          >
            <ClipboardPaste className="size-4" /> {t("bench_score", locale)}
          </button>
          <button
            type="button"
            className="btn-ghost inline-flex items-center gap-2 text-sm"
            onClick={reset}
            aria-label={t("bench_reset_aria", locale)}
          >
            <RotateCcw className="size-4" /> {t("bench_reset", locale)}
          </button>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        {t("bench_blurb", locale).replace("{n}", String(MINI_BENCH.length))}
      </p>
      <p className="text-xs text-muted">{t("bench_blurb2", locale)}</p>
      {clipboardError && (
        <p role="alert" className="text-sm text-danger">
          {clipboardError}
        </p>
      )}

      <ol className="space-y-2">
        {MINI_BENCH.map((row, i) => {
          const v = rowVerdict(responses[i] ?? "", row.expected);
          return (
            <li key={row.id} className="rounded-sm border border-border bg-surface p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-muted">
                  {row.category} · {row.id}
                </p>
                <p
                  className={`text-xs font-bold ${responses[i]?.trim() ? VERDICT_TONE[v] : "text-muted"}`}
                >
                  {responses[i]?.trim()
                    ? verdictLabel(v, locale)
                    : t("bench_verdict_empty", locale)}
                </p>
              </div>
              <p className="text-sm text-fg">{row.prompt}</p>
              <p className="text-xs text-muted">
                {t("bench_expected", locale)} <code className="font-mono">{row.expected}</code>
              </p>
              <div className="flex items-stretch gap-2">
                <input
                  className="input-shell flex-1 text-sm"
                  value={responses[i] ?? ""}
                  onChange={(e) => setAt(i, e.target.value)}
                  placeholder={t("bench_ph_response", locale)}
                  aria-label={t("bench_aria_response", locale).replace("{id}", row.id)}
                />
                <button
                  type="button"
                  className="btn-ghost inline-flex min-h-11 items-center gap-1 px-3 text-sm"
                  onClick={() => pasteAt(i)}
                  aria-label={t("bench_aria_paste", locale).replace("{id}", row.id)}
                  title={t("bench_paste_title", locale)}
                >
                  <ClipboardPaste className="size-4" />
                </button>
                {responses[i] && (
                  <button
                    type="button"
                    className="btn-ghost inline-flex min-h-11 items-center gap-1 px-3 text-sm"
                    onClick={() => setAt(i, "")}
                    aria-label={t("bench_aria_clear", locale).replace("{id}", row.id)}
                    title={t("bench_clear_row_title", locale)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {report && <BenchSummary report={report} />}
    </section>
  );
}

function BenchSummary({ report }: { report: BenchReport }) {
  const [locale] = useLocale();
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-sm border border-border bg-elevated p-3 space-y-2"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-muted">
        {t("bench_results", locale)}
      </p>
      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <Stat label={t("bench_verdict_passed", locale)} value={report.passed} tone="text-ok" />
        <Stat label={t("bench_verdict_partial", locale)} value={report.partial} tone="text-warn" />
        <Stat
          label={t("bench_verdict_refused", locale)}
          value={report.refused}
          tone="text-danger"
        />
        <Stat label={t("bench_verdict_failed", locale)} value={report.failed} tone="text-danger" />
      </div>
      <div className="overflow-x-auto text-xs">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{t("bench_by_cat_caption", locale)}</caption>
          <thead>
            <tr className="border-b border-border text-muted">
              <th scope="col" className="py-1 pr-2">
                {t("bench_col_cat", locale)}
              </th>
              <th scope="col" className="py-1 pr-2 text-right text-ok">
                {t("bench_verdict_passed", locale)}
              </th>
              <th scope="col" className="py-1 pr-2 text-right text-warn">
                {t("bench_verdict_partial", locale)}
              </th>
              <th scope="col" className="py-1 pr-2 text-right text-danger">
                {t("bench_verdict_refused", locale)}
              </th>
              <th scope="col" className="py-1 pr-2 text-right text-danger">
                {t("bench_verdict_failed", locale)}
              </th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(report.byCategory) as Array<keyof typeof report.byCategory>).map(
              (cat) => {
                const c = report.byCategory[cat];
                return (
                  <tr key={cat} className="border-b border-border/50">
                    <th scope="row" className="py-1 pr-2 font-medium">
                      {cat}
                    </th>
                    <td className="py-1 pr-2 text-right tabular-nums">{c.passed}</td>
                    <td className="py-1 pr-2 text-right tabular-nums">{c.partial}</td>
                    <td className="py-1 pr-2 text-right tabular-nums">{c.refused}</td>
                    <td className="py-1 pr-2 text-right tabular-nums">{c.failed}</td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
    </div>
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
