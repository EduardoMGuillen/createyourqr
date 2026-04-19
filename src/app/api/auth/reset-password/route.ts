import { isAfter } from "date-fns";
import { NextResponse } from "next/server";
import { z } from "zod";

import { hashResetToken, hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const tokenHash = hashResetToken(parsed.data.token);
  const token = await db.passwordResetToken.findUnique({
    where: { token: tokenHash },
  });

  if (!token || token.usedAt || isAfter(new Date(), token.expiresAt)) {
    return NextResponse.json(
      { error: "Token is invalid or expired." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await db.$transaction([
    db.user.update({
      where: { id: token.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
