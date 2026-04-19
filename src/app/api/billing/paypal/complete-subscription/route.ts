import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/lib/auth/session";
import { completeSmartButtonSubscription } from "@/server/paypal-service";

const bodySchema = z.object({
  subscriptionID: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    await completeSmartButtonSubscription({
      userId: session.user.id,
      subscriptionId: parsed.data.subscriptionID,
    });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    const message =
      error instanceof Error ? error.message : "PayPal activation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
