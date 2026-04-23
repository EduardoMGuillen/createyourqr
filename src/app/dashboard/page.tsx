import Link from "next/link";
import { redirect } from "next/navigation";
import { PlanCode, SubscriptionStatus } from "@prisma/client";

import { DashboardBillingActions } from "@/components/dashboard-billing-actions";
import { DashboardBillingResync } from "@/components/dashboard-billing-resync";
import { DashboardBillingSync } from "@/components/dashboard-billing-sync";
import { CreateQrForm } from "@/components/create-qr-form";
import { DashboardRecentCodes } from "@/components/dashboard-recent-codes";
import { getCurrentSession } from "@/lib/auth/session";
import { appUrl } from "@/lib/app-url";
import { db } from "@/lib/db";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/login");
  }

  const qrs = await db.qrCode.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const activeSubscription = await db.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE, SubscriptionStatus.INCOMPLETE],
      },
    },
    orderBy: { updatedAt: "desc" },
    select: { provider: true },
  });
  const activeProvider =
    activeSubscription?.provider === "stripe" || activeSubscription?.provider === "paypal"
      ? activeSubscription.provider
      : null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
      <DashboardBillingSync />
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Signed in as {session.user.email} - Plan: {session.user.planCode}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DashboardBillingResync />
          <DashboardBillingActions activeProvider={activeProvider} />
          {session.user.planCode !== PlanCode.PRO ? (
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Upgrade to Pro
            </Link>
          ) : null}
        </div>
      </section>

      <CreateQrForm />

      <DashboardRecentCodes initialQrs={qrs} appUrl={appUrl} />
    </main>
  );
}
