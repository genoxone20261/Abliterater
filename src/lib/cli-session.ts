export type CliSessionPresence = {
  azure: boolean;
  aws: boolean;
  gcp: boolean;
  copiedSecret: false;
};

/** Analog: presence only. Never copy env secret values into the result. */
export function detectCliSession(
  env: NodeJS.ProcessEnv = typeof process !== "undefined" ? process.env : ({} as NodeJS.ProcessEnv),
): CliSessionPresence {
  return {
    azure: Boolean(env.AZURE_CLIENT_ID || env.AZURE_FEDERATED_TOKEN_FILE),
    aws: Boolean(env.AWS_PROFILE || env.AWS_ACCESS_KEY_ID),
    gcp: Boolean(env.GOOGLE_APPLICATION_CREDENTIALS || env.CLOUDSDK_AUTH_ACCESS_TOKEN),
    copiedSecret: false,
  };
}
