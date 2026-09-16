import type { SearchSource, SourceHit } from "./source-search.ts";

export const PUT_SOURCE_EVENT = "abliterater-put-source";

export type PutSourceDetail = { hit: SourceHit; source: SearchSource };

export function emitPutSource(detail: PutSourceDetail): void {
  window.dispatchEvent(new CustomEvent(PUT_SOURCE_EVENT, { detail }));
}
