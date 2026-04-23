import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { syncUserPlanBySubscriptionWindow } from "@/server/subscription-access";

export async function getCurrentSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return session;

  await syncUserPlanBySubscriptionWindow(session.user.id);

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { planCode: true },
  });
  if (user) {
    session.user.planCode = user.planCode;
  }
  return session;
}
