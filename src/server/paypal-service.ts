import { addMonths } from "date-fns";
import { SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  assertNoOtherActiveProvider,
  grantProAccess,
  removeProAccessIfNoActiveSubscriptions,
} from "@/server/subscription-access";

type PayPalCreateSubscriptionResponse = {
  id: string;
  links: Array<{ rel: string; href: string }>;
};

export async function getAccessToken() {
  const auth = Buffer.from(
    `${env.paypalClientId}:${env.paypalClientSecret}`,
  ).toString("base64");

  const response = await fetch(`${env.paypalBaseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not authenticate with PayPal.");
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function createPaypalSubscription(userId: string) {
  await assertNoOtherActiveProvider(userId, "paypal");

  if (!env.paypalPlanId) {
    throw new Error("PAYPAL_PLAN_ID is not configured.");
  }

  const token = await getAccessToken();
  const response = await fetch(`${env.paypalBaseUrl}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      plan_id: env.paypalPlanId,
      custom_id: userId,
      application_context: {
        brand_name: "CreateYourQR",
        return_url: `${env.appUrl}/dashboard?billing=success`,
        cancel_url: `${env.appUrl}/pricing?billing=cancel`,
        user_action: "SUBSCRIBE_NOW",
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not create PayPal subscription.");
  }

  const payload =
    (await response.json()) as PayPalCreateSubscriptionResponse;
  const approveUrl = payload.links.find((link) => link.rel === "approve")?.href;

  if (!approveUrl) {
    throw new Error("PayPal did not return an approval URL.");
  }

  await db.subscription.upsert({
    where: {
      providerSubscriptionId: payload.id,
    },
    create: {
      userId,
      provider: "paypal",
      providerSubscriptionId: payload.id,
      status: SubscriptionStatus.INCOMPLETE,
    },
    update: {
      userId,
      status: SubscriptionStatus.INCOMPLETE,
    },
  });

  return { approveUrl };
}

export type PayPalSubscriptionDetail = {
  status?: string;
  custom_id?: string;
  plan_id?: string;
};

export async function fetchPayPalSubscription(
  subscriptionId: string,
): Promise<PayPalSubscriptionDetail> {
  const token = await getAccessToken();
  const response = await fetch(
    `${env.paypalBaseUrl}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Could not verify subscription with PayPal.");
  }

  return (await response.json()) as PayPalSubscriptionDetail;
}

/** Called after Smart Buttons `onApprove` so Pro unlocks immediately; webhooks still handle renewals. */
export async function completeSmartButtonSubscription(params: {
  userId: string;
  subscriptionId: string;
}) {
  await assertNoOtherActiveProvider(params.userId, "paypal");

  const existing = await db.subscription.findUnique({
    where: { providerSubscriptionId: params.subscriptionId },
  });
  if (existing && existing.userId !== params.userId) {
    const err = new Error("Subscription belongs to another account.");
    (err as { code?: string }).code = "FORBIDDEN";
    throw err;
  }

  const detail = await fetchPayPalSubscription(params.subscriptionId);

  if (detail.custom_id) {
    if (detail.custom_id !== params.userId) {
      const err = new Error("Subscription does not match this account.");
      (err as { code?: string }).code = "FORBIDDEN";
      throw err;
    }
  } else if (existing && existing.userId !== params.userId) {
    const err = new Error("Subscription belongs to another account.");
    (err as { code?: string }).code = "FORBIDDEN";
    throw err;
  }

  if (
    env.paypalPlanId &&
    detail.plan_id &&
    detail.plan_id !== env.paypalPlanId
  ) {
    throw new Error("Unexpected PayPal plan.");
  }

  const status = detail.status ?? "";
  if (status !== "ACTIVE" && status !== "APPROVED") {
    throw new Error(`Subscription is not active yet (status: ${status}).`);
  }

  await db.subscription.upsert({
    where: { providerSubscriptionId: params.subscriptionId },
    create: {
      userId: params.userId,
      provider: "paypal",
      providerSubscriptionId: params.subscriptionId,
      status: SubscriptionStatus.ACTIVE,
      renewalDate: addMonths(new Date(), 1),
    },
    update: {
      userId: params.userId,
      status: SubscriptionStatus.ACTIVE,
      renewalDate: addMonths(new Date(), 1),
    },
  });

  await grantProAccess(params.userId);
}

export async function refreshLatestPayPalSubscriptionForUser(userId: string) {
  const latest = await db.subscription.findFirst({
    where: {
      userId,
      provider: "paypal",
      status: { in: [SubscriptionStatus.INCOMPLETE, SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE] },
    },
    orderBy: { updatedAt: "desc" },
  });
  if (!latest?.providerSubscriptionId) {
    throw new Error("No PayPal subscription found to refresh.");
  }

  const detail = await fetchPayPalSubscription(latest.providerSubscriptionId);
  const status = detail.status ?? "";
  const isActive = status === "ACTIVE" || status === "APPROVED";

  await db.subscription.update({
    where: { id: latest.id },
    data: {
      status: isActive ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PAST_DUE,
      renewalDate: isActive ? addMonths(new Date(), 1) : null,
    },
  });

  if (isActive) {
    await grantProAccess(userId);
  }
}

export async function cancelPayPalSubscription(userId: string) {
  const latest = await db.subscription.findFirst({
    where: {
      userId,
      provider: "paypal",
      status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE, SubscriptionStatus.INCOMPLETE] },
    },
    orderBy: { updatedAt: "desc" },
  });
  if (!latest?.providerSubscriptionId) {
    throw new Error("No active PayPal subscription found.");
  }
  const fallbackRenewalDate = latest.renewalDate ?? addMonths(new Date(), 1);

  const token = await getAccessToken();
  const response = await fetch(
    `${env.paypalBaseUrl}/v1/billing/subscriptions/${encodeURIComponent(latest.providerSubscriptionId)}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason: "Canceled by customer from dashboard." }),
      cache: "no-store",
    },
  );

  if (!response.ok && response.status !== 204) {
    throw new Error("Could not cancel PayPal subscription.");
  }

  await db.subscription.update({
    where: { id: latest.id },
    data: { status: SubscriptionStatus.CANCELED, renewalDate: fallbackRenewalDate },
  });
}

