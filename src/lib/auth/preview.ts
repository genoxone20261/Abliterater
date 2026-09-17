/**
 * Optional preview OAuth client (server-only — NEVER import from the client).
 *
 * No client secret is stored in this repository. Values come from process
 * environment only. When unset the preview client is empty and sign-in fails
 * closed. Default product auth is off via `.grok/app-env.json`
 * (`VITE_AUTH_ENABLED=false`).
 */
export const PREVIEW_CLIENT_ID =
  process.env.GROK_PREVIEW_CLIENT_ID ?? process.env.GROK_AUTH_CLIENT_ID ?? "";
export const PREVIEW_CLIENT_SECRET =
  process.env.GROK_PREVIEW_CLIENT_SECRET ?? process.env.GROK_AUTH_CLIENT_SECRET ?? "";

/** OIDC issuer when federated auth is explicitly configured. */
export const GROK_ISSUER_DEFAULT = process.env.GROK_AUTH_ISSUER ?? "";

export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;
