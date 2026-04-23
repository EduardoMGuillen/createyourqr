import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { createStripeCheckoutSession } from "@/server/stripe-service";

export async function POST() {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const created = await createStripeCheckoutSession(session.user.id);
    return NextResponse.json(created);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start Stripe checkout.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
