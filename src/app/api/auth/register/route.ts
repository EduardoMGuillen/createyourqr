import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/server/email/send-welcome-email";

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(2).max(80).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await db.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      planCode: true,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const welcomeResult = await sendWelcomeEmail({
    to: user.email,
    name: user.name,
    appUrl,
  });

  return NextResponse.json(
    {
      user,
      welcomeEmailSent: welcomeResult.sent,
    },
    { status: 201 },
  );
}
