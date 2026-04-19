"use client";

import QRCodeStyling from "qr-code-styling";

import { buildQrCodeStylingOptions } from "@/lib/qr-styling-build";
import type { QrStyleV1 } from "@/lib/validators";

function safeFileBase(name: string, fallback: string) {
  const trimmed = name.trim().replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "");
  return trimmed.slice(0, 80) || fallback;
}

export function triggerDownloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename.toLowerCase().endsWith(".png") ? filename : `${filename}.png`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadStyledQrPng(
  encodedData: string,
  style: QrStyleV1,
  fileBaseName: string,
  pixelSize = 1200,
) {
  const name = safeFileBase(fileBaseName, "qr-code");
  const instance = new QRCodeStyling(
    buildQrCodeStylingOptions(style, encodedData, pixelSize),
  );
  await instance.download({ name, extension: "png" });
}

export async function fetchBarcodePngDataUrl(
  symbology: string,
  data: string,
): Promise<string> {
  const response = await fetch("/api/barcodes/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbology, data }),
  });
  const body = (await response.json().catch(() => null)) as {
    imageDataUrl?: string;
    error?: string;
  } | null;
  if (!response.ok || !body?.imageDataUrl) {
    throw new Error(body?.error ?? "Could not render barcode.");
  }
  return body.imageDataUrl;
}
