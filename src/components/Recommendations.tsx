import { useEffect, useMemo, useRef, useState } from "react";
import { Cpu } from "lucide-react";
import { BASES } from "@/lib/studio";
import { Field } from "@/components/ui/Field";
import {
  CATALOG_AS_OF,
  goldenStudioPatch,
  normalizeHardwareProfile,
  recommendForHardware,
  suggestGoldenWorkloads,
  type GoldenStudioPatch,
  type HardwareProfile,
  type Workload,
} from "@/lib/recommendation";
import { t, useLocale } from "@/lib/i18n";
import {
  refreshCatalogLive,
  searchHfSizeBands,
  type CatalogLiveItem,
  type HubBandCatalog,
} from "@/lib/model-hub";
import { fetchClimaxIndex, type ClimaxPull } from "@/lib/climax";
import { SIZE_BANDS, type HubBandPick, type PathAdvice } from "@/lib/size-bands";
import { isHfRepoId, normalizeHfRepo } from "@/lib/model-source";

export type HubStudioPatch = {
  hfRepo: string;
  methods: string[];
  outputs: string[];
  purpose: "abliterated" | "domain" | "pipeline";
};

export function Recommendations({
  selected,
  onSelect,
  onApplyGolden,
  onApplyHub,
}: {
  selected: string;
  onSelect: (base: string) => void;
  onApplyGolden?: (patch: GoldenStudioPatch) => void;
  onApplyHub?: (patch: HubStudioPatch) => void;
}) {
  const [locale] = useLocale();
  const labels = {
    fit: t("rec_fit", locale),
    conditional: t("rec_conditional", locale),
    "no-fit": t("rec_no_fit", locale),
    unknown: t("rec_unknown", locale),
  };
  const [hardware, setHardware] = useState<HardwareProfile>({});
  const [desktop, setDesktop] = useState(false);
  const [manual, setManual] = useState("");
  const [workload, setWorkload] = useState<Workload>("heretic");
  const [busy, setBusy] = useState(false);
  const [hubBusy, setHubBusy] = useState(false);
  const [liveBusy, setLiveBusy] = useState(false);
  const [error, setError] = useState("");
  const [hubLive, setHubLive] = useState<CatalogLiveItem[] | null>(null);
  const [hubFetchedAt, setHubFetchedAt] = useState("");
  const [bands, setBands] = useState<HubBandCatalog | null>(null);
  const [climax, setClimax] = useState<ClimaxPull | null>(null);
  const generation = useRef(0);
  useEffect(() => {
    setDesktop(Boolean(window.electron?.hardwareProfile));
  }, []);
  async function inspect() {
    const request = ++generation.current;
    setBusy(true);
    setError("");
    try {
      const value = await window.electron!.hardwareProfile!();
      if (generation.current !== request) return;
      setHardware(normalizeHardwareProfile(value));
      setManual("");
    } catch {
      if (generation.current === request) setError(t("rec_hw_fail", locale));
    } finally {
      if (generation.current === request) setBusy(false);
    }
  }
  async function pullHub() {
    const ids = BASES.map((b) => normalizeHfRepo(b.name)).filter(isHfRepoId);
    setHubBusy(true);
    setError("");
    try {
      const res = await refreshCatalogLive({ data: { ids } });
      setHubLive(res.items);
      setHubFetchedAt(res.fetchedAt);
    } catch {
      setError(t("ms_err_hub", locale));
      setHubLive(null);
    } finally {
      setHubBusy(false);
    }
  }
  async function pullLive() {
    setLiveBusy(true);
    setError("");
    try {
      const [hub, rank] = await Promise.allSettled([
        searchHfSizeBands({ data: {} }),
        fetchClimaxIndex({ data: {} }),
      ]);
      if (hub.status === "fulfilled") setBands(hub.value);
      else setBands(null);
      if (rank.status === "fulfilled") setClimax(rank.value);
      else setClimax(null);
      if (hub.status === "rejected" && rank.status === "rejected") {
        setError(t("ms_err_hub", locale));
      }
    } finally {
      setLiveBusy(false);
    }
  }
  const validManual =
    Number.isFinite(Number(manual)) && Number(manual) > 0 && Number(manual) <= 2048;
  const rows = useMemo(() => {
    const effective =
      manual !== ""
        ? validManual
          ? {
              gpus: [{ memoryBytes: Number(manual) * 1024 ** 3, memoryEvidence: "manual" }],
              memory: hardware.memory,
            }
          : {}
        : hardware;
    return recommendForHardware({ hardware: effective, models: BASES, workload });
  }, [hardware, manual, validManual, workload]);
  const gpu = hardware.gpus?.[0];
  const goldens = useMemo(() => {
    const bytes =
      manual !== ""
        ? validManual
          ? Number(manual) * 1024 ** 3
          : null
        : (hardware.gpus?.[0]?.memoryBytes ?? null);
    if (bytes === null) return [];
    return suggestGoldenWorkloads(bytes);
  }, [hardware, manual, validManual]);
  const wlLabel = (id: Workload) =>
    id === "heretic"
      ? t("rec_wl_heretic", locale)
      : id === "qlora"
        ? t("rec_wl_qlora", locale)
        : id === "lora"
          ? t("rec_wl_lora", locale)
          : id === "full"
            ? t("rec_wl_full", locale)
            : t("rec_wl_inference", locale);
  function pathLabel(kind: PathAdvice["kind"]) {
    if (kind === "reuse-gguf") return t("rec_path_reuse_gguf", locale);
    if (kind === "reuse-weights") return t("rec_path_reuse_weights", locale);
    if (kind === "ablate") return t("rec_path_ablate", locale);
    return t("rec_path_quant", locale);
  }
  function bandLabel(id: (typeof SIZE_BANDS)[number]["id"]) {
    if (id === "nano") return t("rec_band_nano", locale);
    if (id === "tiny") return t("rec_band_tiny", locale);
    if (id === "small") return t("rec_band_small", locale);
    if (id === "medium") return t("rec_band_medium", locale);
    if (id === "large") return t("rec_band_large", locale);
    if (id === "xl") return t("rec_band_xl", locale);
    return t("rec_band_xxl", locale);
  }
  function applyGolden(id: string) {
    const g = goldens.find((row) => row.id === id);
    if (!g) return;
    const patch = goldenStudioPatch(g, BASES);
    if (!patch) return;
    setWorkload(g.method);
    onApplyGolden?.(patch);
    onSelect(patch.base);
  }
  function applyHub(pick: HubBandPick) {
    onApplyHub?.({
      hfRepo: pick.id,
      methods: pick.path.methods,
      outputs: pick.path.outputs,
      purpose: pick.path.purpose,
    });
  }
  return (
    <section
      className="panel space-y-3 overflow-x-hidden rounded-lg p-4"
      aria-label={t("rec_aria", locale)}
    >
      <h2 className="flex items-center gap-2 text-sm font-bold">
        <Cpu className="size-4" />
        {t("rec_title", locale)}
      </h2>
      <p className="text-xs text-muted">{t("rec_blurb", locale)}</p>
      <p className="text-xs text-muted">
        {t("rec_catalog_asof", locale).replace("{d}", CATALOG_AS_OF)}
      </p>
      <p className="text-xs text-muted">{t("rec_hub_live_blurb", locale)}</p>
      <div className="flex flex-wrap items-end gap-3">
        {desktop && (
          <button
            type="button"
            className="btn-secondary min-h-11 px-4 text-sm"
            disabled={busy}
            onClick={() => void inspect()}
          >
            {busy ? t("rec_busy", locale) : t("rec_inspect", locale)}
          </button>
        )}
        <button
          type="button"
          className="btn-secondary min-h-11 px-4 text-sm"
          disabled={hubBusy}
          aria-label={t("rec_hub_live_aria", locale)}
          data-hub-live-btn
          onClick={() => void pullHub()}
        >
          {hubBusy ? t("rec_hub_live_busy", locale) : t("rec_hub_live", locale)}
        </button>
        <button
          type="button"
          className="btn-secondary min-h-11 px-4 text-sm"
          disabled={liveBusy}
          aria-label={t("rec_live_extract_aria", locale)}
          data-live-extract-btn
          onClick={() => void pullLive()}
        >
          {liveBusy ? t("rec_live_extract_busy", locale) : t("rec_live_extract", locale)}
        </button>
        <Field label={t("rec_manual_vram", locale)} htmlFor="rec-manual-vram">
          <input
            id="rec-manual-vram"
            className="input-shell text-sm"
            type="number"
            min="1"
            max="2048"
            value={manual}
            placeholder={t("rec_ph_vram", locale)}
            onChange={(e) => {
              generation.current++;
              setBusy(false);
              setManual(e.target.value);
            }}
          />
        </Field>
        <Field label={t("rec_workload", locale)} htmlFor="rec-workload">
          <select
            id="rec-workload"
            className="input-shell text-sm"
            value={workload}
            onChange={(e) => setWorkload(e.target.value as Workload)}
          >
            <option value="inference">{t("rec_wl_inference", locale)}</option>
            <option value="heretic">{t("rec_wl_heretic", locale)}</option>
            <option value="qlora">{t("rec_wl_qlora", locale)}</option>
            <option value="lora">{t("rec_wl_lora", locale)}</option>
            <option value="full">{t("rec_wl_full", locale)}</option>
          </select>
        </Field>
      </div>
      <p role="status" className="text-xs text-muted">
        {manual !== ""
          ? validManual
            ? t("rec_manual_ok", locale).replace("{n}", String(manual))
            : t("rec_manual_hint", locale)
          : gpu
            ? t("rec_gpu_line", locale)
                .replace("{name}", gpu.name ?? "")
                .replace(
                  "{gib}",
                  gpu.memoryBytes
                    ? (gpu.memoryBytes / 1024 ** 3).toFixed(1)
                    : t("rec_unknown_gib", locale),
                )
            : desktop
              ? t("rec_need_input", locale)
              : t("rec_web_no_vram", locale)}
      </p>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {hubLive && (
        <div>
          <p className="text-xs font-semibold" data-hub-live-status>
            {t("rec_hub_live_ok", locale).replace("{n}", String(hubLive.length))}
            {hubFetchedAt ? ` · ${hubFetchedAt.slice(0, 19)}` : ""}
          </p>
          <ul
            data-hub-live-list
            className="mt-1 max-h-40 space-y-1 overflow-y-auto text-xs text-muted"
          >
            {hubLive.map((item) => (
              <li key={item.id} data-hub-live-id={item.id} className="break-all">
                {item.id}
                {item.lastModified ? ` · ${item.lastModified.slice(0, 10)}` : ""}
                {item.gated ? ` · ${t("rec_hub_gated", locale)}` : ""}
                {item.error ? ` · ${item.error}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
      {bands && (
        <div data-hub-bands>
          <p className="text-xs font-semibold">{t("rec_bands_title", locale)}</p>
          <p className="text-xs text-muted">
            {t("rec_bands_blurb", locale)}
            {bands.fetchedAt ? ` · ${bands.fetchedAt.slice(0, 19)}` : ""}
          </p>
          <div className="mt-2 space-y-2">
            {SIZE_BANDS.map((band) => {
              const picks = bands.bands[band.id] ?? [];
              return (
                <div key={band.id} data-hub-band={band.id}>
                  <p className="text-xs font-semibold">
                    {bandLabel(band.id)} · {picks.length}
                  </p>
                  {picks.length === 0 ? (
                    <p className="text-xs text-muted">{t("rec_bands_empty", locale)}</p>
                  ) : (
                    <ul className="mt-1 space-y-1 text-xs text-muted">
                      {picks.map((pick) => (
                        <li
                          key={pick.id}
                          className="flex flex-wrap items-center justify-between gap-2"
                          data-hub-band-id={pick.id}
                        >
                          <span className="min-w-0 flex-1 break-all">
                            {pick.id} · {pick.parametersB}B · {pathLabel(pick.path.kind)}
                          </span>
                          {onApplyHub && (
                            <button
                              type="button"
                              className="btn-secondary min-h-11 px-3"
                              aria-label={t("rec_apply_hub_aria", locale).replace("{id}", pick.id)}
                              onClick={() => applyHub(pick)}
                            >
                              {t("rec_apply_hub", locale)}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {climax && (
        <div data-climax-ranks>
          <p className="text-xs font-semibold">{t("rec_climax_title", locale)}</p>
          <p className="text-xs text-muted">{t("rec_climax_blurb", locale)}</p>
          <p className="text-xs text-muted">
            {t("rec_climax_ok", locale)
              .replace("{n}", String(climax.models.filter((m) => m.rank != null).length))
              .replace("{run}", climax.run)}
            {climax.fetchedAt ? ` · ${climax.fetchedAt.slice(0, 19)}` : ""}
          </p>
          <ul className="mt-1 max-h-56 space-y-1 overflow-y-auto text-xs text-muted">
            {climax.models.map((row) => (
              <li
                key={row.slug}
                data-climax-slug={row.slug}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="min-w-0 flex-1 break-all">
                  {row.rank != null ? `#${row.rank} ` : ""}
                  {row.canonical}
                  {row.composite != null ? ` · ${row.composite.toFixed(1)}` : ""}
                  {row.ifPct != null ? ` · IF ${row.ifPct.toFixed(0)}` : ""}
                  {row.excluded ? ` · ${t("rec_climax_excluded", locale)}` : ""}
                  {` · ${t("rec_climax_api", locale)}`}
                </span>
                {onApplyHub && isHfRepoId(row.canonical) && !row.excluded && (
                  <button
                    type="button"
                    className="btn-secondary min-h-11 px-3"
                    aria-label={t("rec_apply_hub_aria", locale).replace("{id}", row.canonical)}
                    onClick={() =>
                      onApplyHub({
                        hfRepo: row.canonical,
                        methods: [],
                        outputs: ["merged-bf16"],
                        purpose: "pipeline",
                      })
                    }
                  >
                    {t("rec_climax_local", locale)}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {goldens.length > 0 && (
        <div>
          <p className="text-xs font-semibold">{t("rec_golden", locale)}</p>
          <p className="text-xs text-muted">{t("rec_golden_not_run", locale)}</p>
          <ul
            data-golden-list
            className="mt-1 max-h-40 space-y-1 overflow-y-auto text-xs text-muted"
          >
            {goldens.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {wlLabel(g.method)} · {g.paramsB}B ·{" "}
                  {t("rec_min_rec", locale)
                    .replace("{min}", String(g.minGiB))
                    .replace("{rec}", String(g.recGiB))}
                </span>
                {onApplyGolden && (
                  <button
                    type="button"
                    className="btn-secondary min-h-11 px-3"
                    data-golden={g.id}
                    aria-label={t("rec_golden_apply_aria", locale).replace("{id}", g.id)}
                    onClick={() => applyGolden(g.id)}
                  >
                    {t("rec_golden_apply", locale)}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {rows.some((row) => row.fit === "unknown") ? (
        <p data-rec-need-vram className="text-xs text-muted">
          {t("rec_need_vram_line", locale)}
        </p>
      ) : null}
      <ul className="max-h-80 overflow-x-hidden overflow-y-auto divide-y divide-border">
        {rows.map((row) => (
          <li
            key={row.model.id}
            data-recommendation={row.model.id}
            className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs"
          >
            <div className="min-w-0 flex-1">
              <p className="break-all font-semibold">{row.model.name}</p>
              {row.fit !== "unknown" ? (
              <p className="text-muted">
                {`${labels[row.fit]} · ${
                      row.requiredBytes && row.recommendedBytes
                        ? t("rec_min_rec", locale)
                            .replace("{min}", (row.requiredBytes / 1024 ** 3).toFixed(1))
                            .replace("{rec}", (row.recommendedBytes / 1024 ** 3).toFixed(1))
                        : t("rec_unknown_gib", locale)
                    }${
                      row.operations.ablation === "redundant"
                        ? ` · ${t("rec_path_reuse_weights", locale)}`
                        : ""
                    }`}
              </p>
              ) : null}
              {row.mergeRamBytes != null && (
                <p className={row.ramFit === "tight" ? "text-danger" : "text-muted"}>
                  {t("rec_merge_ram", locale).replace(
                    "{n}",
                    (row.mergeRamBytes / 1024 ** 3).toFixed(0),
                  )}
                  {row.ramFit === "tight" ? ` · ${t("rec_ram_tight", locale)}` : ""}
                </p>
              )}
            </div>
            <button
              type="button"
              className="btn-secondary min-h-11 px-3"
              aria-pressed={selected === row.model.id}
              aria-label={t("rec_apply_aria", locale).replace("{name}", row.model.name)}
              onClick={() => onSelect(row.model.id)}
            >
              {selected === row.model.id ? t("rec_selected", locale) : t("rec_apply", locale)}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">{t("rec_apply_blurb", locale)}</p>
    </section>
  );
}
