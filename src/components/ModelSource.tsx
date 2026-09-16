import { useRef, useState } from "react";
import { timed } from "@/lib/provider-log";
import { AlertTriangle, Globe, HardDrive, Library, LoaderCircle, Search } from "lucide-react";
import { BASES, type StudioState } from "@/lib/studio";
import {
  MODEL_SOURCES,
  baseVramGb,
  isHfRepoId,
  modelSourceOf,
  normalizeHfRepo,
  resolveBasePull,
  type ModelSourceId,
} from "@/lib/model-source";
import { HUB_ERROR, inspectHfModel, searchHfModels, type HubModel } from "@/lib/model-hub";
import { COMPAT_ERROR, listCompatModelsClient, type CompatModel } from "@/lib/compat-api";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { t, useLocale, type TranslationKey } from "@/lib/i18n";
import { catalogIsReuse, classifyDerived, recommendPath } from "@/lib/size-bands";

const inputCls = "input-shell text-sm";

function SourceIcon({ id }: { id: ModelSourceId }) {
  const cls = "size-4";
  if (id === "hf") return <Globe className={cls} aria-hidden />;
  if (id === "local") return <HardDrive className={cls} aria-hidden />;
  if (id === "api") return <Search className={cls} aria-hidden />;
  return <Library className={cls} aria-hidden />;
}

function inspectMessage(e: unknown, locale: ReturnType<typeof useLocale>[0]): string {
  const code = e instanceof Error ? e.message : "";
  if (code === HUB_ERROR.repo) return t("ms_err_owner_name", locale);
  if (code === HUB_ERROR.empty) return t("ms_err_card", locale);
  if (code === HUB_ERROR.size) return t("ms_err_hub_size", locale);
  if (code === HUB_ERROR.body) return t("ms_err_hub_body", locale);
  if (code === HUB_ERROR.network) return t("ms_err_hub", locale);
  if (code.startsWith(`${HUB_ERROR.http} `) || code === HUB_ERROR.http) {
    const status = code.slice(HUB_ERROR.http.length).trim();
    return t("ms_err_api_http", locale).replace("{status}", status || "?");
  }
  return t("ms_err_hub", locale);
}

function apiListMessage(e: unknown, locale: ReturnType<typeof useLocale>[0]): string {
  const code = e instanceof Error ? e.message : "";
  if (code === COMPAT_ERROR.url) return t("ms_err_api_url", locale);
  if (code === COMPAT_ERROR.network) {
    return t("ms_err_api_cors", locale).replace("{msg}", t("ms_err_api_list", locale));
  }
  const http = /^COMPAT_HTTP (\d+)/.exec(code);
  if (http) {
    return t("ms_err_api_cors", locale).replace(
      "{msg}",
      t("ms_err_api_http", locale).replace("{status}", http[1]),
    );
  }
  return t("ms_err_api_list", locale);
}

const SRC_COPY: Record<ModelSourceId, { title: TranslationKey; blurb: TranslationKey }> = {
  catalog: { title: "ms_src_catalog", blurb: "ms_src_catalog_blurb" },
  hf: { title: "ms_src_hf", blurb: "ms_src_hf_blurb" },
  local: { title: "ms_src_local", blurb: "ms_src_local_blurb" },
  api: { title: "ms_src_api", blurb: "ms_src_api_blurb" },
};

