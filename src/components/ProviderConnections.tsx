import { useEffect, useRef, useState } from "react";
import {
  createProviderJob,
  listProviderJobs,
  removeProviderJob,
  stopProviderJob,
  type ProviderId,
  type ProviderJob,
} from "@/lib/provider-jobs";
import { PROVIDER_CAPABILITIES, capabilityOf, BUDGET_ERROR } from "@/lib/provider-capabilities";
import { CREATE_ERROR, isUserCreateProvider } from "@/lib/provider-create";
import {
  isLiveReadProvider,
  providerAdapter,
  PROVIDER_ERROR,
  uniqueConnectionOptions,
} from "@/lib/provider-registry";
import { t, useLocale } from "@/lib/i18n";
import { Field } from "@/components/ui/Field";
import { Dialog } from "@/components/ui/Dialog";
import { getApiKeyMemory, subscribeApiKeyMemory } from "@/lib/credential-memory";
import { getOauthMemory, subscribeOauthMemory } from "@/lib/oauth-authorize";

function jobStatusLabel(status: string, locale: ReturnType<typeof useLocale>[0]): string {
  if (status === "queued") return t("job_st_queued", locale);
  if (status === "running") return t("job_st_running", locale);
  if (status === "succeeded") return t("job_st_succeeded", locale);
  if (status === "failed") return t("job_st_failed", locale);
  if (status === "cancelled") return t("job_st_cancelled", locale);
  return t("job_st_unknown", locale);
}

function providerMessage(e: unknown, locale: ReturnType<typeof useLocale>[0]): string {
  const code = e instanceof Error ? e.message : "";
  if (code === PROVIDER_ERROR.unavailable) return t("prov_err_unavailable", locale);
  if (code === PROVIDER_ERROR.credential) return t("prov_err_credential", locale);
  if (code === PROVIDER_ERROR.mismatch) return t("prov_err_mismatch", locale);
  if (code === PROVIDER_ERROR.read) return t("prov_err_read", locale);
  if (code === PROVIDER_ERROR.path) return t("prov_err_path", locale);
  if (code === PROVIDER_ERROR.jobId) return t("prov_err_job", locale);
  if (code === PROVIDER_ERROR.schema) return t("prov_err_schema", locale);
  if (code === PROVIDER_ERROR.mutate) return t("prov_err_mutate", locale);
  if (code === CREATE_ERROR.unsupported) return t("prov_err_mutate", locale);
  if (code === CREATE_ERROR.fields || code === CREATE_ERROR.required)
    return t("prov_create_need_fields", locale);
  if (code === BUDGET_ERROR.ack) return t("prov_create_ack", locale);
  if (
    code === BUDGET_ERROR.usd ||
    code === BUDGET_ERROR.minutes ||
    code === BUDGET_ERROR.rate ||
    code === BUDGET_ERROR.over
  )
    return t("prov_err_budget", locale);
  if (code === PROVIDER_ERROR.http || code.startsWith(`${PROVIDER_ERROR.http} `))
    return t("prov_err_http", locale);
  return t("prov_fail", locale);
}

type PendingMutate =
  { kind: "create" } | { kind: "stop"; id: string } | { kind: "remove"; id: string };

