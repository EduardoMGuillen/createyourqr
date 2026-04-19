export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  paypalClientId: process.env.PAYPAL_CLIENT_ID ?? "",
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET ?? "",
  paypalPlanId: process.env.PAYPAL_PLAN_ID ?? "",
  paypalWebhookId: process.env.PAYPAL_WEBHOOK_ID ?? "",
  paypalBaseUrl:
    process.env.PAYPAL_ENVIRONMENT === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com",
};
