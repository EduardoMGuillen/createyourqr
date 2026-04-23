import { NextResponse } from "next/server";

import { processStripeWebhook } from "@/server/stripe-service";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  try {
    await processStripeWebhook(rawBody, signature);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe webhook failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
