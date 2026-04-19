import { NextResponse } from "next/server";
import { Prisma, QrStatus } from "@prisma/client";

import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { parseMergedQrWrite, patchQrBodySchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = patchQrBodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Invalid payload." },
      { status: 400 },
    );
  }

  const current = await db.qrCode.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!current) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const nextKind = parsed.data.contentKind ?? current.contentKind;
  const nextDestinationUrl =
    parsed.data.destinationUrl !== undefined
      ? parsed.data.destinationUrl
      : current.destinationUrl;
  const nextPayloadJson =
    parsed.data.payloadJson !== undefined
      ? parsed.data.payloadJson
      : current.payloadJson;

  const merged = parseMergedQrWrite({
    contentKind: nextKind,
    destinationUrl: nextDestinationUrl,
    payloadJson: nextPayloadJson,
  });

  if (!merged.ok) {
    const first = merged.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Invalid payload for this QR type." },
      { status: 400 },
    );
  }

  const payloadJson: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue =
    merged.value.payloadJson === null
      ? Prisma.DbNull
      : (merged.value.payloadJson as Prisma.InputJsonValue);

  const updated = await db.qrCode.update({
    where: { id },
    data: {
      contentKind: merged.value.contentKind,
      destinationUrl: merged.value.destinationUrl,
      payloadJson,
      status: parsed.data.disabled ? QrStatus.DISABLED : current.status,
      ...(parsed.data.styleJson !== undefined
        ? { styleJson: parsed.data.styleJson }
        : {}),
    },
  });

  return NextResponse.json({ qr: updated });
}
