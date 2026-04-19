import { NextResponse } from "next/server";

import {
  processPayPalWebhook,
  verifyPayPalWebhookSignature,
} from "@/server/paypal-service";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const event = (() => {
    try {
      return JSON.parse(rawBody || "{}") as { id?: string; event_type?: string };
    } catch {
      return null;
    }
  })();
  if (!event?.id || !event?.event_type) {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
  const normalizedEvent = {
    id: event.id,
    event_type: event.event_type,
    resource:
      typeof event === "object" && event !== null && "resource" in event
        ? (event as { resource?: { id?: string; custom_id?: string } }).resource
        : undefined,
  };

  const isValidSignature = await verifyPayPalWebhookSignature(
    request.headers,
    normalizedEvent,
  );
  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  await processPayPalWebhook(normalizedEvent);
  return NextResponse.json({ ok: true });
}
