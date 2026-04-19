import bwipjs from "bwip-js/node";

import type { BarcodePayloadV1 } from "@/lib/validators";

const BWIPP_BCID: Record<BarcodePayloadV1["symbology"], string> = {
  CODE128: "code128",
  CODE39: "code39",
  EAN13: "ean13",
  UPCA: "upca",
  ITF14: "itf14",
};

export async function renderBarcodePngDataUrl(payload: BarcodePayloadV1): Promise<string> {
  const bcid = BWIPP_BCID[payload.symbology];
  const text = payload.data.trim();
  try {
    const buf = await bwipjs.toBuffer({
      bcid,
      text,
      scale: 3,
      height: 12,
      includetext: true,
      textxalign: "center",
    });
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch (e) {
    const msg = typeof e === "string" ? e : e instanceof Error ? e.message : "Invalid barcode.";
    throw new Error(msg.length > 200 ? "Invalid barcode data for this symbology." : msg);
  }
}
