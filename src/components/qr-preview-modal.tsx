"use client";

import { QrContentKind } from "@prisma/client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import { QrStylePreview } from "@/components/qr-style-preview";
import { fetchBarcodePngDataUrl } from "@/lib/qr-client-download";
import {
  barcodePayloadSchema,
  DEFAULT_QR_STYLE_V1,
  qrStyleV1Schema,
  type QrStyleV1,
} from "@/lib/validators";

export type QrPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  slug: string;
  contentKind: QrContentKind;
  publicUrl: string;
  styleJson: unknown;
  payloadJson: unknown;
  /** When set (e.g. right after create), barcode preview skips fetch. */
  initialBarcodeDataUrl?: string | null;
};

function resolveStyle(styleJson: unknown): QrStyleV1 {
  const parsed = qrStyleV1Schema.safeParse(styleJson);
  return parsed.success ? parsed.data : DEFAULT_QR_STYLE_V1;
}

export function QrPreviewModal({
  open,
  onClose,
  slug,
  contentKind,
  publicUrl,
  styleJson,
  payloadJson,
  initialBarcodeDataUrl,
}: QrPreviewModalProps) {
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string | null>(null);
  const [loadingBarcode, setLoadingBarcode] = useState(false);

  const resolvedStyle = resolveStyle(styleJson);
  const barcodeParsed = useMemo(() => {
    if (contentKind !== QrContentKind.BARCODE) return null;
    return barcodePayloadSchema.safeParse(payloadJson);
  }, [contentKind, payloadJson]);

  const resetBarcode = useCallback(() => {
    setBarcodeDataUrl(null);
    setLoadingBarcode(false);
  }, []);

  useEffect(() => {
    if (!open) {
      resetBarcode();
      return;
    }
    if (contentKind !== QrContentKind.BARCODE) {
      resetBarcode();
      return;
    }
    if (!barcodeParsed?.success) {
      resetBarcode();
      return;
    }
    if (initialBarcodeDataUrl) {
      setBarcodeDataUrl(initialBarcodeDataUrl);
      return;
    }
    let cancelled = false;
    setLoadingBarcode(true);
    void (async () => {
      try {
        const url = await fetchBarcodePngDataUrl(
          barcodeParsed.data.symbology,
          barcodeParsed.data.data,
        );
        if (!cancelled) setBarcodeDataUrl(url);
      } catch (e) {
        console.error(e);
        if (!cancelled) setBarcodeDataUrl(null);
      } finally {
        if (!cancelled) setLoadingBarcode(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    open,
    contentKind,
    slug,
    initialBarcodeDataUrl,
    barcodeParsed?.success,
    barcodeParsed?.data?.symbology,
    barcodeParsed?.data?.data,
    resetBarcode,
  ]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="QR preview"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-md overflow-auto rounded-xl border border-zinc-200 bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-zinc-900">Preview — {slug}</p>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-4 flex justify-center">
          {contentKind === QrContentKind.BARCODE ? (
            barcodeDataUrl ? (
              <Image
                src={barcodeDataUrl}
                alt={`Barcode ${slug}`}
                width={400}
                height={160}
                unoptimized
                className="max-h-48 max-w-full object-contain"
              />
            ) : (
              <p className="text-sm text-zinc-500">
                {loadingBarcode ? "Loading…" : "Could not load barcode."}
              </p>
            )
          ) : (
            <QrStylePreview data={publicUrl} style={resolvedStyle} size={260} />
          )}
        </div>
        <p className="mt-3 break-all text-center text-xs text-zinc-500">
          <a href={publicUrl} className="text-blue-600 underline" target="_blank" rel="noreferrer">
            {publicUrl}
          </a>
        </p>
      </div>
    </div>
  );
}
