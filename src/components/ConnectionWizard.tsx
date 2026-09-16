import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/ui/Field";
import { t, useLocale } from "@/lib/i18n";
import { wizardSteps, type WizardAuth } from "@/lib/analog-wave3";
import { authStartLinks } from "@/lib/auth-start";
import { detectCliSession, type CliSessionPresence } from "@/lib/cli-session";
import { cliLoginSpec } from "@/lib/cli-login";
import { setApiKeyMemory } from "@/lib/credential-memory";
import { listProviderJobs } from "@/lib/provider-jobs";
import { liveReadProviders, providerAdapter } from "@/lib/provider-registry";
import {
  buildOauthAuthorizeUrl,
  exchangeOauthCode,
  makePkce,
  oauthAuthorizeSpec,
} from "@/lib/oauth-authorize";

function stepLabel(step: string, locale: ReturnType<typeof useLocale>[0]): string {
  if (step === "pkce") return t("wiz_step_pkce", locale);
  if (step === "callback") return t("wiz_step_callback", locale);
  if (step === "scope") return t("wiz_step_scope", locale);
  if (step === "paste") return t("wiz_step_paste", locale);
  if (step === "memory-only") return t("wiz_step_memory", locale);
  if (step === "detect-session") return t("wiz_step_session", locale);
  return t("wiz_step_nocopy", locale);
}

type PendingOauth = {
  verifier: string;
  state: string;
  provider: string;
  clientId: string;
  tenant: string;
};

const CLI_KINDS = ["azure", "aws", "gcp"] as const;

