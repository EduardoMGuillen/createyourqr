"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type BillingButtonProps = {
  paypalClientId: string;
  paypalPlanId: string;
  userId: string;
  /** Use `dark` on dark backgrounds (e.g. pricing Pro card). */
  variant?: "light" | "dark";
};

/**
 * Merge server props with `NEXT_PUBLIC_*` inlined for the client bundle (Vercel), in case the
 * server snapshot was empty.
 */
function useEffectivePayPalConfig(props: { paypalClientId: string; paypalPlanId: string }) {
  return useMemo(() => {
    const clientId =
      props.paypalClientId.trim() ||
      (typeof process !== "undefined" &&
        process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim()) ||
      "";
    const planId =
      props.paypalPlanId.trim() ||
      (typeof process !== "undefined" &&
        process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID?.trim()) ||
      "";
    return { clientId, planId };
  }, [props.paypalClientId, props.paypalPlanId]);
}

export function BillingButton({
  paypalClientId,
  paypalPlanId,
  userId,
  variant = "light",
}: BillingButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isDark = variant === "dark";
  const { clientId, planId } = useEffectivePayPalConfig({ paypalClientId, paypalPlanId });

  const codeClass = isDark
    ? "rounded bg-zinc-800 px-1 text-amber-100"
    : "rounded bg-amber-100 px-1";

  if (!clientId) {
    return (
      <p className={isDark ? "text-sm text-amber-200" : "text-sm text-amber-800"}>
        PayPal client id is missing. Add{" "}
        <code className={codeClass}>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> in Vercel (from the PayPal
        Developer app). <code className={codeClass}>PAYPAL_API_BASE</code> and{" "}
        <code className={codeClass}>PAYPAL_CLIENT_SECRET</code> are used on the server for REST
        calls.
      </p>
    );
  }

  if (!planId) {
    return (
      <p className={isDark ? "text-sm text-amber-200" : "text-sm text-amber-800"}>
        PayPal <strong>subscription plan id</strong> is missing. Smart Buttons need a billing plan
        id (starts with <code className={codeClass}>P-</code>). In PayPal Dashboard create a
        subscription plan, then set{" "}
        <code className={codeClass}>PAYPAL_PLAN_ID</code> or{" "}
        <code className={codeClass}>NEXT_PUBLIC_PAYPAL_PLAN_ID</code> in Vercel. That value is
        different from the client id: it identifies the $15/mo (or your) plan, not the app
        credentials.
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
          clientId,
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
              plan_id: planId,
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
