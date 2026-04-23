import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { refreshLatestPayPalSubscriptionForUser } from "@/server/paypal-service";

export async function POST() {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    await refreshLatestPayPalSubscriptionForUser(session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not refresh PayPal status.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
