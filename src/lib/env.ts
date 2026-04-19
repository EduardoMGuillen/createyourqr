export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  /**
   * PayPal REST Basic auth (same client id as the JS SDK). Prefer the public client id var used
   * on Vercel: `NEXT_PUBLIC_PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` + `PAYPAL_API_BASE`.
   */
  paypalClientId:
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ||
    process.env.PAYPAL_CLIENT_ID?.trim() ||
    "",
  /** Browser PayPal JS SDK (Smart Buttons). */
  paypalBrowserClientId:
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ||
    process.env.PAYPAL_CLIENT_ID?.trim() ||
    "",
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET?.trim() ?? "",
  /** Subscription billing plan id (`P-...`). Create it in PayPal Dashboard; separate from client id. */
  paypalPlanId:
    process.env.PAYPAL_PLAN_ID?.trim() ||
    process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID?.trim() ||
    process.env.PAYPAL_SUBSCRIPTION_PLAN_ID?.trim() ||
    process.env.PAYPAL_BILLING_PLAN_ID?.trim() ||
    "",
  paypalWebhookId: process.env.PAYPAL_WEBHOOK_ID ?? "",
  /**
   * REST API host (OAuth, billing, webhooks). Prefer `PAYPAL_API_BASE` — same pattern as a
   * typical Vercel setup (e.g. production `https://api-m.paypal.com`). If unset, falls back to
   * `PAYPAL_ENVIRONMENT === "live"` vs sandbox.
   */
  paypalBaseUrl: resolvePayPalBaseUrl(),
};

function resolvePayPalBaseUrl(): string {
  const explicit = process.env.PAYPAL_API_BASE?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }
  return process.env.PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}
