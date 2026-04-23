import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/lib/auth/session";
import { cancelPayPalSubscription } from "@/server/paypal-service";
import { cancelStripeSubscription } from "@/server/stripe-service";

const bodySchema = z.object({
  provider: z.enum(["stripe", "paypal"]),
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
    if (parsed.data.provider === "stripe") {
      await cancelStripeSubscription(session.user.id);
    } else {
      await cancelPayPalSubscription(session.user.id);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not cancel subscription.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
