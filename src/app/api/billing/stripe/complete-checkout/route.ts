import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/lib/auth/session";
import { completeStripeCheckoutForUser } from "@/server/stripe-service";

const bodySchema = z.object({
  checkoutSessionId: z.string().min(1),
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
    await completeStripeCheckoutForUser({
      userId: session.user.id,
      checkoutSessionId: parsed.data.checkoutSessionId,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Could not complete Stripe checkout.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
