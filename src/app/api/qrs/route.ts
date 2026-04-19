import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { PlanCode, QrContentKind } from "@prisma/client";

import { getCurrentSession } from "@/lib/auth/session";
import { appUrl } from "@/lib/app-url";
import { db } from "@/lib/db";
import { isMissingStyleJsonColumn } from "@/lib/prisma-qr-errors";
import {
  barcodePayloadSchema,
  createQrBodySchema,
  type CreateQrBody,
  type QrStyleV1,
} from "@/lib/validators";
import { renderBarcodePngDataUrl } from "@/lib/barcode";
import { createFreeQr } from "@/server/qr-service";

const STYLE_MIGRATION_HINT =
  "Database migration missing: run `npx prisma migrate deploy` so QrCode.styleJson exists. The QR was created without saved custom styles.";

function createDataFromBody(data: CreateQrBody): {
  contentKind: QrContentKind;
  destinationUrl: string | null;
  payloadJson?: Prisma.InputJsonValue;
  styleJson: QrStyleV1 | undefined;
} {
  const styleJson = data.styleJson;
  switch (data.contentKind) {
    case QrContentKind.URL:
      return {
        contentKind: QrContentKind.URL,
        destinationUrl: data.destinationUrl,
        styleJson,
      };
    case QrContentKind.EMAIL:
      return {
        contentKind: QrContentKind.EMAIL,
        destinationUrl: null,
        payloadJson: data.payloadJson as Prisma.InputJsonValue,
        styleJson,
      };
    case QrContentKind.PHONE:
      return {
        contentKind: QrContentKind.PHONE,
        destinationUrl: null,
        payloadJson: data.payloadJson as Prisma.InputJsonValue,
        styleJson,
      };
    case QrContentKind.SMS:
      return {
        contentKind: QrContentKind.SMS,
        destinationUrl: null,
        payloadJson: data.payloadJson as Prisma.InputJsonValue,
        styleJson,
      };
    case QrContentKind.TEXT:
      return {
        contentKind: QrContentKind.TEXT,
        destinationUrl: null,
        payloadJson: data.payloadJson as Prisma.InputJsonValue,
        styleJson,
      };
    case QrContentKind.WIFI:
      return {
        contentKind: QrContentKind.WIFI,
        destinationUrl: null,
        payloadJson: data.payloadJson as Prisma.InputJsonValue,
        styleJson,
      };
    case QrContentKind.BARCODE:
      return {
        contentKind: QrContentKind.BARCODE,
        destinationUrl: null,
        payloadJson: data.payloadJson as Prisma.InputJsonValue,
        styleJson,
      };
    case QrContentKind.LINK_PAGE:
      return {
        contentKind: QrContentKind.LINK_PAGE,
        destinationUrl: null,
        payloadJson: data.payloadJson as Prisma.InputJsonValue,
        styleJson,
      };
    default:
      throw new Error("Unsupported QR content kind.");
  }
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const qrs = await db.qrCode.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ qrs });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createQrBodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Invalid payload." },
      { status: 400 },
    );
  }

  const fields = createDataFromBody(parsed.data);

  try {
    if (session.user.planCode === PlanCode.PRO) {
      return await createProQrResponse({
        userId: session.user.id,
        ...fields,
      });
    }

    return await createFreeQrResponse({
      userId: session.user.id,
      ...fields,
    });
  } catch (error) {
    console.error("[POST /api/qrs]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error:
          message.length > 280
            ? "Could not create QR (server error). Check logs or database connectivity."
            : message,
      },
      { status: 500 },
    );
  }
}

async function createProQrResponse(params: {
  userId: string;
  contentKind: QrContentKind;
  destinationUrl: string | null;
  payloadJson?: Prisma.InputJsonValue;
  styleJson: QrStyleV1 | undefined;
}) {
  const slug = crypto.randomUUID().slice(0, 10);
  const expiresAt = new Date("2099-12-31T00:00:00.000Z");
  const base = {
    userId: params.userId,
    slug,
    contentKind: params.contentKind,
    destinationUrl: params.destinationUrl,
    maxScans: 999999999,
    expiresAt,
    ...(params.payloadJson !== undefined ? { payloadJson: params.payloadJson } : {}),
  };

  try {
    const qr = await db.qrCode.create({
      data: {
        ...base,
        ...(params.styleJson !== undefined
          ? { styleJson: params.styleJson as Prisma.InputJsonValue }
          : {}),
      },
    });
    const publicUrl = `${appUrl}/qr/${slug}`;
    let imageDataUrl: string | undefined;
    if (params.contentKind === QrContentKind.BARCODE && params.payloadJson !== undefined) {
      const parsed = barcodePayloadSchema.safeParse(params.payloadJson);
      if (parsed.success) {
        imageDataUrl = await renderBarcodePngDataUrl(parsed.data);
      }
    }
    return NextResponse.json({
      qr,
      publicUrl,
      ...(imageDataUrl ? { imageDataUrl } : {}),
    });
  } catch (e) {
    if (params.styleJson !== undefined && isMissingStyleJsonColumn(e)) {
      const qr = await db.qrCode.create({ data: base });
      const publicUrl = `${appUrl}/qr/${slug}`;
      let imageDataUrl: string | undefined;
      if (params.contentKind === QrContentKind.BARCODE && params.payloadJson !== undefined) {
        const parsed = barcodePayloadSchema.safeParse(params.payloadJson);
        if (parsed.success) {
          imageDataUrl = await renderBarcodePngDataUrl(parsed.data);
        }
      }
      return NextResponse.json({
        qr,
        publicUrl,
        ...(imageDataUrl ? { imageDataUrl } : {}),
        warning: STYLE_MIGRATION_HINT,
      });
    }
    throw e;
  }
}

async function createFreeQrResponse(params: {
  userId: string;
  contentKind: QrContentKind;
  destinationUrl: string | null;
  payloadJson?: Prisma.InputJsonValue;
  styleJson: QrStyleV1 | undefined;
}) {
  try {
    const created = await createFreeQr({
      userId: params.userId,
      contentKind: params.contentKind,
      destinationUrl: params.destinationUrl,
      ...(params.payloadJson !== undefined ? { payloadJson: params.payloadJson } : {}),
      styleJson: params.styleJson as Prisma.InputJsonValue | undefined,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (params.styleJson !== undefined && isMissingStyleJsonColumn(e)) {
      const created = await createFreeQr({
        userId: params.userId,
        contentKind: params.contentKind,
        destinationUrl: params.destinationUrl,
        ...(params.payloadJson !== undefined ? { payloadJson: params.payloadJson } : {}),
      });
      return NextResponse.json(
        { ...created, warning: STYLE_MIGRATION_HINT },
        { status: 201 },
      );
    }
    throw e;
  }
}
