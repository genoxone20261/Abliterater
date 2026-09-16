export function isDevRuntime(isPackaged, nodeEnv) {
  return !isPackaged && nodeEnv !== "production";
}

function isLoopbackHost(hostname) {
  const host = String(hostname ?? "")
    .toLowerCase()
    .replace(/^\[|\]$/g, "");
  return host === "127.0.0.1" || host === "localhost" || host === "::1";
}

/** https anywhere; http only on loopback. Credentials, file/javascript/data/custom stay denied. */
export function isAllowedExternalUrl(raw) {
  try {
    const parsed = new URL(raw);
    if (parsed.username || parsed.password) return false;
    const { protocol, hostname } = parsed;
    if (protocol === "https:") return true;
    if (protocol === "http:") return isLoopbackHost(hostname);
    return false;
  } catch {
    return false;
  }
}

/** Same-origin navigation into the built app URL only; malformed URLs denied. */
export function isAllowedAppNavigation(raw, appOriginUrl) {
  try {
    return new URL(raw).origin === new URL(appOriginUrl).origin;
  } catch {
    return false;
  }
}
