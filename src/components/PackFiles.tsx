import { useMemo, useState } from "react";
import { Copy, FileText } from "lucide-react";
import { PACK_DOWNLOAD_NAMES } from "@/lib/pack";
import { t, useLocale } from "@/lib/i18n";

export function PackFiles({ files }: { files: Record<string, string> }) {
  const [locale] = useLocale();
  const names = PACK_DOWNLOAD_NAMES;
  const [active, setActive] = useState<string>(names[0] ?? "README.txt");
  const body = files[active] ?? "";
  const present = useMemo(
    () => names.filter((n) => typeof files[n] === "string").length,
    [files, names],
  );

  return (
    <div className="mica overflow-hidden rounded-lg">
      <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">
          <FileText className="size-3.5" />{" "}
          {t("pack_files_title", locale)
            .replace("{present}", String(present))
            .replace("{total}", String(names.length))}
        </p>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs font-semibold text-accent hover:text-fg"
          onClick={() => navigator.clipboard.writeText(body)}
        >
          <Copy className="size-3.5" /> {t("pack_files_copy", locale)}
        </button>
      </div>
      <div className="flex max-h-80">
        <ul className="w-[42%] shrink-0 overflow-auto border-r border-white/5 py-1">
          {names.map((name) => {
            const on = name === active;
            const ok = typeof files[name] === "string";
            return (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => setActive(name)}
                  className={`flex min-h-11 w-full items-center justify-between gap-2 px-3 text-left font-mono text-[11px] ${
                    on ? "bg-white/6 text-fg" : "text-muted hover:bg-white/3 hover:text-fg"
                  }`}
                >
                  <span className="truncate">{name}</span>
                  <span className={ok ? "text-muted" : "text-danger"}>
                    {ok ? t("pack_in", locale) : "—"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <pre className="min-w-0 flex-1 overflow-auto whitespace-pre-wrap break-all p-3 font-mono text-[11px] leading-relaxed text-muted">
          {body || t("pack_files_empty", locale)}
        </pre>
      </div>
    </div>
  );
}
