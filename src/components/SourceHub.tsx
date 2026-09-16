import { useState } from "react";
import { Search, LoaderCircle, ExternalLink } from "lucide-react";
import {
  LICENSE_UNCHECKED,
  SOURCE_ERROR,
  type SearchSource,
  type SourceHit,
} from "@/lib/source-search";
import { searchSources } from "@/lib/source-search-fn";
import { ecosystemSources, type EcosystemCategory } from "@/lib/ecosystem";
import { KAGGLE_ERROR, kaggleHit } from "@/lib/kaggle-search";
import { listKaggle } from "@/lib/kaggle-search-fn";
import { EVAL_CATALOG, evalCatalogHit } from "@/lib/eval-catalog";
import { t, useLocale } from "@/lib/i18n";
import { Field } from "@/components/ui/Field";

type HubSource = SearchSource | "kaggle";
type Props = { onSelect: (hit: SourceHit, source: SearchSource) => void };

function sourceMessage(e: unknown, locale: ReturnType<typeof useLocale>[0]): string {
  const code = e instanceof Error ? e.message : "";
  if (code === SOURCE_ERROR.query) return t("sh_err_query", locale);
  if (code === SOURCE_ERROR.kind) return t("sh_err_kind", locale);
  if (code === SOURCE_ERROR.schema) return t("sh_err_schema", locale);
  if (code === SOURCE_ERROR.body) return t("sh_err_body", locale);
  if (code === SOURCE_ERROR.size) return t("sh_err_size", locale);
  if (code === SOURCE_ERROR.retry || code.startsWith(`${SOURCE_ERROR.retry} `))
    return t("sh_err_http_limit", locale).replace("{status}", "429");
  if (code === SOURCE_ERROR.network || /failed to fetch/i.test(code))
    return t("sh_err_cors", locale);
  if (code === KAGGLE_ERROR.auth) return t("sh_kaggle_auth", locale);
  if (code === KAGGLE_ERROR.schema) return t("sh_err_schema", locale);
  const http = /^SOURCE_HTTP ([0-9]+)/.exec(code);
  if (http) {
    const status = http[1];
    if (status === "429") return t("sh_err_http_limit", locale).replace("{status}", status);
    if (status === "401") return t("sh_err_expired", locale);
    if (status === "403") return t("sh_err_denied", locale);
    return t("sh_err_http", locale).replace("{status}", status);
  }
  return t("sh_err_search", locale);
}

