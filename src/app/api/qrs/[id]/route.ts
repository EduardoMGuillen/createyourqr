import { NextResponse } from "next/server";
import { QrStatus } from "@prisma/client";

import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { patchQrBodySchema } from "@/lib/validators";

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

  const updated = await db.qrCode.update({
    where: { id },
    data: {
      destinationUrl:
        parsed.data.destinationUrl ?? current.destinationUrl,
      status: parsed.data.disabled ? QrStatus.DISABLED : current.status,
      ...(parsed.data.styleJson !== undefined
        ? { styleJson: parsed.data.styleJson }
        : {}),
    },
  });

  return NextResponse.json({ qr: updated });
}
