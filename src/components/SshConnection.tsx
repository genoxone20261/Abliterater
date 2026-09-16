import { useState } from "react";
import { SSH_ERROR, sshCommand, validateSshTarget, type SshTarget } from "@/lib/ssh-targets";
import { Field } from "@/components/ui/Field";
import { t, useLocale } from "@/lib/i18n";

function sshMessage(e: unknown, locale: ReturnType<typeof useLocale>[0]): string {
  const code = e instanceof Error ? e.message : "";
  if (code === SSH_ERROR.name) return t("ssh_err_name", locale);
  if (code === SSH_ERROR.host) return t("ssh_err_host", locale);
  if (code === SSH_ERROR.user) return t("ssh_err_user", locale);
  if (code === SSH_ERROR.port) return t("ssh_err_port", locale);
  if (code === SSH_ERROR.command) return t("ssh_err_command", locale);
  return t("ssh_err", locale);
}

export function SshConnection() {
  const [locale] = useLocale();
  const [target, setTarget] = useState<SshTarget>({
    name: "my-gpu",
    host: "",
    user: "ubuntu",
    port: 22,
  });
  const [command, setCommand] = useState("");
  const [error, setError] = useState("");
  function prepare() {
    try {
      setCommand(sshCommand(validateSshTarget(target)));
      setError("");
    } catch (e) {
      setError(sshMessage(e, locale));
    }
  }
  return (
    <section className="panel space-y-3 rounded-lg p-4" aria-label={t("ssh_aria", locale)}>
      <h2 className="text-sm font-bold">{t("ssh_title", locale)}</h2>
      <p className="text-xs text-muted">{t("ssh_blurb", locale)}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={t("ssh_name", locale)} htmlFor="ssh-name">
          <input
            id="ssh-name"
            className="input-shell text-sm"
            value={target.name}
            onChange={(e) => setTarget({ ...target, name: e.target.value })}
          />
        </Field>
        <Field label={t("ssh_host", locale)} htmlFor="ssh-host">
          <input
            id="ssh-host"
            className="input-shell text-sm"
            value={target.host}
            onChange={(e) => setTarget({ ...target, host: e.target.value })}
            placeholder={t("ssh_ph_host", locale)}
          />
        </Field>
        <Field label={t("ssh_user", locale)} htmlFor="ssh-user">
          <input
            id="ssh-user"
            className="input-shell text-sm"
            value={target.user}
            onChange={(e) => setTarget({ ...target, user: e.target.value })}
          />
        </Field>
        <Field label={t("ssh_port", locale)} htmlFor="ssh-port">
          <input
            id="ssh-port"
            className="input-shell text-sm"
            type="number"
            min={1}
            max={65535}
            value={target.port}
            onChange={(e) => setTarget({ ...target, port: Number(e.target.value) })}
          />
        </Field>
      </div>
      <button type="button" className="btn-secondary min-h-11 px-4 text-sm" onClick={prepare}>
        {t("ssh_prepare", locale)}
      </button>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {command && (
        <div className="space-y-2">
          <pre className="overflow-auto rounded border border-border bg-surface p-3 text-xs">
            {command}
          </pre>
          <p className="text-xs text-muted">{t("ssh_note", locale)}</p>
        </div>
      )}
    </section>
  );
}
