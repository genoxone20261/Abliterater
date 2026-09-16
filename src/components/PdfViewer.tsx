import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, LoaderCircle } from "lucide-react";
import { t, useLocale } from "@/lib/i18n";

type PdfDoc = import("pdfjs-dist").PDFDocumentProxy;

export function PdfViewer({
  src,
  downloadName,
  locale: localeProp,
}: {
  src: string;
  downloadName: string;
  locale?: "ko" | "en";
}) {
  const [localeState] = useLocale();
  const locale = localeProp ?? localeState;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<PdfDoc | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let destroyTask: (() => unknown) | undefined;
    setLoading(true);
    setErr(null);
    setPage(1);
    docRef.current = null;

    void (async () => {
      try {
        // pdfjs-dist touches DOMMatrix at import time — browser only.
        const [pdfjsLib, worker] = await Promise.all([
          import("pdfjs-dist"),
          import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
        ]);
        if (cancelled) return;
        pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;
        // Range/stream GETs against the preview proxy sometimes return 204.
        // Load the bytes ourselves, then parse offline.
        const res = await fetch(src);
        if (!res.ok) throw new Error(`PDF ${res.status} ${src}`);
        const data = await res.arrayBuffer();
        if (cancelled) return;
        const loadingTask = pdfjsLib.getDocument({ data, disableRange: true, disableStream: true });
        destroyTask = () => loadingTask.destroy();
        const doc = await loadingTask.promise;
        if (cancelled) {
          void doc.cleanup();
          return;
        }
        docRef.current = doc;
        setPages(doc.numPages);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setErr(t("pdf_open_fail", locale));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      void destroyTask?.();
      void docRef.current?.cleanup();
      docRef.current = null;
    };
  }, [src, locale]);

  useEffect(() => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas || loading || err) return;
    let cancelled = false;
    const n = Math.min(Math.max(page, 1), doc.numPages);
    doc
      .getPage(n)
      .then(async (pdfPage) => {
        if (cancelled) return;
        const base = pdfPage.getViewport({ scale: 1 });
        const width = wrapRef.current?.clientWidth || base.width;
        const fit = Math.max(0.6, (width - 24) / base.width);
        const scale = fit * zoom;
        const viewport = pdfPage.getViewport({ scale });
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const ratio = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.floor(viewport.width * ratio);
        canvas.height = Math.floor(viewport.height * ratio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        const transform = ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined;
        await pdfPage.render({
          canvas,
          canvasContext: ctx,
          viewport,
          transform,
        }).promise;
      })
      .catch(() => {
        if (!cancelled) {
          setErr(t("pdf_page_fail", locale));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [page, pages, zoom, loading, err, src, locale]);

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md border border-border disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          aria-label={t("pdf_prev", locale)}
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-24 text-center text-xs font-medium">
          {pages ? `${page} / ${pages}` : "—"}
        </span>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md border border-border disabled:opacity-40"
          disabled={!pages || page >= pages}
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          aria-label={t("pdf_next", locale)}
        >
          <ChevronRight className="size-4" />
        </button>
        <button
          type="button"
          className="h-9 rounded-md border border-border px-2 text-xs"
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
          aria-label={t("pdf_zoom_out", locale)}
        >
          −
        </button>
        <button
          type="button"
          className="h-9 rounded-md border border-border px-2 text-xs"
          onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))}
          aria-label={t("pdf_zoom_in", locale)}
        >
          +
        </button>
        <a
          href={src}
          download={downloadName}
          className="ml-auto inline-flex h-9 items-center gap-1 rounded-md bg-navy px-3 text-xs font-semibold text-primary-fg hover:opacity-90 transition-opacity"
        >
          <Download className="size-3.5" />
          {t("pdf_save", locale)}
        </a>
      </div>
      <div ref={wrapRef} className="max-h-[min(78vh,920px)] overflow-auto bg-[#ece8e1] p-3">
        {loading && (
          <p className="flex items-center justify-center gap-2 py-24 text-sm text-muted">
            <LoaderCircle className="size-4 animate-spin" />
            {t("pdf_loading", locale)}
          </p>
        )}
        {err && (
          <div className="space-y-3 px-4 py-10 text-center text-sm">
            <p className="font-medium text-fg">{err}</p>
            <a
              href={src}
              download={downloadName}
              className="inline-flex h-10 items-center rounded-md bg-navy px-4 text-sm font-semibold text-primary-fg"
            >
              {t("pdf_download", locale)}
            </a>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={loading || err ? "hidden" : "mx-auto block bg-white shadow-sm"}
        />
      </div>
    </div>
  );
}

export default PdfViewer;
