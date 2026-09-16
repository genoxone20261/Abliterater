const ident = /^(?!-)[A-Za-z0-9._-]{1,64}$/;
const host = /^[A-Za-z0-9.-]{1,253}$|^\[[0-9a-fA-F:.]+\]$/;
export const SSH_PLAN_ERROR = {
  target: "SSH_PLAN_TARGET",
  pack: "SSH_PLAN_PACK",
  log: "SSH_PLAN_LOG",
};
export function buildSshPlan(target, packName) {
  if (
    !target ||
    typeof target.name !== "string" ||
    !ident.test(target.name) ||
    target.name === "." ||
    target.name === ".." ||
    !ident.test(target.user) ||
    !host.test(target.host) ||
    target.host.includes("..") ||
    !Number.isInteger(target.port) ||
    target.port < 1 ||
    target.port > 65535
  )
    throw new Error(SSH_PLAN_ERROR.target);
  if (typeof packName !== "string" || !/^(?!-)[A-Za-z0-9._-]{1,128}\.zip$/.test(packName))
    throw new Error(SSH_PLAN_ERROR.pack);
  const dest = `${target.user}@${target.host}`,
    root = `abliterater/${target.name}`;
  const opts = `-o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10 -p ${target.port}`;
  return {
    schemaVersion: 1,
    host: target.host,
    user: target.user,
    port: target.port,
    root,
    credentialSource: "ssh-agent-or-config",
    executable: false,
    evidence: "plan-only",
    commands: [
      `ssh ${opts} -- ${dest} 'mkdir -p ${root}'`,
      `scp -o BatchMode=yes -o StrictHostKeyChecking=yes -P ${target.port} -- ${packName} ${dest}:${root}/pack.zip`,
      `ssh ${opts} -- ${dest} 'bash -o pipefail -c "cd ${root} && unzip -o pack.zip && bash run.sh 2>&1 | tee execution.log"'`,
      `ssh ${opts} -- ${dest} 'cd ${root} && tar czf artifacts.tgz execution.log artifacts'`,
      `scp -o BatchMode=yes -o StrictHostKeyChecking=yes -P ${target.port} -- ${dest}:${root}/artifacts.tgz ./artifacts.tgz`,
      `ssh ${opts} -- ${dest} 'cd ${root} && sha256sum artifacts.tgz'`,
    ],
  };
}
export function parseSshLog(text) {
  if (typeof text !== "string" || text.length > 2_000_000) throw new Error(SSH_PLAN_ERROR.log);
  const stages = [...text.matchAll(/^(UPLOAD|RUN|ARTIFACT|CLEANUP)\b/gm)].map((x) => x[1]);
  const artifacts = [
    ...text.matchAll(/^ARTIFACT\s+sha256=([a-fA-F0-9]{64})\s+path=([^\s]{1,256})/gm),
  ].map((x) => ({ sha256: x[1].toLowerCase(), path: x[2] }));
  return { stages, artifacts };
}
