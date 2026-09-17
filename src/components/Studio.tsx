import { useCallback, useEffect, useMemo, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Dialog } from "@/components/ui/Dialog";
import { Field } from "@/components/ui/Field";
import {
  Bookmark,
  Box,
  Cloud,
  Copy,
  CopyPlus,
  Download,
  FolderLock,
  MessageSquare,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  Trash2,
  Zap,
} from "lucide-react";
import { toast, useToast } from "@/components/toast-store";
import { ToastStack } from "@/components/Toast";
import {
  BASES,
  COMPUTES,
  DEFAULT_STATE,
  DOMAINS,
  GPUS,
  OUTPUTS,
  PURPOSES,
  STORES,
  methodsFor,
  type StudioState,
} from "@/lib/studio";
import { buildPack, PACK_DOWNLOAD_NAMES, type PackResult } from "@/lib/pack";
import { purposeMatrix } from "@/lib/purpose-matrix";
import { PRESETS, applyPreset } from "@/lib/presets";
import {
  clearAllJobs,
  duplicateJob,
  JOB_ERROR,
  filterSavedJobs,
  hydrateJobs,
  loadJob,
  removeJob,
  saveJob,
  type SavedConfig,
} from "@/lib/jobs";
import { t, useLocale, type TranslationKey } from "@/lib/i18n";
import { chipCopy } from "@/lib/chip-copy";
import { catalogIsReuse, classifyDerived, recommendPath } from "@/lib/size-bands";
import { DEFAULT_METHOD_PARAMS, type MethodParams } from "@/lib/runners";
import { zipUtf8Files, ZIP_ERROR } from "@/lib/zip";
import { type SearchSource, type SourceHit } from "@/lib/source-search";
import { auditWorkflow, flowHasBlock, hfRepoFromCatalog, resolveBasePull } from "@/lib/model-source";
import { ModelSource } from "@/components/ModelSource";
import { WorkflowAudit } from "@/components/WorkflowAudit";
import { BenchRunner } from "@/components/BenchRunner";
import { LoggingPanel } from "@/components/LoggingPanel";
import { SourceHub } from "@/components/SourceHub";
import { ProviderConnections } from "@/components/ProviderConnections";
import { ConnectionWizard } from "@/components/ConnectionWizard";
import { JobCommandCenter } from "@/components/JobCommandCenter";
import { SshConnection } from "@/components/SshConnection";
import { StorageSettings } from "@/components/StorageSettings";
import { Recommendations } from "@/components/Recommendations";
import { computeRuntimeKind } from "@/lib/provider-capabilities";
import { appendNote } from "@/lib/notes";
import { provenanceOf } from "@/lib/provenance";
import { PUT_SOURCE_EVENT, type PutSourceDetail } from "@/lib/put-source";
import {
  FOLDED_METHOD_IDS,
  METHOD_FAMILIES,
  statusRail,
  type MethodFamilyId,
} from "@/lib/method-families";

type UiState = StudioState & {
  methodParams?: MethodParams;
  systemUser?: string;
};

type PendingConfirm = { kind: "clear-all" } | { kind: "delete"; id: string } | { kind: "reset" };

const LORA_METHODS = new Set(["sft-unc", "lora-dpo", "cpt", "dsmoe"]);
const FAM_TITLE: Record<MethodFamilyId, TranslationKey> = {
  reuse: "fam_reuse",
  edit: "fam_edit",
  train: "fam_train",
  quant: "fam_quant",
  infer: "fam_infer",
};
const FOLDED = new Set<string>(FOLDED_METHOD_IDS);
const QUANT_OUT = {
  Q4_K_M: "gguf-q4",
  Q5_K_M: "gguf-q5",
  Q8_0: "gguf-q8",
} as const;

const inputCls = "input-shell text-sm";

