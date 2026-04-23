import { NextResponse } from "next/server";
import { z } from "zod";

import { sendSupportEmails } from "@/server/email/send-support-email";

const bodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(4000),
  source: z.string().trim().min(1).max(80),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    await sendSupportEmails(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send support request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
