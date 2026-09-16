import assert from "node:assert/strict";
import { test } from "node:test";
import { provenanceOf, sha256FromSiblings } from "./provenance.ts";

test("provenanceOf fills URI/revision/license/sha256 and only verifies a 64-hex sha", () => {
  const empty = provenanceOf({});
  assert.equal(empty.uri, "");
  assert.equal(empty.revision, "");
  assert.equal(empty.license, "LICENSE_UNCHECKED");
  assert.equal(empty.sha256, "");
  assert.equal(empty.verified, false);

  const hit = provenanceOf({
    url: "https://huggingface.co/datasets/Open-Orca/OpenOrca",
    id: "Open-Orca/OpenOrca",
    revision: "main",
    license: "mit",
    sha256: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  });
  assert.equal(hit.uri, "https://huggingface.co/datasets/Open-Orca/OpenOrca");
  assert.equal(hit.revision, "main");
  assert.equal(hit.license, "mit");
  assert.equal(hit.verified, true);

  const short = provenanceOf({ id: "owner/name", sha256: "deadbeef" });
  assert.equal(short.uri, "owner/name");
  assert.equal(short.verified, false);
});

test("sha256FromSiblings prefers weight-file LFS sha256 and skips search-as-download", () => {
  assert.equal(sha256FromSiblings(undefined), "");
  assert.equal(sha256FromSiblings([]), "");
  assert.equal(
    sha256FromSiblings([
      { rfilename: "README.md", sha256: "not-a-weight" },
      {
        rfilename: "model.safetensors",
        lfs: { sha256: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" },
      },
    ]),
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  );
  assert.equal(
    sha256FromSiblings([{ rfilename: "Qwen-Q4_K_M.gguf", sha256: "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc" }]),
    "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  );
});
