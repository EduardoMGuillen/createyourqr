import { addMonths } from "date-fns";
import { SubscriptionStatus } from "@prisma/client";
import Stripe from "stripe";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  assertNoOtherActiveProvider,
  grantProAccess,
  removeProAccessIfNoActiveSubscriptions,
} from "@/server/subscription-access";

let stripeClient: Stripe | null = null;

function getStripeClient() {
  if (!env.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey);
  }
  return stripeClient;
}

async function resolveStripeProPriceId() {
  if (env.stripeProPriceId) {
    if (env.stripeProPriceId.startsWith("price_")) {
      return env.stripeProPriceId;
    }
    // DX guardrail: many dashboards show product ids first (`prod_...`), but checkout needs `price_...`.
    if (env.stripeProPriceId.startsWith("prod_")) {
      const stripe = getStripeClient();
      const priceList = await stripe.prices.list({
        product: env.stripeProPriceId,
        active: true,
        recurring: { interval: "month" },
        limit: 10,
      });
      const recurringPrice = priceList.data.find((item) => item.type === "recurring");
      if (!recurringPrice) {
        throw new Error(
          "STRIPE_PRO_PRICE_ID points to a product without active monthly recurring prices.",
        );
      }
      return recurringPrice.id;
    }
    throw new Error("STRIPE_PRO_PRICE_ID must start with price_ (or prod_ for fallback lookup).");
  }

  const stripe = getStripeClient();
  const priceList = await stripe.prices.list({
    product: env.stripeProProductId,
    active: true,
    recurring: { interval: "month" },
    limit: 10,
  });
  const recurringPrice = priceList.data.find((item) => item.type === "recurring");
  if (!recurringPrice) {
    throw new Error("No active recurring Stripe price found for STRIPE_PRO_PRODUCT_ID.");
  }
  return recurringPrice.id;
}

export async function createStripeCheckoutSession(userId: string) {
  await assertNoOtherActiveProvider(userId, "stripe");
  const stripe = getStripeClient();
  const priceId = await resolveStripeProPriceId();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.appUrl}/dashboard?billing=success&provider=stripe`,
    cancel_url: `${env.appUrl}/pricing?billing=cancel&provider=stripe`,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }
  return { checkoutUrl: session.url };
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  if (status === "active" || status === "trialing") return SubscriptionStatus.ACTIVE;
  if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
    return SubscriptionStatus.CANCELED;
  }
  if (status === "past_due" || status === "incomplete") return SubscriptionStatus.PAST_DUE;
  if (status === "paused") return SubscriptionStatus.SUSPENDED;
  return SubscriptionStatus.INCOMPLETE;
}

function subscriptionPeriodEndUnix(subscription: Stripe.Subscription): number | undefined {
  const periods = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (periods.length === 0) return undefined;
  return Math.max(...periods);
}

async function upsertStripeSubscription(params: {
  userId: string;
  subscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodEndUnix?: number;
}) {
  await db.subscription.upsert({
    where: { providerSubscriptionId: params.subscriptionId },
    create: {
      userId: params.userId,
      provider: "stripe",
      providerSubscriptionId: params.subscriptionId,
      status: params.status,
      renewalDate: params.currentPeriodEndUnix
        ? new Date(params.currentPeriodEndUnix * 1000)
        : addMonths(new Date(), 1),
    },
    update: {
      userId: params.userId,
      status: params.status,
      renewalDate: params.currentPeriodEndUnix
        ? new Date(params.currentPeriodEndUnix * 1000)
        : addMonths(new Date(), 1),
    },
  });
}

export async function processStripeWebhook(rawBody: string, signature: string) {
  if (!env.stripeWebhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }
  const stripe = getStripeClient();
  const event = stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);

  const existing = await db.billingEvent.findUnique({
    where: { providerEventId: event.id },
  });
  if (existing) return;

  await db.billingEvent.create({
    data: {
      provider: "stripe",
      providerEventId: event.id,
      type: event.type,
      payloadJson: event as unknown as object,
    },
  });

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const subscriptionId =
      typeof checkoutSession.subscription === "string"
        ? checkoutSession.subscription
        : checkoutSession.subscription?.id;
    const userId = checkoutSession.metadata?.userId;
    if (!subscriptionId || !userId) return;

    await upsertStripeSubscription({
      userId,
      subscriptionId,
      status: SubscriptionStatus.ACTIVE,
    });
    await grantProAccess(userId);
    return;
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;
    const stored = await db.subscription.findUnique({
      where: { providerSubscriptionId: subscriptionId },
    });
    if (!stored) return;

    const mappedStatus = mapStripeStatus(subscription.status);
    const periodEndUnix = subscriptionPeriodEndUnix(subscription);
    await db.subscription.update({
      where: { id: stored.id },
      data: {
        status: mappedStatus,
        renewalDate: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
      },
    });

    if (mappedStatus === SubscriptionStatus.ACTIVE) {
      await grantProAccess(stored.userId);
    } else {
      await removeProAccessIfNoActiveSubscriptions(stored.userId);
    }
  }
}
