export type Provenance = {
  uri: string;
  revision: string;
  license: string;
  sha256: string;
  verified: boolean;
};

const SHA256 = /^[a-f0-9]{64}$/i;
const WEIGHT = /\.(safetensors|gguf|bin|pt|pth|onnx|npz)$/i;

export function provenanceOf(hit: {
  url?: string;
  id?: string;
  revision?: string;
  license?: string;
  sha256?: string;
}): Provenance {
  const sha256 = (hit.sha256 ?? "").trim();
  return {
    uri: (hit.url || hit.id || "").trim(),
    revision: (hit.revision ?? "").trim(),
    license: (hit.license ?? "").trim() || "LICENSE_UNCHECKED",
    sha256,
    verified: SHA256.test(sha256),
  };
}

export function sha256FromSiblings(siblings: unknown): string {
  if (!Array.isArray(siblings)) return "";
  for (const raw of siblings) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as {
      rfilename?: string;
      sha256?: string;
      lfs?: { sha256?: string };
    };
    const name = row.rfilename ?? "";
    if (!WEIGHT.test(name)) continue;
    const sha = (row.lfs?.sha256 || row.sha256 || "").trim();
    if (SHA256.test(sha)) return sha;
  }
  return "";
}
