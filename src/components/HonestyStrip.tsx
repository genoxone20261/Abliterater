import { ShieldAlert } from "lucide-react";
import { t, useLocale } from "@/lib/i18n";

/** Wiring inventory. Not live generate / not GPU / not K3 tokens. */
export function HonestyStrip({
  fileCount,
  k3,
  iq1,
}: {
  fileCount: number;
  k3: boolean;
  iq1: boolean;
}) {
  const [locale] = useLocale();
  return (
    <div className="mica rounded-lg p-4">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle">
        <ShieldAlert className="size-3.5" /> {t("honesty_title", locale)}
      </p>
      <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-muted">
        <li>
          {t("honesty_pack_count", locale)}{" "}
          <span className="font-mono text-fg">{fileCount}/17</span>. {t("honesty_contract", locale)}
        </li>
        <li>{t("honesty_li1", locale)}</li>
        <li>{t("honesty_li2", locale)}</li>
        {k3 ? <li className="text-warn">{t("honesty_li3", locale)}</li> : null}
        {iq1 ? <li className="text-warn">{t("honesty_li4", locale)}</li> : null}
      </ul>
    </div>
  );
}
