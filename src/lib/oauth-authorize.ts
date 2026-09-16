export const OAUTH_ERROR = {
  client: "OAUTH_CLIENT",
  provider: "OAUTH_PROVIDER",
  redirect: "OAUTH_REDIRECT",
  tenant: "OAUTH_TENANT",
  http: "OAUTH_HTTP",
  schema: "OAUTH_SCHEMA",
} as const;

export type OauthAuthorizeSpec = {
  authorize: string;
  token: string;
  defaultScope: string;
  tenanted: boolean;
};

export type OauthMemory = {
  provider: string;
  accessToken: string;
  tokenType: string;
  expiresAt: number;
};

const SPECS: Record<string, OauthAuthorizeSpec> = {
  azure: {
    authorize: "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize",
    token: "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token",
    defaultScope: "openid offline_access https://management.azure.com/.default",
    tenanted: true,
  },
  gcp: {
    authorize: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    defaultScope: "https://www.googleapis.com/auth/cloud-platform",
    tenanted: false,
  },
  github: {
    authorize: "https://github.com/login/oauth/authorize",
    token: "https://github.com/login/oauth/access_token",
    defaultScope: "read:user",
    tenanted: false,
  },
  huggingface: {
    authorize: "https://huggingface.co/oauth/authorize",
    token: "https://huggingface.co/oauth/token",
    defaultScope: "openid profile",
    tenanted: false,
  },
};

SPECS["azure-ml"] = SPECS.azure;
SPECS["azure-vm"] = SPECS.azure;
SPECS["gcp-gce"] = SPECS.gcp;
SPECS["gcp-vertex"] = SPECS.gcp;

const listeners = new Set<() => void>();
let memory: OauthMemory | null = null;

export function oauthAuthorizeSpec(id: string): OauthAuthorizeSpec | undefined {
  const spec = SPECS[id];
  if (!spec) return undefined;
  return { ...spec };
}

export function subscribeOauthMemory(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getOauthMemory(): OauthMemory | null {
  return memory ? { ...memory } : null;
}

export function setOauthMemory(next: OauthMemory | null): void {
  memory = next ? { ...next } : null;
  for (const fn of listeners) fn();
}

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export async function makePkce(): Promise<{ verifier: string; challenge: string; method: "S256" }> {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  const verifier = b64url(bytes);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return { verifier, challenge: b64url(new Uint8Array(digest)), method: "S256" };
}

function tenantId(raw: string | undefined): string {
  const value = (raw ?? "common").trim() || "common";
  if (!/^[A-Za-z0-9.-]+$/.test(value)) throw new Error(OAUTH_ERROR.tenant);
  return value;
}

export function buildOauthAuthorizeUrl(input: {
  provider: string;
  clientId: string;
  redirectUri: string;
  challenge: string;
  state: string;
  tenant?: string;
  scope?: string;
}): string {
  const spec = SPECS[input.provider];
  if (!spec) throw new Error(OAUTH_ERROR.provider);
  const clientId = input.clientId.trim();
  if (!clientId || clientId.length > 128 || /[\r\n\s]/.test(clientId)) {
    throw new Error(OAUTH_ERROR.client);
  }
  if (!/^https?:\/\//.test(input.redirectUri) || /[\r\n]/.test(input.redirectUri)) {
    throw new Error(OAUTH_ERROR.redirect);
  }
  if (!input.challenge.trim() || !input.state.trim()) throw new Error(OAUTH_ERROR.client);
  const tenant = spec.tenanted ? tenantId(input.tenant) : "";
  const authorize = spec.authorize.replace("{tenant}", tenant);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: input.redirectUri,
    response_mode: "query",
    scope: input.scope?.trim() || spec.defaultScope,
    state: input.state,
    code_challenge: input.challenge,
    code_challenge_method: "S256",
  });
  return `${authorize}?${params.toString()}`;
}

export async function exchangeOauthCode(
  input: {
    provider: string;
    clientId: string;
    redirectUri: string;
    code: string;
    verifier: string;
    tenant?: string;
  },
  fetcher: typeof fetch = fetch,
): Promise<OauthMemory> {
  const spec = SPECS[input.provider];
  if (!spec) throw new Error(OAUTH_ERROR.provider);
  const clientId = input.clientId.trim();
  if (!clientId) throw new Error(OAUTH_ERROR.client);
  if (!input.code.trim() || !input.verifier.trim()) throw new Error(OAUTH_ERROR.client);
  const tenant = spec.tenanted ? tenantId(input.tenant) : "";
  const tokenUrl = spec.token.replace("{tenant}", tenant);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code: input.code,
    redirect_uri: input.redirectUri,
    code_verifier: input.verifier,
  });
  const res = await fetcher(tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body,
  });
  if (!res.ok) throw new Error(OAUTH_ERROR.http);
  const json: unknown = await res.json();
  if (!json || typeof json !== "object") throw new Error(OAUTH_ERROR.schema);
  const rec = json as Record<string, unknown>;
  if (typeof rec.access_token !== "string" || !rec.access_token) throw new Error(OAUTH_ERROR.schema);
  const expires = typeof rec.expires_in === "number" ? rec.expires_in : 0;
  const slot: OauthMemory = {
    provider: input.provider,
    accessToken: rec.access_token,
    tokenType: typeof rec.token_type === "string" ? rec.token_type : "Bearer",
    expiresAt: Date.now() + Math.max(0, expires) * 1000,
  };
  setOauthMemory(slot);
  return { ...slot };
}
