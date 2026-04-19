"use client";

import { QrContentKind } from "@prisma/client";
import { useState } from "react";

import { QrPreviewModal } from "@/components/qr-preview-modal";
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
  const [busy, setBusy] = useState(false);

  const resolvedStyle = resolveStyle(styleJson);
  const barcodeParsed =
    contentKind === QrContentKind.BARCODE
      ? barcodePayloadSchema.safeParse(payloadJson)
      : null;
  const invalidBarcode =
    contentKind === QrContentKind.BARCODE && !barcodeParsed?.success;

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
    "min-h-[40px] flex-1 rounded-md border border-zinc-300 bg-white px-2 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 sm:min-h-0 sm:flex-none sm:px-2.5 sm:py-1";

  return (
    <>
      <div className="flex w-full gap-2 sm:w-auto sm:flex-wrap sm:justify-start">
        <button
          type="button"
          className={btnClass}
          disabled={busy || invalidBarcode}
          onClick={() => setViewerOpen(true)}
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
        <p className="mt-2 text-[11px] leading-snug text-amber-800 sm:max-w-[140px]">
          Barcode payload missing; re-save this QR from the editor if needed.
        </p>
      ) : null}

      <QrPreviewModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        slug={slug}
        contentKind={contentKind}
        publicUrl={publicUrl}
        styleJson={styleJson}
        payloadJson={payloadJson}
      />
    </>
  );
}
