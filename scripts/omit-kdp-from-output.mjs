import { rm } from "node:fs/promises";
import { resolve } from "node:path";

/** Keep author PDFs on disk under public/reports. Never copy them into production output. */
const reports = resolve(process.cwd(), ".vercel/output/static/reports");
await rm(reports, { recursive: true, force: true });