/** Connections. Secrets never enter storage, packs or diagnostics. */
export function ProviderConnections() {
  const [locale] = useLocale();
  const [provider, setProvider] = useState<ProviderId>("runpod");
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [jobs, setJobs] = useState<ProviderJob[]>([]);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState("");
  const [poll, setPoll] = useState(false);
  const [ack, setAck] = useState(false);
  const [maxUsd, setMaxUsd] = useState("5");
  const [maxMinutes, setMaxMinutes] = useState("30");
  const [estHour, setEstHour] = useState("1");
  const [imageName, setImageName] = useState("");
  const [gpuTypeIds, setGpuTypeIds] = useState("");
  const [regionName, setRegionName] = useState("");
  const [instanceType, setInstanceType] = useState("");
  const [sshKeys, setSshKeys] = useState("");
  const [offerId, setOfferId] = useState("");
  const [pending, setPending] = useState<PendingMutate | null>(null);
  const capability = capabilityOf(provider);
  const isLive = isLiveReadProvider(provider);
  const canCreate = isUserCreateProvider(provider);
  const adapter = isLive ? providerAdapter(provider) : null;
  const needsToken = isLive && adapter !== null && adapter.credential !== "none";
  const generation = useRef(0);
  const inflight = useRef(false);
  const [, setOauthTick] = useState(0);
  useEffect(() => {
    const offOauth = subscribeOauthMemory(() => setOauthTick((n) => n + 1));
    const offKey = subscribeApiKeyMemory(() => setOauthTick((n) => n + 1));
    return () => {
      offOauth();
      offKey();
    };
  }, []);
  function sessionToken(): string {
    const slot = getOauthMemory();
    if (token.trim()) return token.trim();
    const remembered = getApiKeyMemory(provider);
    if (remembered) return remembered;
    if (!slot?.accessToken) return "";
    if (slot.provider === provider) return slot.accessToken;
    const azure = (id: string) => id === "azure" || id.startsWith("azure-") || id.startsWith("azure_");
    const gcp = (id: string) => id === "gcp" || id.startsWith("gcp-");
    if (azure(provider) && azure(slot.provider)) return slot.accessToken;
    if (gcp(provider) && gcp(slot.provider)) return slot.accessToken;
    return "";
  }
  function disconnect() {
    generation.current++;
    inflight.current = false;
    setToken("");
    setJobs([]);
    setUpdated("");
    setConnected(false);
    setBusy(false);
    setPoll(false);
    setError("");
    setPending(null);
  }
  async function refresh() {
    if (!isLive || !adapter) {
      setError(t("prov_catalog_only", locale));
      return;
    }
    if (inflight.current || (needsToken && !sessionToken())) return;
    const version = generation.current;
    inflight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await listProviderJobs(provider, { provider, token: sessionToken() });
      if (generation.current !== version) return;
      setJobs(result);
      setConnected(true);
      setUpdated(new Date().toISOString());
    } catch (e) {
      if (generation.current !== version) return;
      setConnected(false);
      setPoll(false);
      setError(providerMessage(e, locale));
    } finally {
      if (generation.current === version) {
        inflight.current = false;
        setBusy(false);
      }
    }
  }
  function budget() {
    return {
      maxUsd: Number(maxUsd),
      maxMinutes: Number(maxMinutes),
      estimatedUsdPerHour: Number(estHour),
      acknowledged: ack,
    };
  }
  function createBody(): Record<string, unknown> {
    if (provider === "lambda") {
      return {
        region_name: regionName.trim(),
        instance_type_name: instanceType.trim(),
        ssh_key_names: sshKeys
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    }
    if (provider === "vast") {
      const body: Record<string, unknown> = { client_id: "me" };
      if (imageName.trim()) body.image = imageName.trim();
      return body;
    }
    const body: Record<string, unknown> = { imageName: imageName.trim() };
    const gpus = gpuTypeIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (gpus.length) body.gpuTypeIds = gpus;
    return body;
  }
  async function runPending() {
    const next = pending;
    setPending(null);
    if (!next || !connected) return;
    const version = generation.current;
    inflight.current = true;
    setBusy(true);
    setError("");
    try {
      if (next.kind === "create") {
        await createProviderJob(
          provider,
          { provider, token: sessionToken() },
          {
            budget: budget(),
            requestId: `c-${Date.now()}`,
            body: createBody(),
            offerId: provider === "vast" ? offerId.trim() : undefined,
            dryRun: false,
          },
        );
      } else if (next.kind === "stop") {
        await stopProviderJob(provider, { provider, token: sessionToken() }, next.id);
      } else {
        await removeProviderJob(provider, { provider, token: sessionToken() }, next.id);
      }
      if (generation.current !== version) return;
      await refresh();
    } catch (e) {
      if (generation.current !== version) return;
      setError(providerMessage(e, locale));
    } finally {
      if (generation.current === version) {
        inflight.current = false;
        setBusy(false);
      }
    }
  }
  useEffect(() => {
    if (!poll || !connected) return;
    const timer = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 15000);
    return () => clearInterval(timer);
  });
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  const createChip = canCreate
    ? t("prov_create_user", locale)
    : isLive
      ? t("prov_create_console", locale)
      : t("prov_create_delete", locale);
  return (
    <section className="panel space-y-3 rounded-lg p-4" aria-label={t("prov_aria", locale)}>
      <h2 className="text-sm font-bold">{t("prov_title", locale)}</h2>
      <p className="text-xs text-muted">{t("prov_blurb", locale)}</p>
      <div className="flex flex-wrap gap-2 text-[11px] text-muted">
        <span className="rounded-sm border border-border px-2 py-1">
          {t("prov_support", locale)} {capability?.tier ?? "catalog"}
        </span>
        <span className="rounded-sm border border-border px-2 py-1">
          {t("prov_auth", locale)} {capability?.auth.join(" · ") ?? t("prov_auth_unknown", locale)}
        </span>
        <span className="rounded-sm border border-border px-2 py-1">{createChip}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label={t("prov_provider_label", locale)} htmlFor="prov-provider">
          <select
            id="prov-provider"
            className="input-shell text-sm"
            value={provider}
            disabled={connected || busy}
            onChange={(e) => {
              disconnect();
              setProvider(e.target.value as ProviderId);
            }}
          >
            {uniqueConnectionOptions(PROVIDER_CAPABILITIES).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.id}
                {isLiveReadProvider(p.id) ? ` · ${t("prov_live", locale)}` : ` · ${p.tier}`}
              </option>
            ))}
          </select>
        </Field>
        {needsToken ? (
          <Field label={t("prov_api_key", locale)} htmlFor="prov-api-key">
            <input
              id="prov-api-key"
              className="input-shell text-sm"
              type="password"
              autoComplete="off"
              value={token}
              disabled={connected || busy}
              onChange={(e) => setToken(e.target.value)}
            />
          </Field>
        ) : null}
      </div>
      {capability?.officialDocs.startsWith("https://") ? (
        <p className="text-xs text-muted">
          <a
            className="underline"
            href={capability.officialDocs}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("prov_docs", locale)}
          </a>
          {` · ${t("prov_docs_hint", locale)}`}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={`${connected ? "btn-secondary" : "btn-primary"} min-h-11 px-4 text-sm`}
          aria-busy={busy}
          disabled={busy || (needsToken && !sessionToken())}
          onClick={() => void refresh()}
        >
          {busy
            ? t("prov_busy", locale)
            : connected
              ? t("prov_refresh", locale)
              : t("prov_auth_fetch", locale)}
        </button>
        <button className="btn-secondary min-h-11 px-4 text-sm" onClick={disconnect}>
          {t("prov_disconnect", locale)}
        </button>
        <Field label={t("prov_auto_refresh", locale)} htmlFor="prov-auto-refresh">
          <input
            id="prov-auto-refresh"
            className="h-4 w-4 accent-ok"
            type="checkbox"
            checked={poll}
            disabled={!connected}
            onChange={(e) => setPoll(e.target.checked)}
          />
        </Field>
      </div>
      {canCreate && connected ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label={t("prov_max_usd", locale)} htmlFor="prov-max-usd">
            <input
              id="prov-max-usd"
              className="input-shell text-sm"
              inputMode="decimal"
              value={maxUsd}
              onChange={(e) => setMaxUsd(e.target.value)}
            />
          </Field>
          <Field label={t("prov_max_min", locale)} htmlFor="prov-max-min">
            <input
              id="prov-max-min"
              className="input-shell text-sm"
              inputMode="numeric"
              value={maxMinutes}
              onChange={(e) => setMaxMinutes(e.target.value)}
            />
          </Field>
          <Field label={t("prov_est_hour", locale)} htmlFor="prov-est-hour">
            <input
              id="prov-est-hour"
              className="input-shell text-sm"
              inputMode="decimal"
              value={estHour}
              onChange={(e) => setEstHour(e.target.value)}
            />
          </Field>
          <Field label={t("prov_create_ack", locale)} htmlFor="prov-ack">
            <input
              id="prov-ack"
              className="h-4 w-4 accent-ok"
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
            />
          </Field>
          {provider === "lambda" ? (
            <>
              <Field label={t("prov_create_region", locale)} htmlFor="prov-region">
                <input
                  id="prov-region"
                  className="input-shell text-sm"
                  value={regionName}
                  onChange={(e) => setRegionName(e.target.value)}
                />
              </Field>
              <Field label={t("prov_create_type", locale)} htmlFor="prov-instance-type">
                <input
                  id="prov-instance-type"
                  className="input-shell text-sm"
                  value={instanceType}
                  onChange={(e) => setInstanceType(e.target.value)}
                />
              </Field>
              <Field label={t("prov_create_ssh", locale)} htmlFor="prov-ssh-keys">
                <input
                  id="prov-ssh-keys"
                  className="input-shell text-sm"
                  value={sshKeys}
                  onChange={(e) => setSshKeys(e.target.value)}
                />
              </Field>
            </>
          ) : provider === "vast" ? (
            <>
              <Field label={t("prov_create_offer", locale)} htmlFor="prov-offer">
                <input
                  id="prov-offer"
                  className="input-shell text-sm"
                  value={offerId}
                  onChange={(e) => setOfferId(e.target.value)}
                />
              </Field>
              <Field label={t("prov_create_image", locale)} htmlFor="prov-image">
                <input
                  id="prov-image"
                  className="input-shell text-sm"
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label={t("prov_create_image", locale)} htmlFor="prov-image">
                <input
                  id="prov-image"
                  className="input-shell text-sm"
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                />
              </Field>
              <Field label={t("prov_create_gpu", locale)} htmlFor="prov-gpu">
                <input
                  id="prov-gpu"
                  className="input-shell text-sm"
                  value={gpuTypeIds}
                  onChange={(e) => setGpuTypeIds(e.target.value)}
                />
              </Field>
            </>
          )}
          <button
            className="btn-secondary min-h-11 px-4 text-sm"
            disabled={busy || !ack}
            onClick={() => setPending({ kind: "create" })}
          >
            {t("prov_create_btn", locale)}
          </button>
        </div>
      ) : null}
      <p role="status" className="text-xs text-muted">
        {connected ? t("prov_ok", locale) : t("prov_disconnected", locale)}
        {` · ${t("prov_cred_memory", locale)} · ${t("prov_cred_scope", locale)}`}
        {updated
          ? t("prov_last_ok", locale).replace("{t}", updated) +
            (error ? t("prov_stale", locale) : "")
          : ""}
      </p>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {t("prov_err_hint", locale).replace("{error}", error)}
        </p>
      )}
      {connected && jobs.length === 0 && (
        <p className="text-xs text-muted">{t("prov_no_instances", locale)}</p>
      )}
      <ul className="space-y-1">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="flex flex-wrap justify-between gap-2 border-b border-border py-2 text-xs"
          >
            <span className="break-all font-mono">{job.id}</span>
            <span>{jobStatusLabel(job.status, locale)}</span>
            {canCreate ? (
              <span className="flex gap-2">
                {capability?.stop ? (
                  <button
                    className="btn-ghost min-h-11 px-2"
                    disabled={busy}
                    onClick={() => setPending({ kind: "stop", id: job.id })}
                  >
                    {t("prov_stop_btn", locale)}
                  </button>
                ) : null}
                {capability?.remove ? (
                  <button
                    className="btn-ghost min-h-11 px-2 text-danger"
                    disabled={busy}
                    onClick={() => setPending({ kind: "remove", id: job.id })}
                  >
                    {t("prov_remove_btn", locale)}
                  </button>
                ) : null}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      <Dialog
        open={pending !== null}
        onClose={() => setPending(null)}
        title={t("prov_confirm_title", locale)}
        description={t("prov_confirm_body", locale)}
      >
        <div className="flex justify-end gap-2">
          <button className="btn-secondary min-h-11 px-4" onClick={() => setPending(null)}>
            {t("confirm_cancel", locale)}
          </button>
          <button
            className="btn-secondary min-h-11 px-4 text-danger"
            onClick={() => void runPending()}
          >
            {t("prov_confirm_go", locale)}
          </button>
        </div>
      </Dialog>
    </section>
  );
}
