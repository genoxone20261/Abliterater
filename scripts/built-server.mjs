import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { pathToFileURL } from "node:url";

const types = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".txt": "text/plain; charset=utf-8",
};

/** Serve the built web handler and static assets without Vite or source files. */
export async function startBuiltServer({ root, host = "127.0.0.1", port = 0 }) {
  const output = resolve(root, ".vercel/output");
  const staticRoot = await realpath(resolve(output, "static"));
  const app = (
    await import(pathToFileURL(resolve(output, "functions/__server.func/index.mjs")).href)
  ).default;
  const server = createServer(async (req, res) => {
    try {
      const origin = `http://${host}:${server.address().port}`;
      const url = new URL(req.url || "/", origin);
      const pathname = decodeURIComponent(url.pathname);
      if (req.method === "GET" || req.method === "HEAD") {
        const candidate = resolve(staticRoot, `.${pathname}`);
        if (candidate.startsWith(staticRoot + sep)) {
          const actual = await realpath(candidate).catch(() => "");
          if (actual.startsWith(staticRoot + sep) && (await stat(actual)).isFile()) {
            const data = await readFile(actual);
            res.writeHead(200, {
              "Content-Type": types[extname(actual)] || "application/octet-stream",
              "Content-Length": data.length,
              "X-Content-Type-Options": "nosniff",
            });
            res.end(req.method === "HEAD" ? undefined : data);
            return;
          }
        }
      }
      const parts = [];
      let bytes = 0;
      for await (const part of req) {
        bytes += part.length;
        if (bytes > 1024 * 1024) {
          res.writeHead(413);
          res.end();
          return;
        }
        parts.push(part);
      }
      const body = parts.length ? Buffer.concat(parts) : undefined;
      const response = await app.fetch(
        new Request(url, { method: req.method, headers: req.headers, body, duplex: "half" }),
      );
      res.statusCode = response.status;
      response.headers.forEach((v, k) => {
        if (k !== "set-cookie") res.setHeader(k, v);
      });
      const cookies = response.headers.getSetCookie?.();
      if (cookies?.length) res.setHeader("set-cookie", cookies);
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Application request failed");
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });
  return { server, url: `http://${host}:${server.address().port}` };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { url } = await startBuiltServer({
    root: process.cwd(),
    host: process.env.HOST || "127.0.0.1",
    port: Number(process.env.PORT || 8083),
  });
  console.log(`Abliterater ready ${url}`);
}
