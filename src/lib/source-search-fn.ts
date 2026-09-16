import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  fetchSourceResults,
  type SearchSource,
  type SourceSearchResult,
} from "@/lib/source-search";

const Source = z.enum(["hf-datasets", "hf-models", "github", "openml", "zenodo"]);

/** Browser CORS cannot reach OpenML. Search runs on the server. */
export const searchSources = createServerFn({ method: "POST" })
  .validator(z.object({ source: Source, query: z.string().min(1).max(160) }))
  .handler(async ({ data }): Promise<SourceSearchResult> => {
    return fetchSourceResults(data.source as SearchSource, data.query);
  });
