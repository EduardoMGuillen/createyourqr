export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  /** Server-to-server PayPal (Basic auth). Falls back to NEXT_PUBLIC for local dev parity. */
  paypalClientId:
    process.env.PAYPAL_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ||
    "",
  /** Passed to the browser PayPal JS SDK (Smart Buttons). */
  paypalBrowserClientId:
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ||
    process.env.PAYPAL_CLIENT_ID?.trim() ||
    "",
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET ?? "",
  paypalPlanId:
    process.env.PAYPAL_PLAN_ID?.trim() ||
    process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID?.trim() ||
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
