"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { useState } from "react";

type BillingButtonProps = {
  paypalClientId: string;
  paypalPlanId: string;
  userId: string;
  /** Use `dark` on dark backgrounds (e.g. pricing Pro card). */
  variant?: "light" | "dark";
};

export function BillingButton({
  paypalClientId,
  paypalPlanId,
  userId,
  variant = "light",
}: BillingButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isDark = variant === "dark";

  if (!paypalClientId || !paypalPlanId) {
    return (
      <p
        className={
          isDark ? "text-sm text-amber-200" : "text-sm text-amber-800"
        }
      >
        PayPal billing is not configured. Add{" "}
        <code
          className={
            isDark ? "rounded bg-zinc-800 px-1 text-amber-100" : "rounded bg-amber-100 px-1"
          }
        >
          NEXT_PUBLIC_PAYPAL_CLIENT_ID
        </code>{" "}
        and{" "}
        <code
          className={
            isDark ? "rounded bg-zinc-800 px-1 text-amber-100" : "rounded bg-amber-100 px-1"
          }
        >
          PAYPAL_PLAN_ID
        </code>{" "}
        (or{" "}
        <code
          className={
            isDark ? "rounded bg-zinc-800 px-1 text-amber-100" : "rounded bg-amber-100 px-1"
          }
        >
          NEXT_PUBLIC_PAYPAL_PLAN_ID
        </code>
        ) in your environment.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p
        className={
          isDark ? "text-sm font-medium text-white" : "text-sm font-medium text-zinc-900"
        }
      >
        Upgrade to Pro
      </p>
      <PayPalScriptProvider
        options={{
          clientId: paypalClientId,
          vault: true,
          intent: "subscription",
        }}
      >
        <PayPalButtons
          style={{
            shape: "pill",
            color: "silver",
            layout: "vertical",
            label: "subscribe",
          }}
          createSubscription={(_data, actions) =>
            actions.subscription.create({
              plan_id: paypalPlanId,
              custom_id: userId,
            })
          }
          onApprove={async (data) => {
            setError(null);
            const subscriptionID = data.subscriptionID;
            if (!subscriptionID) {
              setError("PayPal did not return a subscription id.");
              return;
            }
            const response = await fetch("/api/billing/paypal/complete-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ subscriptionID }),
            });
            const body = (await response.json().catch(() => null)) as { error?: string } | null;
            if (!response.ok) {
              setError(body?.error ?? "PayPal could not activate your subscription.");
              return;
            }
            router.refresh();
            router.push("/dashboard?billing=success");
          }}
          onError={(err) => {
            console.error(err);
            setError("PayPal checkout failed. Please try again.");
          }}
        />
      </PayPalScriptProvider>
      {error ? (
        <p className={isDark ? "text-sm text-red-300" : "text-sm text-red-600"}>{error}</p>
      ) : null}
    </div>
  );
}
