import { addHours } from "date-fns";
import { NextResponse } from "next/server";
import { z } from "zod";

import { buildResetToken } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendPasswordResetEmail } from "@/server/email/send-password-reset-email";

const forgotSchema = z.object({
  email: z.email(),
});

function buildResetPasswordUrl(rawToken: string): string {
  const base = env.appUrl.replace(/\/+$/, "");
  const qs = new URLSearchParams({ token: rawToken });
  return `${base}/reset-password?${qs.toString()}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = forgotSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, email: true },
  });

  // Same response whether the account exists, has no password (e.g. Google-only), or is unknown.
  if (!user?.passwordHash) {
    return NextResponse.json({ ok: true });
  }

  await db.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  const { rawToken, hashedToken } = buildResetToken();

  const tokenRow = await db.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt: addHours(new Date(), 1),
    },
  });

  const resetUrl = buildResetPasswordUrl(rawToken);
  const emailResult = await sendPasswordResetEmail({
    to: user.email,
    resetUrl,
    appUrl: env.appUrl,
  });

  if (!emailResult.sent) {
    await db.passwordResetToken.delete({ where: { id: tokenRow.id } }).catch(() => {});
    const message =
      emailResult.reason === "missing_api_key"
        ? "Email is not configured on this server. Contact support."
        : "We could not send the email right now. Please try again in a few minutes.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
