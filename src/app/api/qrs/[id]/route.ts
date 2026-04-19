import { NextResponse } from "next/server";
import { QrStatus } from "@prisma/client";
import { z } from "zod";

import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { destinationUrlSchema } from "@/lib/validators";

const updateSchema = z.object({
  destinationUrl: destinationUrlSchema.optional(),
  disabled: z.boolean().optional(),
});

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
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
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
      destinationUrl: parsed.data.destinationUrl ?? current.destinationUrl,
      status: parsed.data.disabled ? QrStatus.DISABLED : current.status,
    },
  });

  return NextResponse.json({ qr: updated });
}
