import { addDays, isAfter } from "date-fns";
import { createHash } from "crypto";
import { QrContentKind, QrStatus } from "@prisma/client";
import { nanoid } from "nanoid";
import QRCode from "qrcode";

import type { Prisma } from "@prisma/client";

import { renderBarcodePngDataUrl } from "@/lib/barcode";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { barcodePayloadSchema } from "@/lib/validators";

function buildSlug() {
  return nanoid(10);
}

export function getPublicQrUrl(slug: string) {
  return `${env.appUrl}/qr/${slug}`;
}

export async function createFreeQr(params: {
  userId: string;
  contentKind?: QrContentKind;
  destinationUrl: string | null;
  payloadJson?: Prisma.InputJsonValue | null;
  maxScans?: number;
  /** Visual-only styling; when set we skip server-side `qrcode` PNG (use client `qr-code-styling`). */
  styleJson?: Prisma.InputJsonValue;
}) {
  const slug = buildSlug();
  const expiresAt = addDays(new Date(), 5);
  const contentKind = params.contentKind ?? QrContentKind.URL;

  const qr = await db.qrCode.create({
    data: {
      userId: params.userId,
      slug,
      contentKind,
      destinationUrl: params.destinationUrl,
      ...(params.payloadJson !== undefined && params.payloadJson !== null
        ? { payloadJson: params.payloadJson }
        : {}),
      expiresAt,
      maxScans: params.maxScans ?? 50,
      ...(params.styleJson !== undefined
        ? { styleJson: params.styleJson }
        : {}),
    },
  });

  const publicUrl = getPublicQrUrl(slug);
  // Custom styles are rendered on the client with `qr-code-styling` (no Node canvas pipeline here).
  let imageDataUrl: string | undefined;
  if (contentKind === QrContentKind.BARCODE) {
    const parsed = barcodePayloadSchema.safeParse(params.payloadJson);
    if (!parsed.success) {
      throw new Error("Invalid barcode payload.");
    }
    imageDataUrl = await renderBarcodePngDataUrl(parsed.data);
  } else if (params.styleJson === undefined) {
    imageDataUrl = await QRCode.toDataURL(publicUrl, {
      errorCorrectionLevel: "M",
      width: 400,
    });
  }

  return {
    qr,
    publicUrl,
    imageDataUrl,
  };
}

function resolveStatusByLimits(qr: {
  status: QrStatus;
  expiresAt: Date;
  scanCount: number;
  maxScans: number;
}) {
  if (qr.status === QrStatus.DISABLED) {
    return QrStatus.DISABLED;
  }
  if (isAfter(new Date(), qr.expiresAt)) {
    return QrStatus.EXPIRED_TIME;
  }
  if (qr.scanCount >= qr.maxScans) {
    return QrStatus.EXPIRED_SCAN_LIMIT;
  }

  return QrStatus.ACTIVE;
}

export async function trackScanAndResolve(slug: string, request: Request) {
  const qr = await db.qrCode.findUnique({ where: { slug } });
  if (!qr) {
    return { found: false as const };
  }

  const status = resolveStatusByLimits(qr);

  if (status !== qr.status) {
    await db.qrCode.update({
      where: { id: qr.id },
      data: { status },
    });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipHash = ip
    ? createHash("sha256").update(`${ip}:${process.env.IP_HASH_SALT ?? "qr"}`).digest("hex")
    : null;

  await db.qrScan.create({
    data: {
      qrId: qr.id,
      ipHash,
      country: request.headers.get("x-vercel-ip-country"),
      userAgent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
    },
  });

  await db.qrCode.update({
    where: { id: qr.id },
    data: {
      scanCount: { increment: 1 },
    },
  });

  const reloaded = await db.qrCode.findUniqueOrThrow({ where: { id: qr.id } });
  const recalculatedStatus = resolveStatusByLimits(reloaded);

  if (recalculatedStatus !== reloaded.status) {
    await db.qrCode.update({
      where: { id: qr.id },
      data: { status: recalculatedStatus },
    });
  }

  return {
    found: true as const,
    qr: reloaded,
    status: recalculatedStatus,
  };
}

export function getUpgradeUrl(slug: string) {
  return `${env.appUrl}/upgrade/${slug}`;
}
