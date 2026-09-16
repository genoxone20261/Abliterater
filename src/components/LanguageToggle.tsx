import { Languages } from "lucide-react";
import { setLocale as applyLocale, t, useLocale, type Locale } from "@/lib/i18n";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const [locale, setLocale] = useLocale();

  const pick = (next: Locale) => {
    applyLocale(next);
    setLocale(next);
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-border bg-surface p-1 ${className}`}
      role="group"
      aria-label={t("lang_selector_aria", locale)}
      data-testid="language-toggle"
    >
      <Languages className="ml-1.5 size-3.5 text-muted" aria-hidden="true" />
      <button
        type="button"
        data-locale-set="ko"
        onClick={() => pick("ko")}
        aria-pressed={locale === "ko"}
        className={`h-7 rounded-[var(--radius-sm)] px-2.5 text-xs font-bold transition-all ${
          locale === "ko"
            ? "bg-elevated text-primary shadow-sm ring-1 ring-border"
            : "text-muted hover:text-fg"
        }`}
      >
        KO
      </button>
      <button
        type="button"
        data-locale-set="en"
        onClick={() => pick("en")}
        aria-pressed={locale === "en"}
        className={`h-7 rounded-[var(--radius-sm)] px-2.5 text-xs font-bold transition-all ${
          locale === "en"
            ? "bg-elevated text-primary shadow-sm ring-1 ring-border"
            : "text-muted hover:text-fg"
        }`}
      >
        EN
      </button>
    </div>
  );
}
