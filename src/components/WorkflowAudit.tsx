import { AlertTriangle, Check, CircleOff, Info } from "lucide-react";
import { auditWorkflow, flowHasBlock, type FlowStatus } from "@/lib/model-source";
import type { StudioState } from "@/lib/studio";
import { t, useLocale, type TranslationKey } from "@/lib/i18n";

function StatusIcon({ status }: { status: FlowStatus }) {
  if (status === "ok") return <Check className="size-3.5 text-ok" aria-hidden />;
  if (status === "warn") return <AlertTriangle className="size-3.5 text-warn" aria-hidden />;
  if (status === "block") return <AlertTriangle className="size-3.5 text-danger" aria-hidden />;
  return <CircleOff className="size-3.5 text-subtle" aria-hidden />;
}

const tone: Record<FlowStatus, string> = {
  ok: "text-muted",
  warn: "text-warn",
  skip: "text-subtle",
  block: "text-danger",
};

const STEP_TITLE: Record<string, TranslationKey> = {
  base: "step_base",
  methods: "step_methods",
  math: "step_math",
  compute: "step_compute",
  fetch: "step_fetch",
  train: "step_train",
  quant: "step_quant",
  eval: "step_eval",
  pack: "step_pack",
};

export function WorkflowAudit({ s }: { s: StudioState }) {
  const [locale] = useLocale();
  const steps = auditWorkflow(s, locale);
  const blocked = flowHasBlock(steps);

  return (
    <div className="rounded-sm border border-border bg-surface p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
        <Info className="size-4" /> {t("workflow_audit_title", locale)}
      </p>
      <p className={`mt-1 text-xs ${blocked ? "text-danger" : "text-muted"}`}>
        {blocked ? t("workflow_blocked", locale) : t("workflow_ok", locale)}
      </p>
      <ol className="mt-3 space-y-2">
        {steps.map((step, i) => {
          const titleKey = STEP_TITLE[step.id];
          return (
            <li key={step.id} className="flex gap-2">
              <span className="mt-0.5 shrink-0">
                <StatusIcon status={step.status} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-fg">
                  {i + 1}. {titleKey ? t(titleKey, locale) : step.title}
                </p>
                <p className={`text-xs leading-snug ${tone[step.status]}`}>{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
