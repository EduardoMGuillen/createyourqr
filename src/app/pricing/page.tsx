import Link from "next/link";

import { BillingButton } from "@/components/billing-button";
import { PaymentMethodBadges } from "@/components/payment-method-badges";
import { StripeBillingButton } from "@/components/stripe-billing-button";
import { SupportEmailButton } from "@/components/support-email-button";
import { getCurrentSession } from "@/lib/auth/session";
import { env } from "@/lib/env";

export const metadata = {
  title: "Pricing",
  description: "Choose between free QR generation and Pro reactivation.",
};

export default async function PricingPage() {
  const session = await getCurrentSession();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-14">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Pricing</h1>
      <p className="mt-3 max-w-2xl text-zinc-600">
        Launch campaigns fast with free dynamic QR codes, then unlock unlimited scans
        with Pro when your QR is already in the real world.
      </p>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <article className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="mt-2 text-3xl font-bold">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600">
            <li>Up to 10 saved QR codes at a time</li>
            <li>Up to 50 scans per QR</li>
            <li>5-day activation window</li>
            <li>Dynamic redirect links</li>
          </ul>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
          >
            Start free
          </Link>
        </article>

        <article className="rounded-xl border border-zinc-900 bg-zinc-900 p-6 text-white">
          <h2 className="text-xl font-semibold">Pro</h2>
          <p className="mt-2 text-3xl font-bold">$15 / month</p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-300">
            <li>Unlimited saved QR codes</li>
            <li>Unlimited scans</li>
            <li>No 5-day expiration</li>
            <li>Priority support for campaigns</li>
          </ul>
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Trusted payment methods
            </p>
            <PaymentMethodBadges variant="dark" />
          </div>
          <div className="mt-6">
            {session?.user ? (
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Stripe
                  </p>
                  <StripeBillingButton variant="dark" />
                </div>
                <div className="h-px bg-zinc-800" />
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    PayPal
                  </p>
                  <BillingButton
                    paypalClientId={env.paypalBrowserClientId}
                    paypalPlanId={env.paypalPlanId}
                    userId={session.user.id}
                    variant="dark"
                  />
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-block rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900"
              >
                Log in to upgrade
              </Link>
            )}
          </div>
          <div className="mt-4">
            <SupportEmailButton variant="button" source="pricing-page" />
          </div>
        </article>
      </section>
    </main>
  );
}
