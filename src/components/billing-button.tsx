"use client";

import { useState } from "react";

export function BillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/billing/paypal/create-subscription", {
      method: "POST",
    });
    const data = (await response.json().catch(() => null)) as
      | { approveUrl?: string; error?: string }
      | null;

    setLoading(false);
    if (!response.ok || !data?.approveUrl) {
      setError(data?.error ?? "Could not open PayPal checkout.");
      return;
    }

    window.location.href = data.approveUrl;
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Redirecting..." : "Upgrade to Pro with PayPal"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