export function SourceHub({ onSelect }: Props) {
  const [locale] = useLocale();
  const sources: { id: HubSource; label: string }[] = [
    { id: "hf-datasets", label: t("sh_src_hf_datasets", locale) },
    { id: "hf-models", label: t("sh_src_hf_models", locale) },
    { id: "github", label: t("sh_src_github", locale) },
    { id: "openml", label: t("sh_src_openml", locale) },
    { id: "zenodo", label: t("sh_src_zenodo", locale) },
    { id: "kaggle", label: t("sh_src_kaggle", locale) },
  ];
  const [source, setSource] = useState<HubSource>("hf-datasets");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SourceHit[]>([]);
  const [fetchedAt, setFetchedAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [kaggleUser, setKaggleUser] = useState("");
  const [kaggleKey, setKaggleKey] = useState("");
  const [catalogCategory, setCatalogCategory] = useState<EcosystemCategory>("compute");
  const catalogQuery = query.trim().toLocaleLowerCase();
  const catalogItems = ecosystemSources
    .filter(
      (item) =>
        item.category === catalogCategory &&
        (!catalogQuery ||
          `${item.name} ${item.summary} ${item.workloads.join(" ")}`
            .toLocaleLowerCase()
            .includes(catalogQuery)),
    )
    .slice(0, 80);
  async function search() {
    setBusy(true);
    setError("");
    try {
      if (source === "kaggle") {
        if (kaggleUser.trim() && kaggleKey.trim()) {
          const result = await listKaggle({
            data: { query, user: kaggleUser, key: kaggleKey },
          });
          setItems(result.items);
          setFetchedAt(result.fetchedAt);
          return;
        }
        setItems([kaggleHit(query)]);
        setFetchedAt(new Date().toISOString());
        return;
      }
      const result = await searchSources({ data: { source, query } });
      setItems(result.items);
      setFetchedAt(result.fetchedAt);
    } catch (e) {
      setItems([]);
      setError(sourceMessage(e, locale));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel space-y-3 rounded-lg p-4" aria-label={t("sh_aria", locale)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-fg">{t("sh_title", locale)}</h2>
          <p className="mt-1 text-xs text-muted">{t("sh_blurb", locale)}</p>
        </div>
        {fetchedAt ? (
          <time className="font-mono text-[11px] text-muted" dateTime={fetchedAt}>
            {new Date(fetchedAt).toLocaleString(locale === "en" ? "en-US" : "ko-KR")}
          </time>
        ) : null}
      </div>
      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto]">
        <Field label={t("sh_label_query", locale)} htmlFor="source-query">
          <input
            id="source-query"
            className="input-shell text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void search();
            }}
            placeholder={t("sh_ph_query", locale)}
          />
        </Field>
        <select
          aria-label={t("sh_aria_kind", locale)}
          className="input-shell text-sm"
          value={source}
          onChange={(e) => setSource(e.target.value as HubSource)}
        >
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm"
          disabled={busy || !query.trim()}
          onClick={() => void search()}
        >
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}{" "}
          {t("sh_search_btn", locale)}
        </button>
      </div>
      {source === "kaggle" ? (
        <div className="grid gap-2 md:grid-cols-2">
          <p className="text-xs text-muted md:col-span-2">{t("sh_kaggle_nologin", locale)}</p>
          <Field label={t("sh_kaggle_user", locale)} htmlFor="kaggle-user">
            <input
              id="kaggle-user"
              className="input-shell text-sm"
              autoComplete="off"
              value={kaggleUser}
              onChange={(e) => setKaggleUser(e.target.value)}
            />
          </Field>
          <Field label={t("sh_kaggle_key", locale)} htmlFor="kaggle-key">
            <input
              id="kaggle-key"
              className="input-shell text-sm"
              type="password"
              autoComplete="off"
              value={kaggleKey}
              onChange={(e) => setKaggleKey(e.target.value)}
            />
          </Field>
          <a
            className="text-xs text-accent underline md:col-span-2"
            href="https://www.kaggle.com/settings"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("sh_kaggle_docs", locale)}
          </a>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
      {items.length ? (
        <ul className="grid gap-2 md:grid-cols-2">
          {items.map((hit) => (
            <li key={hit.id} className="rounded border border-border bg-surface p-3">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  className="text-left text-sm font-semibold text-accent hover:underline"
                  onClick={() => onSelect(hit, source === "kaggle" ? "github" : source)}
                >
                  {hit.name}
                </button>
                <a
                  href={hit.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("sh_open_aria", locale).replace("{name}", hit.name)}
                >
                  <ExternalLink className="size-4 text-muted" />
                </a>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted">
                {hit.description || t("sh_no_desc", locale)}
              </p>
              <p className="mt-2 font-mono text-[11px] text-muted">
                {t("sh_license", locale)}:{" "}
                {hit.license === LICENSE_UNCHECKED ? t("sh_license_unknown", locale) : hit.license}
                {hit.updated ? ` · ${t("sh_updated", locale)}: ${hit.updated.slice(0, 10)}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : fetchedAt && !error && !busy ? (
        <p className="text-xs text-muted">{t("sh_empty", locale)}</p>
      ) : null}
      <div className="border-t border-border pt-3" data-eval-catalog>
        <p className="text-xs font-semibold text-fg">{t("sh_eval_title", locale)}</p>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {EVAL_CATALOG.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                className="text-left font-mono text-xs text-accent hover:underline"
                onClick={() => onSelect(evalCatalogHit(row.id), "hf-datasets")}
              >
                {row.id}
                <span className="ml-2 text-muted"> · {row.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-border pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-fg">
            {t("sh_catalog_title", locale).replace("{n}", String(ecosystemSources.length))}
          </p>
          <select
            aria-label={t("sh_catalog_kind", locale)}
            className="input-shell text-xs"
            value={catalogCategory}
            onChange={(e) => setCatalogCategory(e.target.value as EcosystemCategory)}
          >
            <option value="compute">{t("sh_cat_compute", locale)}</option>
            <option value="dataset">{t("sh_cat_dataset", locale)}</option>
            <option value="method">{t("sh_cat_method", locale)}</option>
          </select>
        </div>
        <p className="mt-1 text-xs text-muted">{t("sh_catalog_blurb", locale)}</p>
        <ul className="mt-2 grid max-h-80 gap-1 overflow-auto pr-1 sm:grid-cols-2" tabIndex={0}>
          {catalogItems.map((item) => (
            <li
              key={`${item.category}:${item.id}`}
              className="flex items-start justify-between gap-2 border-b border-border/60 py-2"
            >
              <div>
                <a
                  className="text-xs font-semibold text-fg hover:text-accent"
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.name}
                </a>
                <p className="line-clamp-1 text-[11px] text-muted">{item.summary}</p>
              </div>
              <span className="shrink-0 rounded-sm border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted">
                {t("sh_badge_catalog", locale)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
