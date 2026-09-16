import type { WizardAuth } from "./analog-wave3.ts";
import { oauthAuthorizeSpec } from "./oauth-authorize.ts";
import { PROVIDER_CAPABILITIES, type AuthKind } from "./provider-capabilities.ts";
import { uniqueConnectionOptions } from "./provider-registry.ts";

export type AuthStartKind = "api-console" | "oauth-authorize" | "cli-docs";

export type AuthStartLink = {
  id: string;
  name: string;
  url: string;
  mode: WizardAuth;
  kind: AuthStartKind;
};

const EXTRAS: AuthStartLink[] = [
  {
    id: "huggingface",
    name: "Hugging Face",
    url: "https://huggingface.co/settings/tokens",
    mode: "api-key",
    kind: "api-console",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    url: "https://huggingface.co/oauth/authorize",
    mode: "oauth2",
    kind: "oauth-authorize",
  },
  {
    id: "kaggle",
    name: "Kaggle",
    url: "https://www.kaggle.com/settings",
    mode: "api-key",
    kind: "api-console",
  },
  {
    id: "github",
    name: "GitHub",
    url: "https://github.com/settings/tokens",
    mode: "api-key",
    kind: "api-console",
  },
  {
    id: "github",
    name: "GitHub",
    url: "https://github.com/login/oauth/authorize",
    mode: "oauth2",
    kind: "oauth-authorize",
  },
];

function startKind(auth: WizardAuth): AuthStartKind {
  if (auth === "api-key") return "api-console";
  if (auth === "oauth2") return "oauth-authorize";
  return "cli-docs";
}

function wants(auth: WizardAuth, kinds: readonly AuthKind[]): boolean {
  if (auth === "api-key") return kinds.includes("api-key");
  if (auth === "oauth2") return kinds.includes("oauth2");
  return kinds.includes("cloud-cli");
}

function startUrl(auth: WizardAuth, id: string, officialDocs: string): string {
  if (auth !== "oauth2") return officialDocs;
  const spec = oauthAuthorizeSpec(id);
  if (!spec) return officialDocs;
  return spec.authorize.replace("{tenant}", "common");
}

/** Official consoles / IdPs. API-key paste is not OAuth. */
export function authStartLinks(auth: WizardAuth): AuthStartLink[] {
  const seen = new Set<string>();
  const rows: AuthStartLink[] = [];
  const kind = startKind(auth);
  for (const cap of uniqueConnectionOptions(PROVIDER_CAPABILITIES)) {
    if (!cap.officialDocs.startsWith("https://")) continue;
    if (cap.auth.includes("manual")) continue;
    if (!wants(auth, cap.auth)) continue;
    if (seen.has(cap.id)) continue;
    seen.add(cap.id);
    rows.push({
      id: cap.id,
      name: cap.name,
      url: startUrl(auth, cap.id, cap.officialDocs),
      mode: auth,
      kind,
    });
  }
  for (const extra of EXTRAS) {
    if (extra.mode !== auth || seen.has(extra.id)) continue;
    seen.add(extra.id);
    rows.push(extra);
  }
  return rows;
}
