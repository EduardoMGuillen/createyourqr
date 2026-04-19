import { addHours } from "date-fns";
import { NextResponse } from "next/server";
import { z } from "zod";

import { buildResetToken } from "@/lib/auth/password";
import { db } from "@/lib/db";

const forgotSchema = z.object({
  email: z.email(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = forgotSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const { rawToken, hashedToken } = buildResetToken();

  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt: addHours(new Date(), 1),
    },
  });

  // This token is returned so you can wire email provider later.
  return NextResponse.json({
    ok: true,
    resetToken: process.env.NODE_ENV === "development" ? rawToken : undefined,
  });
}