export function ModelSource({
  s,
  setS,
  ramCap,
  ramMismatch,
  altBases,
  onQuantQ4,
}: {
  s: StudioState;
  setS: (fn: (prev: StudioState) => StudioState) => void;
  ramCap: number;
  ramMismatch: boolean;
  altBases: { id: string; name: string; vram: number }[];
  onQuantQ4: () => void;
}) {
  const [locale] = useLocale();
  const src = modelSourceOf(s);
  const pull = resolveBasePull(s);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<HubModel[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [apiModels, setApiModels] = useState<CompatModel[]>([]);
  const apiListCtrl = useRef<AbortController | null>(null);

  function setSource(id: ModelSourceId) {
    setS((prev) => {
      if (id === "hf") {
        return {
          ...prev,
          modelSource: id,
          storeBase: "hf",
          storeBaseUri: prev.hfRepo || prev.storeBaseUri,
        };
      }
      if (id === "local") {
        return {
          ...prev,
          modelSource: id,
          storeBase: "local",
          storeBaseUri: prev.localPath || prev.storeBaseUri,
        };
      }
      if (id === "api") {
        return {
          ...prev,
          modelSource: id,
          apiBaseUrl: prev.apiBaseUrl || "http://127.0.0.1:11434/v1",
        };
      }
      return { ...prev, modelSource: "catalog" };
    });
    setErr(null);
  }

  function pickCatalog(id: string) {
    const card = BASES.find((b) => b.id === id);
    const reuse = card ? catalogIsReuse(card) : false;
    const derived = classifyDerived(`${id} ${card?.name ?? ""}`);
    const path = recommendPath({
      derived,
      gguf: /gguf/i.test(`${id} ${card?.name ?? ""}`),
    });
    setS((prev) => ({
      ...prev,
      modelSource: "catalog",
      base: id,
      storeBase: "hf",
      storeBaseUri: "",
      methods: reuse ? path.methods : prev.methods.length ? prev.methods : path.methods,
      outputs: reuse ? path.outputs : prev.outputs,
      purpose: reuse ? path.purpose : prev.purpose,
    }));
  }

  function applyHf(id: string, gguf?: boolean) {
    const repo = normalizeHfRepo(id);
    setS((prev) => ({
      ...prev,
      modelSource: "hf",
      hfRepo: repo,
      base: "custom",
      storeBase: "hf",
      storeBaseUri: repo,
      notes: gguf ? [prev.notes, t("ms_note_gguf", locale)].filter(Boolean).join("\n") : prev.notes,
    }));
  }

  async function runSearch() {
    const q = query.trim();
    if (!q) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await timed("hf", "huggingface.co/api/models", () =>
        searchHfModels({ data: { q, limit: 20 } }),
      );
      setHits(res.models);
      if (!res.models.length) setErr(t("ms_err_empty_search", locale));
    } catch (e) {
      setErr(inspectMessage(e, locale));
      setHits([]);
    } finally {
      setBusy(false);
    }
  }

  async function runInspect() {
    const id = normalizeHfRepo(s.hfRepo || query);
    if (!isHfRepoId(id)) {
      setErr(t("ms_err_owner_name", locale));
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const card = await timed(
        "hf",
        `huggingface.co/api/models/${id}`,
        () => inspectHfModel({ data: { id } }),
        { modelId: id },
      );
      applyHf(card.id, card.gguf);
      setHits((prev) => {
        const rest = prev.filter((m) => m.id !== card.id);
        return [card, ...rest];
      });
    } catch (e) {
      setErr(inspectMessage(e, locale));
    } finally {
      setBusy(false);
    }
  }

  async function runApiList() {
    const baseUrl = (s.apiBaseUrl || "").trim();
    if (!baseUrl) {
      setErr(t("ms_err_no_api_url", locale));
      return;
    }
    setBusy(true);
    setErr(null);
    apiListCtrl.current?.abort();
    const ctrl = new AbortController();
    apiListCtrl.current = ctrl;
    try {
      const local = await timed("api", new URL(baseUrl).origin, () =>
        listCompatModelsClient(baseUrl, apiKey, ctrl.signal),
      );
      if (ctrl.signal.aborted) return;
      setApiModels(local);
      if (!local.length) setErr(t("ms_err_empty_list", locale));
    } catch (e) {
      if (ctrl.signal.aborted || (e instanceof Error && e.name === "AbortError")) return;
      setErr(apiListMessage(e, locale));
      setApiModels([]);
    } finally {
      if (apiListCtrl.current === ctrl) setBusy(false);
    }
  }

  return (
    <div className="space-y-3" data-model-source>
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted">
        <span className="section-number" aria-hidden>
          1
        </span>
        <Library className="size-4" /> {t("ms_title", locale)}
      </h2>
      <p className="text-xs leading-relaxed text-muted">{t("ms_blurb", locale)}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {MODEL_SOURCES.map((m) => (
          <Chip key={m.id} on={src === m.id} onClick={() => setSource(m.id)}>
            <span className="flex items-center gap-2 font-semibold text-fg">
              <SourceIcon id={m.id} /> {t(SRC_COPY[m.id].title, locale)}
            </span>
            <span className="mt-1 block text-xs leading-snug text-muted">
              {t(SRC_COPY[m.id].blurb, locale)}
            </span>
          </Chip>
        ))}
      </div>

      {src === "hf" && !s.hfRepo.trim() ? (
        <div role="status" data-hf-empty className="banner-warn">
          <p>{t("ms_hf_empty", locale)}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 items-center px-3 text-sm"
              onClick={() => setSource("catalog")}
            >
              {t("ms_hf_empty_catalog", locale)}
            </button>
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 items-center px-3 text-sm"
              onClick={() => document.getElementById("hfRepo")?.focus()}
            >
              {t("ms_hf_empty_paste", locale)}
            </button>
          </div>
        </div>
      ) : (
        <p className="font-mono text-xs text-accent">
          {t("ms_current", locale)} {pull}
        </p>
      )}

      {src === "catalog" ? (
        <div className="grid gap-3">
          {(
            [
              ["work", BASES.filter((b) => !catalogIsReuse(b))],
              ["reuse", BASES.filter((b) => catalogIsReuse(b))],
            ] as const
          ).map(([lane, rows]) => (
            <div key={lane} data-catalog-lane={lane} className="grid gap-2">
              <p className="text-xs font-semibold text-muted">
                {t(lane === "work" ? "ms_catalog_work" : "ms_catalog_reuse", locale)}
              </p>
              {rows.map((b) => (
                <Chip
                  key={b.id}
                  on={s.base === b.id && src === "catalog"}
                  warn={lane === "reuse"}
                  onClick={() => pickCatalog(b.id)}
                >
                  <span className="break-all font-mono text-xs">{b.name}</span>{" "}
                  <span className="ml-2 text-xs text-muted">
                    {t("ms_vram_class", locale).replace("{n}", String(b.vram))}
                    {" · "}
                    {t(lane === "work" ? "ms_derived_base" : "ms_derived_done", locale)}
                  </span>
                </Chip>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {src === "hf" ? (
        <div className="space-y-3 rounded-sm border border-border bg-surface p-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto] items-end">
            <Field label={t("ms_label_query", locale)} htmlFor="hfQuery">
              <input
                id="hfQuery"
                className={inputCls}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("ms_ph_query", locale)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void runSearch();
                }}
              />
            </Field>
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm"
              onClick={() => void runSearch()}
              disabled={busy}
            >
              {busy ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
              ) : (
                <Search className="size-4" aria-hidden />
              )}
              {t("ms_search", locale)}
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto] items-end">
            <Field label={t("ms_label_repo", locale)} htmlFor="hfRepo">
              <input
                id="hfRepo"
                className={inputCls}
                value={s.hfRepo}
                onChange={(e) =>
                  setS((prev) => {
                    const repo = normalizeHfRepo(e.target.value);
                    return {
                      ...prev,
                      hfRepo: e.target.value,
                      storeBase: "hf",
                      storeBaseUri: repo,
                      base: "custom",
                    };
                  })
                }
                placeholder={t("ms_ph_repo", locale)}
              />
            </Field>
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm"
              onClick={() => void runInspect()}
              disabled={busy}
            >
              {t("ms_load", locale)}
            </button>
          </div>
          <Field label={t("ms_label_rev", locale)} htmlFor="hfRevision">
            <input
              id="hfRevision"
              className={inputCls}
              value={s.hfRevision}
              onChange={(e) => setS((prev) => ({ ...prev, hfRevision: e.target.value }))}
              placeholder={t("ms_ph_rev", locale)}
            />
          </Field>
          <p className="text-xs text-muted">{t("ms_gate_token", locale)}</p>
          {hits.length ? (
            <ul tabIndex={0} className="max-h-64 space-y-1 overflow-auto">
              {hits.map((m) => (
                <li key={m.id}>
                  <Chip
                    on={normalizeHfRepo(s.hfRepo) === m.id}
                    onClick={() => applyHf(m.id, m.gguf)}
                  >
                    <span className="block break-all font-mono text-xs">{m.id}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {m.pipeline ?? t("ms_chip_model", locale)}
                      {m.gguf ? ` · ${t("ms_chip_gguf", locale)}` : ""}
                      {m.gated ? ` · ${t("ms_chip_gated", locale)}` : ""}
                      {m.downloads ? ` · ↓${m.downloads.toLocaleString("en")}` : ""}
                    </span>
                  </Chip>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {src === "local" ? (
        <div className="space-y-3 rounded-sm border border-border bg-surface p-3">
          <p className="text-xs leading-relaxed text-muted">{t("ms_path_blurb", locale)}</p>
          <Field label={t("ms_label_weights", locale)} htmlFor="localPath">
            <input
              id="localPath"
              className={inputCls}
              value={s.localPath}
              onChange={(e) =>
                setS((prev) => ({
                  ...prev,
                  localPath: e.target.value,
                  storeBase: "local",
                  storeBaseUri: e.target.value,
                  base: "custom",
                }))
              }
              placeholder={t("ms_ph_path", locale)}
            />
          </Field>
        </div>
      ) : null}

      {src === "api" ? (
        <div className="space-y-3 rounded-sm border border-border bg-surface p-3">
          <p className="text-xs leading-relaxed text-muted">{t("ms_api_blurb", locale)}</p>
          <Field label={t("ms_label_base_url", locale)} htmlFor="apiBaseUrl">
            <input
              id="apiBaseUrl"
              className={inputCls}
              value={s.apiBaseUrl}
              onChange={(e) => setS((prev) => ({ ...prev, apiBaseUrl: e.target.value }))}
              placeholder={t("ms_ph_api", locale)}
            />
          </Field>
          <Field label={t("ms_label_model", locale)} htmlFor="apiModel">
            <input
              id="apiModel"
              className={inputCls}
              value={s.apiModel}
              onChange={(e) =>
                setS((prev) => ({
                  ...prev,
                  apiModel: e.target.value,
                  base: "custom",
                }))
              }
              placeholder={t("ms_ph_model", locale)}
            />
          </Field>
          <Field label={t("ms_api_key_label", locale)} htmlFor="apiKey">
            <input
              id="apiKey"
              className={inputCls}
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </Field>
          <button
            type="button"
            className="btn-secondary inline-flex min-h-11 items-center gap-2 px-4 text-sm"
            onClick={() => void runApiList()}
            disabled={busy}
          >
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : (
              <Search className="size-4" aria-hidden />
            )}
            {t("ms_model_list", locale)}
          </button>
          {apiModels.length ? (
            <div className="grid gap-1">
              {apiModels.slice(0, 40).map((m) => (
                <Chip
                  key={m.id}
                  on={s.apiModel === m.id}
                  onClick={() => setS((prev) => ({ ...prev, apiModel: m.id, base: "custom" }))}
                >
                  <span className="font-mono text-xs">{m.id}</span>
                </Chip>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {src !== "api" ? (
        <Field label={t("ms_est_mem", locale)} htmlFor="studio-base-vram">
          <input
            id="studio-base-vram"
            className={inputCls}
            type="number"
            min={1}
            step={1}
            value={s.baseVram}
            placeholder={String(baseVramGb(s))}
            onChange={(e) => setS((prev) => ({ ...prev, baseVram: e.target.value }))}
          />
        </Field>
      ) : null}

      {err ? (
        <p className="flex items-start gap-2 text-xs leading-relaxed text-warn">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" /> {err}
        </p>
      ) : null}

      {ramMismatch && src !== "api" ? (
        <div className="space-y-2 rounded-sm border border-border bg-elevated p-3">
          <p className="text-xs leading-relaxed text-warn">
            {t("ms_sku_note", locale)
              .replace("{base}", String(baseVramGb(s)))
              .replace("{cap}", String(ramCap))}
            {t("ms_or_q4", locale)}
          </p>
          <div className="flex flex-wrap gap-2">
            {altBases.map((b) => (
              <Chip key={b.id} on={s.base === b.id} onClick={() => pickCatalog(b.id)}>
                <span className="font-mono text-xs">{b.name}</span>{" "}
                <span className="ml-2 text-xs text-muted">{b.vram}GB</span>
              </Chip>
            ))}
            <Chip on={(s.outputs ?? []).includes("gguf-q4")} onClick={onQuantQ4}>
              Q4_K_M
            </Chip>
          </div>
        </div>
      ) : null}
    </div>
  );
}
