import { QrContentKind } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  barcodeHtmlPage,
  buildMailtoUrl,
  buildSmsUrl,
  buildTelUrl,
  buildWifiString,
  linkPageHtmlPage,
  textQrHtmlPage,
  wifiQrHtmlPage,
} from "@/lib/qr-content";
import { renderBarcodePngDataUrl } from "@/lib/barcode";
import { barcodePayloadSchema, linkPagePayloadSchema } from "@/lib/validators";
import { getUpgradeUrl, trackScanAndResolve } from "@/server/qr-service";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const result = await trackScanAndResolve(slug, request);

  if (!result.found) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  if (result.status === "ACTIVE") {
    const qr = result.qr;
    const payload = qr.payloadJson;

    switch (qr.contentKind) {
      case QrContentKind.URL: {
        const url = qr.destinationUrl;
        if (!url) {
          return NextResponse.redirect(new URL("/", request.url), 302);
        }
        return NextResponse.redirect(url, 302);
      }
      case QrContentKind.EMAIL: {
        const p = payload as { v?: number; email?: string; subject?: string; body?: string } | null;
        if (!p?.email) {
          return NextResponse.redirect(new URL("/", request.url), 302);
        }
        return NextResponse.redirect(
          buildMailtoUrl({
            email: p.email,
            subject: p.subject,
            body: p.body,
          }),
          302,
        );
      }
      case QrContentKind.PHONE: {
        const p = payload as { e164?: string } | null;
        if (!p?.e164) {
          return NextResponse.redirect(new URL("/", request.url), 302);
        }
        return NextResponse.redirect(buildTelUrl(p.e164), 302);
      }
      case QrContentKind.SMS: {
        const p = payload as { e164?: string; body?: string } | null;
        if (!p?.e164) {
          return NextResponse.redirect(new URL("/", request.url), 302);
        }
        return NextResponse.redirect(buildSmsUrl({ e164: p.e164, body: p.body }), 302);
      }
      case QrContentKind.TEXT: {
        const p = payload as { text?: string } | null;
        const text = typeof p?.text === "string" ? p.text : "";
        return new NextResponse(textQrHtmlPage(text), {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      case QrContentKind.WIFI: {
        const p = payload as {
          v?: number;
          ssid?: string;
          password?: string;
          encryption?: "WPA" | "WEP" | "nopass";
        } | null;
        if (!p?.ssid || !p.encryption) {
          return NextResponse.redirect(new URL("/", request.url), 302);
        }
        const wifiString = buildWifiString({
          v: 1,
          ssid: p.ssid,
          password: p.password,
          encryption: p.encryption,
        });
        return new NextResponse(wifiQrHtmlPage(wifiString), {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      case QrContentKind.BARCODE: {
        const parsed = barcodePayloadSchema.safeParse(payload);
        if (!parsed.success) {
          return NextResponse.redirect(new URL("/", request.url), 302);
        }
        const imageDataUrl = await renderBarcodePngDataUrl(parsed.data);
        return new NextResponse(
          barcodeHtmlPage(imageDataUrl, parsed.data.symbology, parsed.data.data),
          {
            status: 200,
            headers: { "content-type": "text/html; charset=utf-8" },
          },
        );
      }
      case QrContentKind.LINK_PAGE: {
        const parsed = linkPagePayloadSchema.safeParse(payload);
        if (!parsed.success) {
          return NextResponse.redirect(new URL("/", request.url), 302);
        }
        return new NextResponse(linkPageHtmlPage(parsed.data), {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      default:
        return NextResponse.redirect(new URL("/", request.url), 302);
    }
  }

  return NextResponse.redirect(getUpgradeUrl(slug), 302);
}
