import { NextResponse } from "next/server";
import { PlanCode } from "@prisma/client";
import { z } from "zod";

import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { destinationUrlSchema } from "@/lib/validators";
import { createFreeQr } from "@/server/qr-service";

const createQrSchema = z.object({
  destinationUrl: destinationUrlSchema,
});

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
  const parsed = createQrSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (session.user.planCode === PlanCode.PRO) {
    const slug = crypto.randomUUID().slice(0, 10);
    const expiresAt = new Date("2099-12-31T00:00:00.000Z");
    const qr = await db.qrCode.create({
      data: {
        userId: session.user.id,
        slug,
        destinationUrl: parsed.data.destinationUrl,
        maxScans: 999999999,
        expiresAt,
      },
    });

    return NextResponse.json({
      qr,
      publicUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/qr/${slug}`,
    });
  }

  const created = await createFreeQr({
    userId: session.user.id,
    destinationUrl: parsed.data.destinationUrl,
  });

  return NextResponse.json(created, { status: 201 });
}
