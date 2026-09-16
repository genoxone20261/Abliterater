import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { kaggleList } from "@/lib/kaggle-search";
import type { SourceHit } from "@/lib/source-search";

/** Browser CORS cannot reach Kaggle. List runs on the server with the user-pasted key. */
export const listKaggle = createServerFn({ method: "POST" })
  .validator(
    z.object({
      query: z.string().min(1).max(160),
      user: z.string().min(1).max(80),
      key: z.string().min(1).max(120),
    }),
  )
  .handler(async ({ data }): Promise<{ fetchedAt: string; items: SourceHit[] }> => {
    const items = await kaggleList(data.query, { user: data.user, key: data.key });
    return { fetchedAt: new Date().toISOString(), items };
  });
