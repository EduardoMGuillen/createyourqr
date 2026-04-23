import { addMonths } from "date-fns";
import { PlanCode, QrStatus, SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";

export async function grantProAccess(userId: string) {
  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { planCode: PlanCode.PRO },
    }),
    db.qrCode.updateMany({
      where: { userId },
      data: {
        status: QrStatus.ACTIVE,
        maxScans: 999999999,
        expiresAt: addMonths(new Date(), 120),
      },
    }),
  ]);
}

export async function removeProAccessIfNoActiveSubscriptions(userId: string) {
  const activeSubscriptions = await db.subscription.count({
    where: { userId, status: SubscriptionStatus.ACTIVE },
  });
  if (activeSubscriptions > 0) return;

  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { planCode: PlanCode.FREE },
    }),
    db.qrCode.updateMany({
      where: { userId },
      data: { maxScans: 50 },
    }),
  ]);
}

export async function assertNoOtherActiveProvider(
  userId: string,
  provider: "paypal" | "stripe",
) {
  const active = await db.subscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      NOT: { provider },
    },
  });
  if (active) {
    throw new Error(`You already have an active ${active.provider} subscription.`);
  }
}
