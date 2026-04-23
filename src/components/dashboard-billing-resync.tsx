"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DashboardBillingResync() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<"stripe" | "paypal">("stripe");
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onResync() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (provider === "stripe") {
        const subId = stripeSubscriptionId.trim();
        if (!subId) {
          setError("Enter your Stripe subscription id (sub_...).");
          return;
        }
        const response = await fetch("/api/billing/stripe/complete-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stripeSubscriptionId: subId }),
        });
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          setError(body?.error ?? "Stripe re-sync failed.");
          return;
        }
      } else {
        const response = await fetch("/api/billing/paypal/refresh-status", {
          method: "POST",
        });
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          setError(body?.error ?? "PayPal re-sync failed.");
          return;
        }
      }

      setMessage("Billing re-synced. Refreshing dashboard plan status...");
      router.refresh();
      window.setTimeout(() => {
        setOpen(false);
        setMessage(null);
      }, 800);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
      >
        Re-sync billing
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-zinc-900">Re-sync your subscription</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Use this if you paid but your dashboard still shows Free.
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setProvider("stripe")}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  provider === "stripe"
                    ? "border-violet-300 bg-violet-50 text-violet-800"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                Stripe
              </button>
              <button
                type="button"
                onClick={() => setProvider("paypal")}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  provider === "paypal"
                    ? "border-violet-300 bg-violet-50 text-violet-800"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                PayPal
              </button>
            </div>

            {provider === "stripe" ? (
              <div className="mt-4">
                <label htmlFor="stripe-sub-id" className="text-sm font-medium text-zinc-800">
                  Stripe subscription id
                </label>
                <input
                  id="stripe-sub-id"
                  type="text"
                  value={stripeSubscriptionId}
                  onChange={(event) => setStripeSubscriptionId(event.target.value)}
                  placeholder="sub_..."
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                />
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-600">
                We will verify your latest PayPal subscription for this account.
              </p>
            )}

            {error ? (
              <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {message}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void onResync()}
                disabled={loading}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
              >
                {loading ? "Syncing..." : "Re-sync now"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                  setMessage(null);
                }}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
