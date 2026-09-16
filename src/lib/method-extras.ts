export type ApostateMethod = "diode" | "kcrn";

function modelToken(kind: "sh" | "ps"): string {
  return kind === "sh" ? '"${WORK:-./base}"' : "$(if ($Work) { $Work } else { './base' })";
}

export function apostateCli(kind: "sh" | "ps", method: ApostateMethod = "diode"): string {
  const extra = method === "kcrn" ? " --method kcrn" : "";
  return `apostate ablate --model ${modelToken(kind)} --out ./apostate-out${extra}`;
}

export function mergekitCli(kind: "sh" | "ps"): string {
  if (kind === "ps") return "mergekit-yaml .\\merge.yml .\\merged";
  return "mergekit-yaml ./merge.yml ./merged";
}

export function exl2Cli(kind: "sh" | "ps"): string {
  if (kind === "ps") return "python -m exllamav2.convert -i $Work -o .\\exl2-out";
  return 'python -m exllamav2.convert -i "${WORK:-./base}" -o ./exl2-out';
}

export function awqCli(kind: "sh" | "ps"): string {
  if (kind === "ps") return "python -m awq.entry --model_path $Work --output_path .\\awq-out";
  return 'python -m awq.entry --model_path "${WORK:-./base}" --output_path ./awq-out';
}

export function evalPackManifest(): string {
  return [
    "eval-pack analog. Not a rented n-trials run.",
    "HarmBench",
    "StrongREJECT",
    "XSTest",
    "Sorry-Bench",
    "search != download",
  ].join("\n");
}
