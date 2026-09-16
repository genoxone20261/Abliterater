export type SshTarget = { name: string; host: string; user: string; port: number };

export const SSH_ERROR = {
  name: "SSH_NAME",
  host: "SSH_HOST",
  user: "SSH_USER",
  port: "SSH_PORT",
  command: "SSH_COMMAND",
} as const;

const NAME_RE = /^[A-Za-z0-9._-]{1,64}$/;
const HOST_RE = /^[A-Za-z0-9.-]{1,253}$|^\[[0-9a-fA-F:.]+\]$/;
const USER_RE = /^(?!-)[A-Za-z0-9._-]{1,64}$/;
const COMMANDS = new Set(["bash run.sh", "bash eval.sh", "nvidia-smi"]);

export function validateSshTarget(value: unknown): SshTarget {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const name = String(row.name ?? "").trim();
  const host = String(row.host ?? "").trim();
  const user = String(row.user ?? "").trim();
  const port = Number(row.port ?? 22);
  if (!NAME_RE.test(name)) throw new Error(SSH_ERROR.name);
  if (!HOST_RE.test(host) || host.includes("..")) throw new Error(SSH_ERROR.host);
  if (!USER_RE.test(user)) throw new Error(SSH_ERROR.user);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(SSH_ERROR.port);
  return { name, host, user, port };
}

export function sshCommand(target: SshTarget, remoteCommand = "bash run.sh"): string {
  const t = validateSshTarget(target);
  if (!COMMANDS.has(remoteCommand)) throw new Error(SSH_ERROR.command);
  return `ssh -o BatchMode=yes -o ConnectTimeout=10 -p ${t.port} -- ${t.user}@${t.host} '${remoteCommand}'`;
}