export function ConnectionWizard({ hideApiKey = false }: { hideApiKey?: boolean } = {}) {
  const [locale] = useLocale();
  const [auth, setAuth] = useState<WizardAuth>("api-key");
  const live = liveReadProviders();
  const [apiId, setApiId] = useState(live[0]?.id ?? "runpod");
  const [apiKey, setApiKey] = useState("");
  const [oauthId, setOauthId] = useState("azure");
  const [clientId, setClientId] = useState("");
  const [tenant, setTenant] = useState("common");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<CliSessionPresence>(() => detectCliSession());
  const pending = useRef<PendingOauth | null>(null);
  const oauthLinks = authStartLinks("oauth2");
  const spec = oauthAuthorizeSpec(oauthId);
  let apiAdapter = null;
  try {
    apiAdapter = providerAdapter(apiId);
  } catch {
    apiAdapter = null;
  }
  const needsKey = apiAdapter !== null && apiAdapter.credential !== "none";

  useEffect(() => {
    function onMsg(ev: MessageEvent) {
      if (ev.origin !== window.location.origin) return;
      const data = ev.data as { type?: string; code?: string; state?: string; error?: string };
      if (!data || data.type !== "abliterater-oauth") return;
      const hold = pending.current;
      pending.current = null;
      if (!hold || data.state !== hold.state || data.error || !data.code) {
        setStatus(t("wiz_oauth_fail", locale));
        return;
      }
      void exchangeOauthCode({
        provider: hold.provider,
        clientId: hold.clientId,
        redirectUri: `${window.location.origin}/oauth-callback.html`,
        code: data.code,
        verifier: hold.verifier,
        tenant: hold.tenant,
      })
        .then(() => setStatus(t("wiz_oauth_ok", locale)))
        .catch(() => setStatus(t("wiz_oauth_fail", locale)));
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [locale]);

  async function connectApi() {
    setStatus("");
    setBusy(true);
    try {
      const shared =
        hideApiKey && typeof document !== "undefined"
          ? (document.getElementById("prov-api-key") as HTMLInputElement | null)?.value ?? ""
          : apiKey;
      const token = needsKey ? shared : "";
      if (needsKey) setApiKeyMemory(apiId, token);
      const jobs = await listProviderJobs(apiId, { provider: apiId, token });
      setStatus(t("wiz_api_ok", locale).replace("{n}", String(jobs.length)));
    } catch {
      setStatus(t("wiz_api_fail", locale));
    } finally {
      setBusy(false);
    }
  }

  async function startOauth() {
    setStatus("");
    if (!clientId.trim()) {
      setStatus(t("wiz_oauth_need_client", locale));
      return;
    }
    try {
      const pair = await makePkce();
      const state = globalThis.crypto.randomUUID();
      const redirectUri = `${window.location.origin}/oauth-callback.html`;
      const url = buildOauthAuthorizeUrl({
        provider: oauthId,
        clientId,
        redirectUri,
        challenge: pair.challenge,
        state,
        tenant: spec?.tenanted ? tenant : undefined,
      });
      pending.current = { verifier: pair.verifier, state, provider: oauthId, clientId, tenant };
      const popup = window.open(url, "abliterater-oauth", "popup=yes,width=480,height=720");
      if (!popup) setStatus(t("wiz_oauth_popup_blocked", locale));
    } catch {
      setStatus(t("wiz_oauth_fail", locale));
    }
  }

  return (
    <section className="border-b border-border px-4 py-3" aria-label={t("wiz_aria", locale)}>
      <h2 className="text-sm font-medium">{t("wiz_title", locale)}</h2>
      <Field label={t("wiz_auth_label", locale)} htmlFor="wiz-auth">
        <select
          id="wiz-auth"
          className="input-shell w-full text-sm"
          value={auth}
          onChange={(e) => {
            setAuth(e.target.value as WizardAuth);
            setStatus("");
          }}
        >
          <option value="api-key">{t("wiz_auth_apikey", locale)}</option>
          <option value="oauth2">{t("wiz_auth_oauth", locale)}</option>
          <option value="cloud-cli">{t("wiz_auth_cli", locale)}</option>
        </select>
      </Field>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-muted">
        {wizardSteps(auth).map((step) => (
          <li key={step}>{stepLabel(step, locale)}</li>
        ))}
      </ol>
      {auth === "api-key" ? (
        <>
          <p className="mt-2 text-xs text-muted">{t("wiz_open_hint_apikey", locale)}</p>
          <Field label={t("wiz_api_provider", locale)} htmlFor="wiz-api-provider">
            <select
              id="wiz-api-provider"
              className="input-shell w-full text-sm"
              value={apiId}
              onChange={(e) => setApiId(e.target.value)}
            >
              {live.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
            </select>
          </Field>
          {needsKey && !hideApiKey ? (
            <Field label={t("wiz_api_paste", locale)} htmlFor="wiz-api-key">
              <input
                id="wiz-api-key"
                className="input-shell w-full text-sm"
                type="password"
                autoComplete="off"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </Field>
          ) : needsKey ? (
            <p className="mt-2 text-xs text-muted">{t("wiz_use_prov_key", locale)}</p>
          ) : null}
          {apiAdapter?.officialDocs.startsWith("https://") ? (
            <p className="mt-2 text-xs">
              <a
                className="text-accent underline"
                href={apiAdapter.officialDocs}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("wiz_open_apikey", locale)} · {apiAdapter.name}
              </a>
            </p>
          ) : null}
          <button
            type="button"
            className="btn-primary mt-2 min-h-11 px-4 text-sm"
            disabled={busy || (needsKey && !hideApiKey && !apiKey.trim())}
            onClick={() => void connectApi()}
          >
            {t("wiz_api_connect", locale)}
          </button>
          <p className="mt-2 text-xs text-muted">{t("prov_cred_memory", locale)}</p>
        </>
      ) : null}
      {auth === "oauth2" ? (
        <>
          <p className="mt-2 text-xs text-muted">{t("wiz_open_hint_oauth", locale)}</p>
          <Field label={t("wiz_oauth_provider", locale)} htmlFor="wiz-oauth-provider">
            <select
              id="wiz-oauth-provider"
              className="input-shell w-full text-sm"
              value={oauthId}
              onChange={(e) => setOauthId(e.target.value)}
            >
              {oauthLinks.map((link) => (
                <option key={link.id} value={link.id}>
                  {link.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("wiz_oauth_client", locale)} htmlFor="wiz-oauth-client">
            <input
              id="wiz-oauth-client"
              className="input-shell w-full text-sm"
              autoComplete="off"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </Field>
          {spec?.tenanted ? (
            <Field label={t("wiz_oauth_tenant", locale)} htmlFor="wiz-oauth-tenant">
              <input
                id="wiz-oauth-tenant"
                className="input-shell w-full text-sm"
                autoComplete="off"
                placeholder={t("wiz_oauth_tenant_ph", locale)}
                value={tenant}
                onChange={(e) => setTenant(e.target.value)}
              />
            </Field>
          ) : null}
          <button type="button" className="btn-primary mt-2 min-h-11 px-4 text-sm" onClick={() => void startOauth()}>
            {t("wiz_oauth_start", locale)}
          </button>
        </>
      ) : null}
      {auth === "cloud-cli" ? (
        <>
          <p className="mt-2 text-xs text-muted">{t("wiz_open_hint_cli", locale)}</p>
          <ul className="mt-2 space-y-2 text-xs">
            {CLI_KINDS.map((kind) => {
              const login = cliLoginSpec(kind);
              const present =
                kind === "azure" ? session.azure : kind === "aws" ? session.aws : session.gcp;
              const label =
                kind === "azure"
                  ? t("wiz_cli_azure", locale)
                  : kind === "aws"
                    ? t("wiz_cli_aws", locale)
                    : t("wiz_cli_gcp", locale);
              return (
                <li key={kind}>
                  <p>
                    {label} · {present ? t("wiz_cli_present", locale) : t("wiz_cli_absent", locale)}
                  </p>
                  <p className="font-mono text-[11px]">{login.command}</p>
                  <a
                    className="text-accent underline"
                    href={login.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("wiz_cli_login", locale)} · {login.command}
                  </a>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className="btn-secondary mt-2 min-h-11 px-4 text-sm"
            onClick={() => setSession(detectCliSession())}
          >
            {t("wiz_cli_redetect", locale)}
          </button>
          <p className="mt-2 text-xs text-muted">{t("wiz_cli_az_hint", locale)}</p>
        </>
      ) : null}
      {status ? (
        <p id="wiz-auth-status" className="mt-2 text-xs text-muted" role="status">
          {status}
        </p>
      ) : (
        <p id="wiz-auth-status" className="sr-only" role="status" />
      )}
    </section>
  );
}
