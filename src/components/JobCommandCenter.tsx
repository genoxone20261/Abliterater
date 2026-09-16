import { useState } from "react";
import { t, useLocale } from "@/lib/i18n";
import { COMMAND_CENTER_VIEWS } from "@/lib/analog-wave3";

function viewLabel(
  view: (typeof COMMAND_CENTER_VIEWS)[number],
  locale: ReturnType<typeof useLocale>[0],
): string {
  if (view === "list") return t("cmd_view_list", locale);
  if (view === "detail") return t("cmd_view_detail", locale);
  if (view === "log") return t("cmd_view_log", locale);
  if (view === "artifact") return t("cmd_view_artifact", locale);
  if (view === "cost") return t("cmd_view_cost", locale);
  return t("cmd_view_cleanup", locale);
}

export function JobCommandCenter() {
  const [locale] = useLocale();
  const [view, setView] = useState<(typeof COMMAND_CENTER_VIEWS)[number]>("list");
  return (
    <section className="border-b border-border px-4 py-3" aria-label={t("cmd_aria", locale)}>
      <h2 className="text-sm font-medium">{t("cmd_title", locale)}</h2>
      <div className="mt-2 flex flex-wrap gap-1">
        {COMMAND_CENTER_VIEWS.map((item) => (
          <button
            key={item}
            type="button"
            className="border border-border px-2 py-1 text-xs"
            aria-pressed={view === item}
            onClick={() => setView(item)}
          >
            {viewLabel(item, locale)}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted" data-view={view}>
        {t("cmd_live_open", locale)}
      </p>
    </section>
  );
}
