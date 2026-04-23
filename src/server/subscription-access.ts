import { PlanCode, QrStatus, SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";

const PRO_MAX_SCANS = 999999999;
const PRO_NEVER_EXPIRES_AT = new Date("2099-12-31T00:00:00.000Z");

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
        maxScans: PRO_MAX_SCANS,
        expiresAt: PRO_NEVER_EXPIRES_AT,
      },
    }),
  ]);
}

export async function removeProAccessIfNoActiveSubscriptions(userId: string) {
  const hasProWindow = await hasProAccessWindow(userId);
  if (hasProWindow) return;
  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { planCode: PlanCode.FREE },
    }),
    db.qrCode.updateMany({
      where: { userId },
      data: {
        status: QrStatus.EXPIRED_TIME,
        maxScans: 50,
        expiresAt: new Date(),
      },
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

async function hasProAccessWindow(userId: string) {
  const now = new Date();
  const sub = await db.subscription.findFirst({
    where: {
      userId,
      OR: [
        { status: SubscriptionStatus.ACTIVE },
        { status: SubscriptionStatus.CANCELED, renewalDate: { gt: now } },
      ],
    },
    select: { id: true },
  });
  return Boolean(sub);
}

/**
 * Enforce plan lifecycle from subscription windows:
 * - Active subscriptions => PRO (all QRs set to never-expire semantics)
 * - Canceled with future renewalDate => keep PRO until period end
 * - No valid window => FREE + expire all QRs immediately
 */
export async function syncUserPlanBySubscriptionWindow(userId: string) {
  const hasProWindow = await hasProAccessWindow(userId);
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { planCode: true },
  });
  if (!user) return;

  if (hasProWindow) {
    if (user.planCode !== PlanCode.PRO) {
      await grantProAccess(userId);
    }
    return;
  }

  // Always enforce FREE limits when no paid window exists.
  // This also fixes cases where user.planCode is already FREE but old QRs still have "Never" expiry.
  await removeProAccessIfNoActiveSubscriptions(userId);
}
