import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { createPaypalSubscription } from "@/server/paypal-service";

export async function POST() {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const created = await createPaypalSubscription(session.user.id);
    return NextResponse.json(created);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not start PayPal checkout." },
      { status: 500 },
    );
  }
}
