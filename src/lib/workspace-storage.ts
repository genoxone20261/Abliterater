export const WORKSPACE_ERROR = {
  data: "WS_DATA",
  home: "WS_HOME",
  invalid: "WS_INVALID",
  absolute: "WS_ABSOLUTE",
  repo: "WS_REPO",
  dir: "WS_DIR",
  settings: "WS_SETTINGS",
  busy: "WS_BUSY",
} as const;

export function defaultWorkspaceRoot(
  platform: string,
  env: Record<string, string | undefined>,
): string {
  if (platform === "win32") {
    const base = env.LOCALAPPDATA || (env.USERPROFILE ? `${env.USERPROFILE}/AppData/Local` : "");
    if (!base) throw new Error(WORKSPACE_ERROR.data);
    return `${base.replace(/[\\/]+$/, "")}/Abliterater`;
  }
  if (platform === "darwin" && !env.HOME) throw new Error(WORKSPACE_ERROR.home);
  if (platform !== "darwin" && !env.HOME && !env.XDG_DATA_HOME)
    throw new Error(WORKSPACE_ERROR.home);
  const base =
    platform === "darwin"
      ? `${env.HOME}/Library/Application Support`
      : env.XDG_DATA_HOME || `${env.HOME}/.local/share`;
  return `${base.replace(/\/+$/, "")}/Abliterater`;
}

/** Lexical validation only; the native host must additionally check permissions and real paths. */
export function validateWorkspaceRoot(value: string): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    Array.from(value).some((char) => char.charCodeAt(0) < 32)
  )
    throw new Error(WORKSPACE_ERROR.invalid);
  const normalized = value.replace(/\\/g, "/");
  const isDrivePath = /^[A-Za-z]:\/.+/.test(normalized);
  const isUncPath = /^\/\/[^/?./][^/]*\/[^/?./][^/]*\/.+/.test(normalized);
  const isPosixPath = /^\/[^/].+/.test(normalized);
  if ((!isDrivePath && !isUncPath && !isPosixPath) || normalized.split("/").includes(".."))
    throw new Error(WORKSPACE_ERROR.absolute);
  const segments = (isDrivePath ? normalized.slice(3) : normalized).split("/").filter(Boolean);
  if (
    /\/(?:repos(?:_orca)?|\.git|node_modules)(?:\/|$)/i.test(normalized) ||
    segments.some(
      (segment) =>
        /[. ]$/.test(segment) ||
        /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(segment) ||
        segment.includes(":"),
    )
  )
    throw new Error(WORKSPACE_ERROR.repo);
  return normalized;
}