function mapStatus(type: string): SubscriptionStatus | null {
  if (type === "BILLING.SUBSCRIPTION.ACTIVATED") return SubscriptionStatus.ACTIVE;
  if (type === "BILLING.SUBSCRIPTION.CANCELLED") return SubscriptionStatus.CANCELED;
  if (type === "BILLING.SUBSCRIPTION.SUSPENDED") return SubscriptionStatus.SUSPENDED;
  if (type === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") return SubscriptionStatus.PAST_DUE;
  return null;
}

type PayPalWebhookEvent = {
  id: string;
  event_type: string;
  resource?: {
    id?: string;
    custom_id?: string;
  };
};

export async function processPayPalWebhook(event: PayPalWebhookEvent) {
  const eventId = event.id;
  const eventType = event.event_type;

  const existing = await db.billingEvent.findUnique({
    where: { providerEventId: eventId },
  });
  if (existing) {
    return;
  }

  await db.billingEvent.create({
    data: {
      provider: "paypal",
      providerEventId: eventId,
      type: eventType,
      payloadJson: event as object,
    },
  });

  const subscriptionId = event.resource?.id;
  if (!subscriptionId) return;

  const mappedStatus = mapStatus(eventType);
  if (!mappedStatus) return;

  const subscription = await db.subscription.findFirst({
    where: { providerSubscriptionId: subscriptionId },
  });

  if (!subscription) return;

  const isPro = mappedStatus === SubscriptionStatus.ACTIVE;
  await db.subscription.update({
    where: { id: subscription.id },
    data: {
      status: mappedStatus,
      renewalDate: isPro ? addMonths(new Date(), 1) : null,
    },
  });

  if (isPro) {
    await grantProAccess(subscription.userId);
  } else {
    await removeProAccessIfNoActiveSubscriptions(subscription.userId);
  }
}

export async function verifyPayPalWebhookSignature(
  headers: Headers,
  body: unknown,
) {
  if (!env.paypalWebhookId) {
    return process.env.NODE_ENV !== "production";
  }

  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");
  const transmissionSig = headers.get("paypal-transmission-sig");

  if (
    !transmissionId ||
    !transmissionTime ||
    !certUrl ||
    !authAlgo ||
    !transmissionSig
  ) {
    return false;
  }

  const accessToken = await getAccessToken();
  const response = await fetch(
    `${env.paypalBaseUrl}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: env.paypalWebhookId,
        webhook_event: body,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as { verification_status?: string };
  return payload.verification_status === "SUCCESS";
}
