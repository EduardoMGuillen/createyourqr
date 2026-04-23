"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DashboardBillingActionsProps = {
  activeProvider: "stripe" | "paypal" | null;
};

export function DashboardBillingActions({ activeProvider }: DashboardBillingActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!activeProvider) return null;

  async function onConfirmCancel() {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/billing/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: activeProvider }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(body?.error ?? "Could not cancel subscription.");
        return;
      }
      setOpen(false);
      setStep(1);
      router.refresh();
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
        Unsubscribe ({activeProvider})
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-zinc-900">Unsubscribe process</h2>
            {step === 1 ? (
              <>
                <p className="mt-2 text-sm text-zinc-600">
                  This action disables your {activeProvider} Pro subscription for this account.
                  You can still resubscribe at any time from pricing.
                </p>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                  <li>Your Pro billing will be canceled.</li>
                  <li>Dashboard will switch back to Free if no other active provider exists.</li>
                  <li>You can upgrade again anytime.</li>
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setStep(1);
                      setError(null);
                    }}
                    className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    Keep subscription
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-zinc-600">
                  Final confirmation: unsubscribe this account from {activeProvider} now?
                </p>
                {error ? (
                  <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void onConfirmCancel()}
                    disabled={loading}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                  >
                    {loading ? "Canceling..." : "Yes, unsubscribe"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
