"use client";

import { QrContentKind } from "@prisma/client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { QrStylePreview } from "@/components/qr-style-preview";
import {
  downloadStyledQrPng,
  fetchBarcodePngDataUrl,
  triggerDownloadDataUrl,
} from "@/lib/qr-client-download";
import {
  barcodePayloadSchema,
  DEFAULT_QR_STYLE_V1,
  qrStyleV1Schema,
  type QrStyleV1,
} from "@/lib/validators";

type DashboardQrActionsProps = {
  slug: string;
  contentKind: QrContentKind;
  publicUrl: string;
  styleJson: unknown;
  payloadJson: unknown;
};

function resolveStyle(styleJson: unknown): QrStyleV1 {
  const parsed = qrStyleV1Schema.safeParse(styleJson);
  return parsed.success ? parsed.data : DEFAULT_QR_STYLE_V1;
}

export function DashboardQrActions({
  slug,
  contentKind,
  publicUrl,
  styleJson,
  payloadJson,
}: DashboardQrActionsProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resolvedStyle = resolveStyle(styleJson);
  const barcodeParsed =
    contentKind === QrContentKind.BARCODE
      ? barcodePayloadSchema.safeParse(payloadJson)
      : null;
  const invalidBarcode =
    contentKind === QrContentKind.BARCODE && !barcodeParsed?.success;

  const closeViewer = useCallback(() => {
    setViewerOpen(false);
    setBarcodeDataUrl(null);
  }, []);

  useEffect(() => {
    if (!viewerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeViewer();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen, closeViewer]);

  async function handleView() {
    if (contentKind === QrContentKind.BARCODE) {
      if (!barcodeParsed?.success) return;
      setBusy(true);
      try {
        const url = await fetchBarcodePngDataUrl(
          barcodeParsed.data.symbology,
          barcodeParsed.data.data,
        );
        setBarcodeDataUrl(url);
        setViewerOpen(true);
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : "Could not load preview.");
      } finally {
        setBusy(false);
      }
      return;
    }
    setBarcodeDataUrl(null);
    setViewerOpen(true);
  }

  async function handleDownload() {
    setBusy(true);
    try {
      if (contentKind === QrContentKind.BARCODE) {
        if (!barcodeParsed?.success) {
          alert("Barcode data is invalid or missing.");
          return;
        }
        const url = await fetchBarcodePngDataUrl(
          barcodeParsed.data.symbology,
          barcodeParsed.data.data,
        );
        triggerDownloadDataUrl(url, `barcode-${slug}.png`);
        return;
      }
      await downloadStyledQrPng(publicUrl, resolvedStyle, `qr-${slug}`);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setBusy(false);
    }
  }

  const btnClass =
    "rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50";

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          className={btnClass}
          disabled={busy || invalidBarcode}
          onClick={() => void handleView()}
        >
          View
        </button>
        <button
          type="button"
          className={btnClass}
          disabled={busy || invalidBarcode}
          onClick={() => void handleDownload()}
        >
          Download
        </button>
      </div>
      {invalidBarcode ? (
        <p className="mt-1 max-w-[140px] text-[11px] leading-snug text-amber-800">
          Barcode payload missing; re-save this QR from the editor if needed.
        </p>
      ) : null}

      {viewerOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="QR preview"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close preview"
            onClick={closeViewer}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-auto rounded-xl border border-zinc-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-zinc-900">Preview — {slug}</p>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
                onClick={closeViewer}
              >
                Close
              </button>
            </div>
            <div className="mt-4 flex justify-center">
              {contentKind === QrContentKind.BARCODE && barcodeDataUrl ? (
                <Image
                  src={barcodeDataUrl}
                  alt={`Barcode ${slug}`}
                  width={400}
                  height={160}
                  unoptimized
                  className="max-h-48 max-w-full object-contain"
                />
              ) : contentKind !== QrContentKind.BARCODE ? (
                <QrStylePreview data={publicUrl} style={resolvedStyle} size={260} />
              ) : (
                <p className="text-sm text-zinc-500">Loading…</p>
              )}
            </div>
            <p className="mt-3 break-all text-center text-xs text-zinc-500">
              <a href={publicUrl} className="text-blue-600 underline" target="_blank" rel="noreferrer">
                {publicUrl}
              </a>
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
