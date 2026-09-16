export const CLI_LOGIN_ERROR = { kind: "CLI_LOGIN_KIND" } as const;

export type CliLoginKind = "azure" | "aws" | "gcp";

export type CliLoginSpec = {
  kind: CliLoginKind;
  command: string;
  docs: string;
};

const SPECS: Record<CliLoginKind, CliLoginSpec> = {
  azure: {
    kind: "azure",
    command: "az login",
    docs: "https://learn.microsoft.com/en-us/cli/azure/authenticate-azure-cli",
  },
  aws: {
    kind: "aws",
    command: "aws sso login",
    docs: "https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html",
  },
  gcp: {
    kind: "gcp",
    command: "gcloud auth login",
    docs: "https://cloud.google.com/sdk/gcloud/reference/auth/login",
  },
};

export function cliLoginSpec(kind: string): CliLoginSpec {
  if (kind !== "azure" && kind !== "aws" && kind !== "gcp") throw new Error(CLI_LOGIN_ERROR.kind);
  return { ...SPECS[kind] };
}
