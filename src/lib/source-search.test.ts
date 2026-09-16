import test from "node:test";
import assert from "node:assert/strict";
import {
  fetchSourceResults,
  LICENSE_UNCHECKED,
  mapSourceResults,
  searchUrl,
  SOURCE_ERROR,
} from "./source-search.ts";

test("source search builds only allowlisted endpoints", () => {
  assert.equal(searchUrl("hf-datasets", "rl env").origin, "https://huggingface.co");
  assert.equal(searchUrl("github", "cleanrl").origin, "https://api.github.com");
  assert.equal(searchUrl("openml", "iris").origin, "https://www.openml.org");
  assert.equal(searchUrl("zenodo", "mnist").origin, "https://zenodo.org");
  assert.match(searchUrl("openml", "iris").pathname, /data_name\/iris/);
  assert.throws(() => searchUrl("github", ""), new RegExp(SOURCE_ERROR.query));
});

test("dataset results preserve license and immutable revision hints", () => {
  const [hit] = mapSourceResults("hf-datasets", [
    {
      id: "org/data",
      description: "rows",
      tags: ["license:apache-2.0"],
      sha: "abc",
      lastModified: "2026-09-01",
      siblings: [
        {
          rfilename: "data.safetensors",
          lfs: { sha256: "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd" },
        },
      ],
    },
  ]);
  assert.equal(hit.license, "apache-2.0");
  assert.equal(hit.revision, "abc");
  assert.match(hit.url, /datasets\/org\/data/);
  assert.equal(hit.sha256, "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd");
});

test("unknown licenses remain explicit and malformed IDs are rejected", () => {
  assert.equal(
    mapSourceResults("github", { items: [{ full_name: "org/repo", license: null }] })[0].license,
    LICENSE_UNCHECKED,
  );
  assert.deepEqual(mapSourceResults("hf-models", [{ id: "https://evil.test/x" }]), []);
});

test("OpenML nested dataset list maps did to openml.org/d without claiming a live fetch", () => {
  const [hit] = mapSourceResults("openml", {
    data: { dataset: [{ did: "61", name: "iris", description: "classic" }] },
  });
  assert.equal(hit.id, "61");
  assert.equal(hit.name, "iris");
  assert.equal(hit.url, "https://www.openml.org/d/61");
  assert.equal(hit.license, LICENSE_UNCHECKED);
});

test("TypeError Failed to fetch maps to SOURCE_NETWORK", async () => {
  await assert.rejects(
    () =>
      fetchSourceResults("github", "iris", async () => {
        throw new TypeError("Failed to fetch");
      }),
    new RegExp(SOURCE_ERROR.network),
  );
});

test("source search sends workbench User-Agent", async () => {
  let ua = "";
  const result = await fetchSourceResults("github", "iris", async (_url, init) => {
    const headers = init?.headers as Record<string, string>;
    ua = String(headers?.["User-Agent"] ?? "");
    return new Response(JSON.stringify({ items: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
  assert.equal(ua, "abliterater-workbench");
  assert.equal(result.items.length, 0);
});

test("Zenodo hits[] schema maps numeric id and license id", () => {
  const [hit] = mapSourceResults("zenodo", {
    hits: {
      hits: [
        {
          id: 12345,
          metadata: { title: "weights", license: { id: "cc-by-4.0" }, description: "files" },
        },
      ],
    },
  });
  assert.equal(hit.id, "12345");
  assert.equal(hit.url, "https://zenodo.org/records/12345");
  assert.equal(hit.license, "cc-by-4.0");
});
