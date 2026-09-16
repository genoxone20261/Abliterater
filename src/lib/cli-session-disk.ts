import { existsSync } from "node:fs";
import { join } from "node:path";
import { detectCliSession, type CliSessionPresence } from "./cli-session.ts";

/** Presence of CLI profile files. Never read file bytes into the result. */
export function detectCliSessionAtHome(
  env: NodeJS.ProcessEnv = {},
  home = "",
): CliSessionPresence {
  const fromEnv = detectCliSession(env);
  if (!home) return fromEnv;
  const azure = fromEnv.azure || existsSync(join(home, ".azure", "azureProfile.json"));
  const aws =
    fromEnv.aws ||
    existsSync(join(home, ".aws", "credentials")) ||
    existsSync(join(home, ".aws", "config"));
  const gcp =
    fromEnv.gcp ||
    existsSync(join(home, ".config", "gcloud", "application_default_credentials.json")) ||
    existsSync(join(home, "AppData", "Roaming", "gcloud", "application_default_credentials.json"));
  return { azure, aws, gcp, copiedSecret: false };
}
