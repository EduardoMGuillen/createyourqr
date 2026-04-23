"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function DashboardBillingSync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    const billing = searchParams.get("billing");
    const provider = searchParams.get("provider");
    if (billing !== "success" || !provider) return;

    handledRef.current = true;

    const run = async () => {
      try {
        if (provider === "stripe") {
          const checkoutSessionId = searchParams.get("session_id");
          if (!checkoutSessionId) {
            setError("Stripe payment completed but missing session id. Contact support.");
            return;
          }
          const response = await fetch("/api/billing/stripe/complete-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ checkoutSessionId }),
          });
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          if (!response.ok) {
            setError(body?.error ?? "Stripe payment could not be confirmed.");
            return;
          }
          setMessage("Stripe payment confirmed. Pro plan is now active.");
        } else if (provider === "paypal") {
          const response = await fetch("/api/billing/paypal/refresh-status", { method: "POST" });
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          if (!response.ok) {
            setError(body?.error ?? "PayPal status could not be confirmed.");
            return;
          }
          setMessage("PayPal payment confirmed. Pro plan is now active.");
        }

        router.refresh();
      } finally {
        // Clean noisy query params after sync attempt.
        window.history.replaceState(null, "", "/dashboard");
      }
    };

    void run();
  }, [router, searchParams]);

  if (!message && !error) return null;

  return (
    <div
      className={`rounded-md border px-4 py-2 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {error ?? message}
    </div>
  );
}