function download(name: string, body: string, mime = "text/plain") {
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function cloneParams(p: MethodParams): MethodParams {
  return {
    heretic: { ...p.heretic },
    lora: { ...p.lora },
    imatrix: { ...p.imatrix },
    cast: { ...p.cast },
    apostate: { ...p.apostate },
  };
}

function paramsOf(s: UiState): MethodParams {
  const d = DEFAULT_METHOD_PARAMS;
  const p = s.methodParams;
  return {
    heretic: { ...d.heretic, ...p?.heretic },
    lora: { ...d.lora, ...p?.lora },
    imatrix: { ...d.imatrix, ...p?.imatrix },
    cast: { ...d.cast, ...p?.cast },
    apostate: { ...d.apostate, ...p?.apostate },
  };
}

function initialUi(): UiState {
  return {
    ...DEFAULT_STATE,
    methodParams: cloneParams(DEFAULT_METHOD_PARAMS),
    systemUser: "",
  };
}

function hydrateJob(st: StudioState): UiState {
  const u = st as UiState;
  return {
    ...DEFAULT_STATE,
    ...u,
    methodParams: paramsOf(u),
    systemUser: u.systemUser ?? "",
  };
}

function presetActive(id: string, s: UiState) {
  const patch = applyPreset(id);
  if (!patch || Object.keys(patch).length === 0) return false;
  return Object.entries(patch).every(([key, value]) => {
    const current = s[key as keyof StudioState];
    return Array.isArray(value) && Array.isArray(current)
      ? value.length === current.length && value.every((entry) => current.includes(entry))
      : value === current;
  });
}

function packZipName(pack: PackResult): string {
  const stem = (pack.title || "ablit-pack")
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return `${stem || "ablit-pack"}.zip`;
}

function downloadPack(pack: PackResult) {
  const files = pack.files;
  if (files && Object.keys(files).length) {
    const known = new Set<string>(PACK_DOWNLOAD_NAMES);
    const entries: { name: string; body: string }[] = PACK_DOWNLOAD_NAMES.filter(
      (name) => typeof files[name] === "string" && files[name].length > 0,
    ).map((name) => ({ name, body: files[name] }));
    for (const [name, body] of Object.entries(files)) {
      if (!known.has(name)) entries.push({ name, body });
    }
    const blob = zipUtf8Files(entries);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = packZipName(pack);
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  download("run.sh", pack.sh);
  download("run.ps1", pack.ps1);
  if (pack.azureSh) download("az-startup.sh", pack.azureSh);
  if (pack.azureYml) download("azure-job.yml", pack.azureYml);
  if (pack.compose) download("docker-compose.yml", pack.compose);
  download("SYSTEM.txt", pack.prompts.system);
  download("POWER.txt", pack.prompts.power);
  download("POWER.en.txt", pack.prompts.powerEn);
  download("SFT.txt", pack.prompts.sft);
  download("eval.txt", pack.prompts.evalp);
  download("job.json", pack.json, "application/json");
  download("README.txt", pack.readme);
}

function NumInput({
  value,
  onChange,
  step = "1",
  id,
  "aria-labelledby": labelledBy,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: string;
  id: string;
  "aria-labelledby"?: string;
}) {
  return (
    <input
      type="number"
      id={id}
      aria-labelledby={labelledBy}
      suppressHydrationWarning
      className={inputCls}
      value={Number.isFinite(value) ? value : 0}
      step={step}
      onChange={(e) => {
        const n = e.target.valueAsNumber;
        if (Number.isFinite(n)) onChange(n);
      }}
    />
  );
}

function storePlaceholder(id: string, locale: ReturnType<typeof useLocale>[0]): string {
  if (id === "local") return t("store_ph_local", locale);
  if (id === "s3") return t("store_ph_s3", locale);
  if (id === "gcs") return t("store_ph_gcs", locale);
  if (id === "azure") return t("store_ph_azure", locale);
  if (id === "hf") return t("store_ph_hf", locale);
  if (id === "minio") return t("store_ph_minio", locale);
  if (id === "nfs") return t("store_ph_nfs", locale);
  return "";
}

function storageMessage(error: unknown, locale: ReturnType<typeof useLocale>[0]): string {
  const code = error instanceof Error ? error.message : "";
  if (code === JOB_ERROR.unavailable) return t("save_err_unavailable", locale);
  if (code === JOB_ERROR.denied) return t("save_err_denied", locale);
  if (code === JOB_ERROR.invalid) return t("save_err_invalid", locale);
  return t("toast_save_fail", locale);
}

function zipMessage(error: unknown, locale: ReturnType<typeof useLocale>[0]): string {
  const code = error instanceof Error ? error.message : "";
  if (code === ZIP_ERROR.count) return t("zip_err_count", locale);
  if (code === ZIP_ERROR.path) return t("zip_err_path", locale);
  if (code === ZIP_ERROR.dup) return t("zip_err_dup", locale);
  if (code === ZIP_ERROR.name) return t("zip_err_name", locale);
  if (code === ZIP_ERROR.entry) return t("zip_err_entry", locale);
  if (code === ZIP_ERROR.total) return t("zip_err_total", locale);
  return t("zip_err", locale);
}

type Workspace = "build" | "explore" | "connect";

const WORKSPACES: { id: Workspace; label: TranslationKey }[] = [
  { id: "build", label: "workspace_build" },
  { id: "explore", label: "workspace_explore" },
  { id: "connect", label: "workspace_connect" },
];

function WorkspaceTabs({
  workspace,
  onChange,
}: {
  workspace: Workspace;
  onChange: (next: Workspace) => void;
}) {
  const [locale] = useLocale();
  return (
    <div className="workspace-switcher" aria-label={t("workspace_aria", locale)}>
      <div className="workspace-switcher-copy">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          {t("workspace_title", locale)}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{t("workspace_blurb", locale)}</p>
      </div>
      <div role="tablist" aria-label={t("workspace_aria", locale)} className="workspace-tabs">
        {WORKSPACES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`workspace-tab-${id}`}
            aria-controls={`workspace-${id}`}
            aria-selected={workspace === id}
            tabIndex={workspace === id ? 0 : -1}
            className="workspace-tab"
            onClick={() => onChange(id)}
            onKeyDown={(e) => {
              if (
                e.key !== "ArrowRight" &&
                e.key !== "ArrowLeft" &&
                e.key !== "Home" &&
                e.key !== "End"
              )
                return;
              e.preventDefault();
              const tabs = Array.from(
                e.currentTarget
                  .closest('[role="tablist"]')
                  ?.querySelectorAll<HTMLButtonElement>("[role=tab]") ?? [],
              );
              const current = tabs.indexOf(e.currentTarget);
              const next =
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? tabs.length - 1
                    : (current + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
              const nextTab = tabs[next];
              nextTab?.focus();
              if (nextTab?.id.startsWith("workspace-tab-"))
                onChange(nextTab.id.replace("workspace-tab-", "") as Workspace);
            }}
          >
            {t(label, locale)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Studio() {
  const [locale] = useLocale();
  const [s, setS] = useState<UiState>(initialUi);
  const [jobs, setJobs] = useState<SavedConfig[]>([]);
  const [storageError, setStorageError] = useState("");
  const [jobQuery, setJobQuery] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [workspace, setWorkspace] = useState<Workspace>("build");
  const visibleJobs = filterSavedJobs(jobs, jobQuery);
  const { items: toasts, dismiss: dismissToast } = useToast();

  const gpu = GPUS.find((g) => g.id === s.gpu);
  const mp = paramsOf(s);
  const pack = useMemo(() => {
    const notes = [s.notes, s.systemUser].filter((x) => (x ?? "").trim()).join("\n");
    const input = { ...s, notes } as StudioState;
    return buildPack(input, paramsOf(s), locale);
  }, [s, locale]);
  const packBlocked = flowHasBlock(auditWorkflow(s));
  const methods = methodsFor(s.purpose);
  const pull = resolveBasePull(s);
  const rail = statusRail({
    pull,
    dataUri: s.storeDataUri,
    revision: s.datasetRevision,
    license: s.datasetLicense,
    sha256: s.datasetChecksum,
    methods: s.methods,
  });
  const ramCap = gpu?.vram ?? 24;
  const ramMismatch = false;
  const altBases: { id: string; name: string; vram: number }[] = [];
  const showHeretic = s.methods.includes("heretic");
  const showApostate = s.methods.includes("apostate");
  const showLora = s.methods.some((id) => LORA_METHODS.has(id));
  const showQuant = s.methods.includes("quant");
  const showCast = s.methods.includes("cast");
  const showParams = showHeretic || showApostate || showLora || showQuant || showCast;

  useEffect(() => {
    const report = hydrateJobs();
    setJobs(report.jobs);
    if (report.dropped > 0) setStorageError(t("save_err_corrupt", locale));
  }, [locale]);

  const applySource = useCallback((hit: SourceHit, source: SearchSource) => {
    if (source === "hf-models") {
      setS((prev) => ({
        ...prev,
        modelSource: "hf",
        hfRepo: hit.id,
        hfRevision: hit.revision || "",
        base: "custom",
        storeBase: "hf",
        storeBaseUri: hit.id,
      }));
    } else if (source === "hf-datasets") {
      const prov = provenanceOf(hit);
      setS((prev) => ({
        ...prev,
        storeData: "hf",
        storeDataUri: hit.id,
        datasetRevision: hit.revision || "",
        datasetLicense: hit.license,
        datasetChecksum: prov.sha256,
        notes: appendNote(
          prev.notes,
          t("note_dataset", locale)
            .replace("{url}", hit.url)
            .replace("{license}", hit.license)
            .replace("{revision}", hit.revision || t("note_rev_unknown", locale)),
        ),
      }));
    } else {
      setS((prev) => ({
        ...prev,
        notes: appendNote(
          prev.notes,
          t("note_dev", locale)
            .replace("{url}", hit.url)
            .replace("{license}", hit.license),
        ),
      }));
    }
    toast({
      tone: "info",
      title: t("toast_source_linked_title", locale),
      body: t("toast_source_linked_body", locale),
    });
  }, [locale]);

  useEffect(() => {
    function onPut(e: Event) {
      const d = (e as CustomEvent<PutSourceDetail>).detail;
      if (!d?.hit) return;
      applySource(d.hit, d.source);
      setWorkspace("explore");
    }
    window.addEventListener(PUT_SOURCE_EVENT, onPut);
    return () => window.removeEventListener(PUT_SOURCE_EVENT, onPut);
  }, [applySource]);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[id^='section-']"));
    if (typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const n = Number(visible?.target.id.replace("section-", ""));
        if (Number.isFinite(n)) setActiveStep(n);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  function refreshJobs() {
    const report = hydrateJobs();
    setJobs(report.jobs);
    if (report.dropped > 0) setStorageError(t("save_err_corrupt", locale));
  }

  function set<K extends keyof UiState>(k: K, v: UiState[K]) {
    setS((prev) => ({
      ...prev,
      ...(k === "storeDataUri" && v !== prev.storeDataUri
        ? { datasetRevision: "", datasetLicense: "", datasetChecksum: "" }
        : {}),
      [k]: v,
    }));
  }
  function toggle(k: "methods" | "outputs", id: string) {
    setS((prev) => {
      const cur = prev[k];
      return { ...prev, [k]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
    });
  }
  function patchParams(partial: Partial<MethodParams>) {
    setS((prev) => {
      const cur = paramsOf(prev);
      return {
        ...prev,
        methodParams: {
          heretic: { ...cur.heretic, ...partial.heretic },
          lora: { ...cur.lora, ...partial.lora },
          imatrix: { ...cur.imatrix, ...partial.imatrix },
          cast: { ...cur.cast, ...partial.cast },
          apostate: { ...cur.apostate, ...partial.apostate },
        },
      };
    });
  }
  function pickQuant(q: MethodParams["imatrix"]["quant"]) {
    const out = QUANT_OUT[q];
    setS((prev) => ({
      ...prev,
      methodParams: {
        ...paramsOf(prev),
        imatrix: { ...paramsOf(prev).imatrix, quant: q },
      },
      outputs: prev.outputs.includes(out) ? prev.outputs : [...prev.outputs, out],
    }));
  }

  function handleSave() {
    try {
      saveJob(s as StudioState, s.project);
      refreshJobs();
      setStorageError("");
      toast({
        tone: "ok",
        title: t("toast_save_title", locale),
        body: t("toast_save_body", locale),
      });
    } catch (error) {
      setStorageError(storageMessage(error, locale));
    }
  }
  function handleDuplicate(id: string) {
    try {
      if (!duplicateJob(id, t("dup_name_suffix", locale)))
        throw new Error(t("toast_dup_fail_missing", locale));
      refreshJobs();
      setStorageError("");
      toast({ tone: "info", title: t("toast_dup_title", locale) });
    } catch (error) {
      setStorageError(storageMessage(error, locale));
    }
  }
  function handleDelete(id: string) {
    try {
      removeJob(id);
      refreshJobs();
      setStorageError("");
      toast({ tone: "warn", title: t("toast_del_title", locale) });
    } catch (error) {
      setStorageError(storageMessage(error, locale));
    }
  }
  function handleClearAll() {
    try {
      clearAllJobs();
      refreshJobs();
      setStorageError("");
      toast({ tone: "warn", title: t("toast_clear_title", locale) });
    } catch (error) {
      setStorageError(storageMessage(error, locale));
    }
  }
  function handleReset() {
    setS(initialUi());
    toast({
      tone: "info",
      title: t("toast_reset_title", locale),
      body: t("toast_reset_body", locale),
    });
  }
  function handleDownload() {
    if (packBlocked) {
      toast({
        tone: "danger",
        title: t("toast_pack_blocked_title", locale),
        body: t("toast_pack_blocked_body", locale),
      });
      return;
    }
    try {
      downloadPack(pack);
      toast({ tone: "ok", title: t("toast_zip_title", locale), body: t("toast_zip_body", locale) });
    } catch (error) {
      toast({
        tone: "danger",
        title: t("toast_zip_fail_title", locale),
        body: zipMessage(error, locale),
      });
    }
  }

  // Stepper data — primary pack-building sections, matching section-{n} anchors
  const stepperSteps = [
    { n: 1, label: t("step_base", locale) },
    { n: 2, label: t("step_purpose", locale) },
    { n: 3, label: t("step_domain", locale) },
    { n: 4, label: t("step_presets", locale) },
    { n: 5, label: t("step_methods", locale) },
    { n: 6, label: t("step_compute", locale) },
    { n: 7, label: t("step_storage", locale) },
    { n: 8, label: t("step_outputs", locale) },
  ];

  return (
    <>
      <ToastStack items={toasts} onDismiss={dismissToast} />

      <WorkspaceTabs workspace={workspace} onChange={setWorkspace} />
      <section
        id="workspace-build"
        role="tabpanel"
        aria-labelledby="workspace-tab-build"
        hidden={workspace !== "build"}
        inert={workspace !== "build" ? true : undefined}
      >
        <div className="workflow-grid">
          {/* ── Persistent workflow rail ── */}
          <nav className="workflow-rail" aria-label={t("nav_steps", locale)}>
            <p className="workflow-rail-title">{t("nav_steps", locale)}</p>
            <dl data-status-rail className="status-rail" aria-label={t("rail_aria", locale)}>
              <div>
                <dt>{t("rail_base", locale)}</dt>
                <dd>
                  <b>{rail.base.text}</b>
                  <span data-state={rail.base.state}>{t("rail_set", locale)}</span>
                </dd>
              </div>
              <div>
                <dt>{t("rail_data", locale)}</dt>
                <dd>
                  <b>{rail.data.text || "—"}</b>
                  <span data-state={rail.data.state}>
                    {rail.data.state === "ok" ? t("rail_set", locale) : t("rail_unverified", locale)}
                  </span>
                </dd>
              </div>
              <div>
                <dt>{t("rail_method", locale)}</dt>
                <dd>
                  <b>
                    {rail.method.empty
                      ? t("rail_method_empty", locale)
                      : rail.method.ids.join(" · ")}
                  </b>
                  <span data-state={rail.method.state}>
                    {rail.method.empty ? t("rail_skip", locale) : t("rail_set", locale)}
                  </span>
                </dd>
              </div>
              <div>
                <dt>{t("rail_next", locale)}</dt>
                <dd>
                  <b>{t("rail_next_pack", locale)}</b>
                  <span data-state={rail.next.state}>{t("rail_not_run", locale)}</span>
                </dd>
              </div>
            </dl>
            <div className="stepper">
              {stepperSteps.map((step) => (
                <button
                  key={step.n}
                  type="button"
                  data-active={activeStep === step.n}
                  aria-current={activeStep === step.n ? "step" : undefined}
                  className="stepper-item"
                  onClick={() => {
                    const sec = document.getElementById(`section-${step.n}`);
                    sec?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <span className="stepper-num" aria-hidden>
                    {step.n}
                  </span>
                  <span>{step.label}</span>
                </button>
              ))}
              <button
                type="button"
                className="stepper-item stepper-summary"
                onClick={() => {
                  document.getElementById("studio-summary")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                <span className="stepper-num" aria-hidden>
                  ↗
                </span>
                <span>{t("summary_title", locale)}</span>
              </button>
            </div>
          </nav>

          <div className="workflow-canvas space-y-5">
            <section id="section-1" className="space-y-3">
              <ModelSource
                s={s}
                setS={(fn) => setS((prev) => ({ ...prev, ...fn(prev) }))}
                ramCap={ramCap}
                ramMismatch={ramMismatch}
                altBases={altBases}
                onQuantQ4={() => pickQuant("Q4_K_M")}
              />
            </section>

            <section id="section-2" className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
                <span className="section-number" aria-hidden>
                  2
                </span>
                <SlidersHorizontal className="size-4" /> {t("step_purpose", locale)}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {PURPOSES.map((p) => (
                  <Chip
                    key={p.id}
                    on={s.purpose === p.id}
                    onClick={() => {
                      const next = methodsFor(p.id).map((m) => m.id);
                      const allowed = new Set<string>(next);
                      setS((prev) => {
                        const kept = prev.methods.filter((id) => allowed.has(id));
                        const seeded = purposeMatrix({
                          purpose: p.id,
                          domain: prev.domain,
                        }).methods.filter((id) => allowed.has(id));
                        const fallback = seeded.length
                          ? seeded
                          : allowed.has("quant")
                            ? ["quant"]
                            : next.slice(0, 1);
                        return {
                          ...prev,
                          purpose: p.id,
                          methods: kept.length ? kept : fallback,
                        };
                      });
                    }}
                  >
                    <span className="block font-semibold text-fg">
                      {chipCopy("purpose", p.id, "title", p.title, locale)}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-muted">
                      {chipCopy("purpose", p.id, "blurb", p.blurb, locale)}
                    </span>
                  </Chip>
                ))}
              </div>
            </section>

            <section id="section-3" className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
                <span className="section-number" aria-hidden>
                  3
                </span>
                <Sparkles className="size-4" /> {t("step_domain", locale)}
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DOMAINS.map((d) => (
                  <Chip
                    key={d.id}
                    on={s.domain === d.id}
                    onClick={() => {
                      setS((prev) => {
                        if (d.id !== "math") return { ...prev, domain: d.id };
                        const stripped = prev.methods.filter(
                          (id) =>
                            id !== "heretic" &&
                            id !== "domain-ablate" &&
                            id !== "gabliteration" &&
                            id !== "failspy" &&
                            id !== "deccp" &&
                            id !== "erisforge" &&
                            id !== "apostate" &&
                            id !== "abliterix" &&
                            id !== "ablate" &&
                            id !== "jwest" &&
                            id !== "llmabliterate" &&
                            id !== "unfetter" &&
                            id !== "obliteratus",
                        );
                        return {
                          ...prev,
                          domain: d.id,
                          methods: stripped.length ? stripped : ["quant"],
                        };
                      });
                    }}
                  >
                    <span className="block font-semibold">
                      {chipCopy("domain", d.id, "title", d.title, locale)}
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {chipCopy("domain", d.id, "note", d.note, locale)}
                    </span>
                  </Chip>
                ))}
              </div>
            </section>

            <section id="section-4" className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
                <span className="section-number" aria-hidden>
                  4
                </span>
                <Bookmark className="size-4" /> {t("step_presets", locale)}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {PRESETS.length > 0 &&
                  PRESETS.map((p) => (
                    <Chip
                      key={p.id}
                      on={presetActive(p.id, s)}
                      onClick={() =>
                        setS((prev) => ({
                          ...prev,
                          ...applyPreset(p.id),
                          modelSource: "catalog",
                          hfRepo: "",
                          localPath: "",
                          apiModel: "",
                          methodParams: cloneParams(DEFAULT_METHOD_PARAMS),
                        }))
                      }
                    >
                      <span className="block font-semibold text-fg">
                        {locale === "en" ? p.titleEn : p.title}
                      </span>{" "}
                      <span className="mt-1 block text-xs leading-snug text-muted">
                        {locale === "en" ? p.blurbEn : p.blurb}
                      </span>
                      <span className="mt-2 block font-mono text-[11px] text-subtle">
                        {locale === "en" ? p.metaEn : p.meta}
                      </span>
                    </Chip>
                  ))}
              </div>
            </section>

            <section id="section-5" className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
                <span className="section-number" aria-hidden>
                  5
                </span>
                <Zap className="size-4" /> {t("methods_multi", locale)}
              </h2>
              <div className="space-y-3">
                {METHOD_FAMILIES.map((fam) => {
                  if (fam.id === "reuse") {
                    return (
                      <div key={fam.id} data-method-family="reuse" className="method-family">
                        <h3>{t("fam_reuse", locale)}</h3>
                        <p className="text-xs leading-relaxed text-muted">
                          {t("fam_reuse_hint", locale)}
                        </p>
                      </div>
                    );
                  }
                  const members = methods.filter((m) => fam.ids.includes(m.id));
                  const shown = members.filter((m) => !FOLDED.has(m.id));
                  const folded = members.filter((m) => FOLDED.has(m.id));
                  if (!shown.length && !folded.length) return null;
                  return (
                    <div key={fam.id} data-method-family={fam.id} className="method-family">
                      <h3>{t(FAM_TITLE[fam.id], locale)}</h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {shown.map((m) => (
                          <Chip
                            key={m.id}
                            on={s.methods.includes(m.id)}
                            onClick={() => toggle("methods", m.id)}
                          >
                            <span className="block font-semibold">
                              {chipCopy("method", m.id, "title", m.title, locale)}
                            </span>
                            <span className="mt-1 block text-xs text-muted">
                              {chipCopy("method", m.id, "blurb", m.blurb, locale)}
                            </span>
                          </Chip>
                        ))}
                      </div>
                      {folded.length ? (
                        <details className="method-folded">
                          <summary>{t("fam_folded", locale)}</summary>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {folded.map((m) => (
                              <Chip
                                key={m.id}
                                on={s.methods.includes(m.id)}
                                onClick={() => toggle("methods", m.id)}
                              >
                                <span className="block font-semibold">
                                  {chipCopy("method", m.id, "title", m.title, locale)}
                                </span>
                                <span className="mt-1 block text-xs text-muted">
                                  {chipCopy("method", m.id, "blurb", m.blurb, locale)}
                                </span>
                              </Chip>
                            ))}
                          </div>
                        </details>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              {showParams ? (
                <div className="space-y-4 rounded-sm border border-border bg-surface p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">
                    {t("method_params", locale)}
                  </p>
                  {showHeretic ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-fg">
                        {t("param_group_heretic", locale)}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Field label={t("fld_n_trials", locale)} htmlFor="studio-heretic-n_trials">
                          <NumInput
                            id="studio-heretic-n_trials"
                            value={mp.heretic.n_trials}
                            onChange={(n) =>
                              patchParams({ heretic: { ...mp.heretic, n_trials: n } })
                            }
                          />
                        </Field>
                        <Field
                          label={t("fld_max_weight", locale)}
                          htmlFor="studio-heretic-max_weight"
                        >
                          <NumInput
                            id="studio-heretic-max_weight"
                            value={mp.heretic.max_weight}
                            step="0.05"
                            onChange={(n) =>
                              patchParams({ heretic: { ...mp.heretic, max_weight: n } })
                            }
                          />
                        </Field>
                        <Field
                          label={t("fld_direction_index", locale)}
                          htmlFor="studio-heretic-direction_index"
                        >
                          <NumInput
                            id="studio-heretic-direction_index"
                            value={mp.heretic.direction_index}
                            onChange={(n) =>
                              patchParams({ heretic: { ...mp.heretic, direction_index: n } })
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  ) : null}
                  {showApostate ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-fg">
                        {t("param_group_apostate", locale)}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Chip
                          on={mp.apostate.method === "diode"}
                          onClick={() =>
                            patchParams({ apostate: { ...mp.apostate, method: "diode" } })
                          }
                        >
                          {t("apostate_diode", locale)}
                        </Chip>
                        <Chip
                          on={mp.apostate.method === "kcrn"}
                          onClick={() =>
                            patchParams({ apostate: { ...mp.apostate, method: "kcrn" } })
                          }
                        >
                          {t("apostate_kcrn", locale)}
                        </Chip>
                      </div>
                    </div>
                  ) : null}
                  {showLora ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-fg">
                        {t("param_group_lora", locale)}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label={t("fld_lora_r", locale)} htmlFor="studio-lora-r">
                          <NumInput
                            id="studio-lora-r"
                            value={mp.lora.r}
                            onChange={(n) => patchParams({ lora: { ...mp.lora, r: n } })}
                          />
                        </Field>
                        <Field label={t("fld_lora_alpha", locale)} htmlFor="studio-lora-alpha">
                          <NumInput
                            id="studio-lora-alpha"
                            value={mp.lora.alpha}
                            onChange={(n) => patchParams({ lora: { ...mp.lora, alpha: n } })}
                          />
                        </Field>
                        <Field label={t("fld_lr", locale)} htmlFor="studio-lora-lr">
                          <NumInput
                            id="studio-lora-lr"
                            value={mp.lora.lr}
                            step="any"
                            onChange={(n) => patchParams({ lora: { ...mp.lora, lr: n } })}
                          />
                        </Field>
                        <Field label={t("fld_epochs", locale)} htmlFor="studio-lora-epochs">
                          <NumInput
                            id="studio-lora-epochs"
                            value={mp.lora.epochs}
                            onChange={(n) => patchParams({ lora: { ...mp.lora, epochs: n } })}
                          />
                        </Field>
                      </div>
                    </div>
                  ) : null}
                  {showQuant ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-fg">{t("quant_imatrix", locale)}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(["Q4_K_M", "Q5_K_M", "Q8_0"] as const).map((q) => (
                          <Chip key={q} on={mp.imatrix.quant === q} onClick={() => pickQuant(q)}>
                            {q}
                          </Chip>
                        ))}
                      </div>
                      <Field label={t("fld_ctx", locale)} htmlFor="studio-imatrix-ctx">
                        <NumInput
                          id="studio-imatrix-ctx"
                          value={mp.imatrix.ctx}
                          onChange={(n) => patchParams({ imatrix: { ...mp.imatrix, ctx: n } })}
                        />
                      </Field>
                    </div>
                  ) : null}
                  {showCast ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-fg">
                        {t("param_group_cast", locale)}
                      </p>
                      <Field label={t("fld_coeff", locale)} htmlFor="studio-cast-coeff">
                        <NumInput
                          id="studio-cast-coeff"
                          value={mp.cast.coeff}
                          step="0.05"
                          onChange={(n) => patchParams({ cast: { ...mp.cast, coeff: n } })}
                        />
                      </Field>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section id="section-6" className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
                <span className="section-number" aria-hidden>
                  6
                </span>
                <Cloud className="size-4" /> {t("step_compute", locale)}
              </h2>
              {computeRuntimeKind(s.compute) === "pack-only" ? (
                <p className="text-xs text-muted">
                  {t("wf_compute_pack_only", locale).replace("{id}", s.compute)}
                </p>
              ) : computeRuntimeKind(s.compute) === "create" ? (
                <p className="text-xs text-muted">
                  {t("wf_compute_create", locale).replace("{id}", s.compute)}
                </p>
              ) : null}
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {COMPUTES.map((c) => {
                  const packOnly = computeRuntimeKind(c.id) === "pack-only";
                  return (
                    <Chip
                      key={c.id}
                      on={s.compute === c.id}
                      warn={packOnly}
                      onClick={() => set("compute", c.id)}
                    >
                      <span className="block font-mono text-xs text-fg">{c.id}</span>
                    </Chip>
                  );
                })}
              </div>
            </section>

            <section id="section-7" className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
                <span className="section-number" aria-hidden>
                  7
                </span>
                <FolderLock className="size-4" /> {t("step_storage", locale)}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {(
                  [
                    [t("store_base", locale), "storeBase", "storeBaseUri"],
                    [t("store_dataset", locale), "storeData", "storeDataUri"],
                    [t("store_artifacts", locale), "storeOut", "storeOutUri"],
                  ] as const
                ).map(([lab, sk, uk]) => (
                  <div
                    key={sk}
                    className="space-y-2 rounded-sm border border-border bg-surface p-3"
                  >
                    <label htmlFor={`studio-${sk}-uri`} className="text-xs font-bold text-muted">
                      {lab}
                    </label>
                    <div className="grid gap-1">
                      {STORES.map((st) => (
                        <Chip key={st.id} on={s[sk] === st.id} onClick={() => set(sk, st.id)}>
                          {chipCopy("store", st.id, "title", st.title, locale)}
                        </Chip>
                      ))}
                    </div>
                    <input
                      id={`studio-${sk}-uri`}
                      className={inputCls}
                      aria-label={`${lab} ${t("path_suffix", locale)}`}
                      placeholder={storePlaceholder(s[sk], locale)}
                      value={s[uk]}
                      onChange={(e) => set(uk, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div data-provenance className="provenance-grid" role="group" aria-label={t("prov_uri", locale)}>
                <p>
                  <span>{t("prov_uri", locale)}</span>
                  {s.storeDataUri || "—"}
                </p>
                <p>
                  <span>{t("prov_rev", locale)}</span>
                  {s.datasetRevision || "—"}
                </p>
                <p>
                  <span>{t("prov_license", locale)}</span>
                  {s.datasetLicense || "LICENSE_UNCHECKED"}
                </p>
                <p>
                  <span>{t("prov_sha", locale)}</span>
                  {s.datasetChecksum || t("prov_unverified", locale)}
                </p>
              </div>
            </section>

            <section id="section-8" className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
                <span className="section-number" aria-hidden>
                  8
                </span>
                <Box className="size-4" /> {t("step_outputs", locale)}
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {OUTPUTS.map((o) => (
                  <Chip
                    key={o.id}
                    on={s.outputs.includes(o.id)}
                    onClick={() => toggle("outputs", o.id)}
                  >
                    {chipCopy("output", o.id, "title", o.title, locale)}
                  </Chip>
                ))}
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <Field label={t("label_job_name", locale)} htmlFor="studio-job-name">
                <input
                  id="studio-job-name"
                  className={inputCls}
                  value={s.project}
                  onChange={(e) => set("project", e.target.value)}
                />
              </Field>
              <Field label={t("label_notes", locale)} htmlFor="studio-notes">
                <input
                  id="studio-notes"
                  className={inputCls}
                  value={s.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </Field>
            </section>

            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
                <Save className="size-4" /> {t("saved_configs", locale)}
              </h2>
              <p className="text-xs leading-relaxed text-muted">
                {t("saved_configs_blurb", locale)}
              </p>
              {storageError && (
                <p id="storage-error" role="alert" className="text-sm text-danger">
                  {storageError}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-shortcut="save"
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                  onClick={() => handleSave()}
                >
                  <Save className="size-4" /> {t("save_current", locale)}
                </button>
                <button
                  type="button"
                  className="btn-ghost inline-flex items-center gap-2 text-sm"
                  onClick={() => setPendingConfirm({ kind: "reset" })}
                  title={t("reset_title", locale)}
                  aria-label={t("reset", locale)}
                >
                  <RotateCcw className="size-4" /> {t("reset", locale)}
                </button>
                {jobs.length > 0 && (
                  <button
                    type="button"
                    className="btn-ghost inline-flex items-center gap-2 text-sm text-danger"
                    onClick={() => setPendingConfirm({ kind: "clear-all" })}
                    title={t("delete_all_title", locale)}
                    aria-label={t("delete_all_aria", locale)}
                  >
                    <Trash2 className="size-4" /> {t("delete_all", locale)}
                  </button>
                )}
              </div>
              {jobs.length > 0 && (
                <input
                  className={inputCls}
                  aria-label={t("search_saved_aria", locale)}
                  placeholder={t("search_saved_ph", locale)}
                  value={jobQuery}
                  onChange={(e) => setJobQuery(e.target.value)}
                />
              )}
              {jobs.length === 0 ? (
                <p className="text-xs text-muted">{t("no_saved", locale)}</p>
              ) : (
                <ul className="space-y-2">
                  {visibleJobs.length === 0 && (
                    <li className="text-sm text-muted">{t("no_saved_match", locale)}</li>
                  )}
                  {visibleJobs.map((j) => (
                    <li
                      key={j.id}
                      className="flex flex-wrap items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2"
                    >
                      <button
                        type="button"
                        className="min-h-11 min-w-0 flex-1 text-left"
                        onClick={() => {
                          const loaded = loadJob(j.id);
                          if (loaded) setS(hydrateJob(loaded));
                        }}
                      >
                        <span className="block truncate text-sm font-semibold text-fg">
                          {j.name}
                        </span>
                        <span className="block text-xs text-muted">
                          {new Date(j.savedAt).toLocaleString(locale === "en" ? "en-US" : "ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm text-muted hover:text-fg"
                        title={t("duplicate", locale)}
                        aria-label={t("duplicate", locale)}
                        onClick={() => handleDuplicate(j.id)}
                      >
                        <CopyPlus className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm text-muted hover:text-danger"
                        title={t("delete", locale)}
                        aria-label={t("delete", locale)}
                        onClick={() => setPendingConfirm({ kind: "delete", id: j.id })}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside id="studio-summary" className="result-rail space-y-3">
            <div className="result-actions">
              <button
                type="button"
                data-shortcut="download"
                className="btn-primary btn-lg w-full text-sm font-bold"
                onClick={() => handleDownload()}
                disabled={packBlocked}
              >
                <Download className="size-5" aria-hidden />
                {t("pack_zip", locale)}
              </button>
              <button
                type="button"
                data-shortcut="save"
                className="btn-secondary w-full text-sm"
                onClick={handleSave}
              >
                <Save className="size-4" aria-hidden />
                {t("save_current", locale)}
              </button>
              <p className={`result-action-status ${packBlocked ? "text-danger" : "text-muted"}`}>
                <span
                  className="status-dot"
                  data-state={packBlocked ? "danger" : "ok"}
                  aria-hidden
                />
                {packBlocked ? t("toast_pack_blocked_body", locale) : t("pack_zip_blurb", locale)}
              </p>
            </div>
            <div className="panel rounded-lg p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                {t("summary_title", locale)}
              </p>
              <p className="mt-2 text-base font-bold leading-snug">
                {chipCopy("purpose", s.purpose, "title", s.purpose, locale)}
                {" · "}
                {chipCopy("domain", s.domain, "title", s.domain, locale)}
                {" · "}
                {s.gpu || s.compute}
              </p>
              <p className="mt-1 break-all font-mono text-xs text-accent">{pull}</p>
              <p className="text-xs text-muted">
                {catalogIsReuse({ id: s.base, name: pull })
                  ? t("ms_catalog_reuse", locale)
                  : t("ms_catalog_work", locale)}
              </p>
              <p className="mt-2 text-xs text-muted">{t("summary_no_quote", locale)}</p>
            </div>
            <WorkflowAudit s={s as StudioState} />
            <div className="panel rounded-lg p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                  {t("power_title", locale)}
                </p>
                <button
                  type="button"
                  className="btn-ghost btn-sm inline-flex items-center gap-1 text-xs font-semibold text-accent"
                  onClick={() => navigator.clipboard.writeText(pack.prompts.power)}
                >
                  <Copy className="size-3.5" /> {t("power_only", locale)}
                </button>
              </div>
              <pre
                tabIndex={0}
                className="max-h-32 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-accent"
              >
                {pack.prompts.power}
              </pre>
            </div>
            <div className="panel rounded-lg p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                  <MessageSquare className="size-4" /> {t("system_title", locale)}
                </p>
                <button
                  type="button"
                  className="btn-ghost btn-sm inline-flex items-center gap-1 text-xs font-semibold text-accent"
                  onClick={() => navigator.clipboard.writeText(pack.prompts.system)}
                >
                  <Copy className="size-3.5" /> {t("copy", locale)}
                </button>
              </div>
              <pre
                tabIndex={0}
                className="max-h-48 overflow-auto whitespace-pre-wrap code-block text-xs leading-relaxed"
              >
                {pack.prompts.system}
              </pre>
            </div>
            <div className="panel rounded-lg p-3">
              <Field label={t("user_prompt", locale)} htmlFor="studio-user-prompt">
                <textarea
                  id="studio-user-prompt"
                  className={`${inputCls} min-h-28 h-auto py-2`}
                  value={s.systemUser ?? ""}
                  onChange={(e) => set("systemUser", e.target.value)}
                  placeholder={t("user_prompt_ph", locale)}
                />
              </Field>
            </div>
            <div className="panel rounded-lg p-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                <Terminal className="size-4" /> run.sh
              </p>
              <pre
                tabIndex={0}
                className="max-h-64 overflow-auto whitespace-pre-wrap break-all code-block text-xs leading-relaxed"
              >
                {pack.sh}
              </pre>
            </div>
          </aside>
        </div>
      </section>
      <section
        id="workspace-explore"
        role="tabpanel"
        aria-labelledby="workspace-tab-explore"
        hidden={workspace !== "explore"}
        inert={workspace !== "explore" ? true : undefined}
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <Recommendations
            selected={s.modelSource === "catalog" ? s.base : ""}
            onSelect={(base) => {
              const card = BASES.find((b) => b.id === base);
              const reuse = card ? catalogIsReuse(card) : false;
              const derived = classifyDerived(`${base} ${card?.name ?? ""}`);
              const path = recommendPath({
                derived,
                gguf: /gguf/i.test(`${base} ${card?.name ?? ""}`),
              });
              setS((prev) => ({
                ...prev,
                base,
                modelSource: "catalog",
                baseVram: "",
                hfRepo: hfRepoFromCatalog(base),
                storeBase: "hf",
                storeBaseUri: hfRepoFromCatalog(base),
                methods: reuse ? path.methods : prev.methods,
                outputs: reuse ? path.outputs : prev.outputs,
                purpose: reuse ? path.purpose : prev.purpose,
              }));
            }}
            onApplyGolden={(next) =>
              setS((prev) => ({
                ...prev,
                base: next.base,
                purpose: next.purpose,
                methods: next.methods,
                modelSource: next.modelSource,
                outputs: next.outputs,
                baseVram: "",
              }))
            }
            onApplyHub={(next) =>
              setS((prev) => ({
                ...prev,
                modelSource: "hf",
                hfRepo: next.hfRepo,
                methods: next.methods,
                outputs: next.outputs,
                purpose: next.purpose,
                baseVram: "",
              }))
            }
          />
          <SourceHub onSelect={applySource} />
        </div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div className="panel rounded-lg p-4">
            <BenchRunner />
          </div>
          <div className="panel rounded-lg p-4">
            <LoggingPanel />
          </div>
        </div>
      </section>
      <section
        id="workspace-connect"
        role="tabpanel"
        aria-labelledby="workspace-tab-connect"
        hidden={workspace !== "connect"}
        inert={workspace !== "connect" ? true : undefined}
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <ProviderConnections />
          <div className="panel rounded-lg">
            <ConnectionWizard hideApiKey />
          </div>
          <div className="panel rounded-lg">
            <JobCommandCenter />
          </div>
          <StorageSettings />
          <SshConnection />
        </div>
      </section>
      <Dialog
        open={pendingConfirm !== null}
        onClose={() => setPendingConfirm(null)}
        title={
          pendingConfirm?.kind === "clear-all"
            ? t("delete_all", locale)
            : pendingConfirm?.kind === "delete"
              ? t("delete", locale)
              : t("reset", locale)
        }
        description={
          pendingConfirm?.kind === "clear-all"
            ? t("delete_all_confirm", locale)
            : pendingConfirm?.kind === "delete"
              ? t("delete_confirm", locale)
              : t("reset_confirm", locale)
        }
      >
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn-ghost min-h-11"
            onClick={() => setPendingConfirm(null)}
          >
            {t("confirm_cancel", locale)}
          </button>
          <button
            type="button"
            className={`btn-secondary min-h-11${pendingConfirm?.kind === "reset" ? "" : " text-danger"}`}
            onClick={() => {
              const next = pendingConfirm;
              setPendingConfirm(null);
              if (next?.kind === "clear-all") handleClearAll();
              else if (next?.kind === "delete") handleDelete(next.id);
              else if (next?.kind === "reset") handleReset();
            }}
          >
            {pendingConfirm?.kind === "clear-all"
              ? t("delete_all", locale)
              : pendingConfirm?.kind === "delete"
                ? t("delete", locale)
                : t("reset", locale)}
          </button>
        </div>
      </Dialog>
    </>
  );
}
