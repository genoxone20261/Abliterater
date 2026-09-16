/** STORE-method ZIP so the workbench can emit one pack download in the browser. */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n: number): Uint8Array {
  const b = new Uint8Array(2);
  b[0] = n & 0xff;
  b[1] = (n >>> 8) & 0xff;
  return b;
}

function u32(n: number): Uint8Array {
  const b = new Uint8Array(4);
  b[0] = n & 0xff;
  b[1] = (n >>> 8) & 0xff;
  b[2] = (n >>> 16) & 0xff;
  b[3] = (n >>> 24) & 0xff;
  return b;
}

function concat(chunks: Uint8Array[]): Uint8Array {
  let n = 0;
  for (const c of chunks) n += c.length;
  const out = new Uint8Array(n);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}

export type ZipEntry = { name: string; body: string };

export const ZIP_ERROR = {
  count: "ZIP_COUNT",
  path: "ZIP_PATH",
  dup: "ZIP_DUP",
  name: "ZIP_NAME",
  entry: "ZIP_ENTRY",
  total: "ZIP_TOTAL",
} as const;

const MAX_ENTRY_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 32 * 1024 * 1024;

function isUnsafeZipName(name: string): boolean {
  const n = name.replace(/\\/g, "/");
  if (!n || n.startsWith("/") || n.startsWith("//")) return true;
  if (/^[a-zA-Z]:/.test(n) || n.includes(":")) return true;
  const parts = n.split("/");
  return parts.includes("..") || parts.includes(".") || parts.some((part) => part === "");
}

export function validateZipEntries(files: ZipEntry[]): void {
  if (files.length > 0xffff) throw new Error(ZIP_ERROR.count);
  const seen = new Set<string>();
  const enc = new TextEncoder();
  let total = 0;
  for (const file of files) {
    const name = file.name.replace(/\\/g, "/");
    if (isUnsafeZipName(name)) throw new Error(ZIP_ERROR.path);
    if (seen.has(name)) throw new Error(ZIP_ERROR.dup);
    seen.add(name);
    if (enc.encode(name).length > 0xffff) throw new Error(ZIP_ERROR.name);
    const size = enc.encode(file.body).length;
    if (size > MAX_ENTRY_BYTES) throw new Error(ZIP_ERROR.entry);
    total += size;
    if (total > MAX_TOTAL_BYTES) throw new Error(ZIP_ERROR.total);
  }
}

export function zipUtf8Files(files: ZipEntry[]): Blob {
  const enc = new TextEncoder();
  validateZipEntries(files);
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  const now = new Date();
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    (Math.floor(now.getSeconds() / 2) & 0x1f);
  const dosDate =
    (((now.getFullYear() - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0x0f) << 5) |
    (now.getDate() & 0x1f);

  for (const file of files) {
    const normalizedName = file.name.replace(/\\/g, "/");
    const name = enc.encode(normalizedName);
    const data = enc.encode(file.body);
    const crc = crc32(data);
    const local = concat([
      u32(0x04034b50),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(dosTime),
      u16(dosDate),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      name,
      data,
    ]);
    const central = concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(dosTime),
      u16(dosDate),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }

  const centralDir = concat(centrals);
  const localBlob = concat(locals);
  const eocd = concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.length),
    u32(localBlob.length),
    u16(0),
  ]);
  const bytes = concat([localBlob, centralDir, eocd]);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy.buffer], { type: "application/zip" });
}
