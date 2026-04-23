"use client";

import { useState } from "react";

type StripeBillingButtonProps = {
  variant?: "light" | "dark";
};

export function StripeBillingButton({ variant = "light" }: StripeBillingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDark = variant === "dark";

  async function onClick() {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/billing/stripe/create-checkout-session", {
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as
        | { checkoutUrl?: string; error?: string }
        | null;
      if (!response.ok || !body?.checkoutUrl) {
        setError(body?.error ?? "Could not start Stripe checkout.");
        return;
      }
      window.location.href = body.checkoutUrl;
    } catch {
      setError("Could not start Stripe checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={loading}
        className={
          isDark
            ? "w-full rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 disabled:opacity-60"
            : "w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
        }
      >
        {loading ? "Redirecting..." : "Subscribe with Stripe"}
      </button>
      {error ? (
        <p className={isDark ? "text-xs text-red-300" : "text-xs text-red-600"}>{error}</p>
      ) : null}
    </div>
  );
}
