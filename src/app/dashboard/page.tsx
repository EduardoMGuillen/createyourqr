import { redirect } from "next/navigation";
import { PlanCode } from "@prisma/client";

import { BillingButton } from "@/components/billing-button";
import { CreateQrForm } from "@/components/create-qr-form";
import { getCurrentSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { formatQrDestinationCell } from "@/lib/qr-content";

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

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Signed in as {session.user.email} - Plan: {session.user.planCode}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {session.user.planCode !== PlanCode.PRO ? (
            <BillingButton
              paypalClientId={env.paypalBrowserClientId}
              paypalPlanId={env.paypalPlanId}
              userId={session.user.id}
            />
          ) : null}
        </div>
      </section>

      <CreateQrForm />

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Recent QR codes</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-600">
                <th className="px-2 py-2">Slug</th>
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Scans</th>
                <th className="px-2 py-2">Expires</th>
                <th className="px-2 py-2">Destination / content</th>
              </tr>
            </thead>
            <tbody>
              {qrs.map((qr) => (
                <tr key={qr.id} className="border-b border-zinc-100">
                  <td className="px-2 py-2 font-medium text-zinc-900">{qr.slug}</td>
                  <td className="px-2 py-2 text-zinc-700">{qr.contentKind}</td>
                  <td className="px-2 py-2">{qr.status}</td>
                  <td className="px-2 py-2">
                    {qr.scanCount} / {qr.maxScans}
                  </td>
                  <td className="px-2 py-2">{qr.expiresAt.toLocaleDateString()}</td>
                  <td className="max-w-[280px] truncate px-2 py-2 text-zinc-600">
                    {formatQrDestinationCell(qr)}
                  </td>
                </tr>
              ))}
              {qrs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-5 text-zinc-500">
                    No QR codes yet. Create your first one above.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
