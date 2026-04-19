import { Resend } from "resend";

import {
  mapResendErrorName,
  type ResendEmailFailureCode,
} from "@/server/email/resend-failure-codes";

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildWelcomeHtml(params: {
  name?: string | null;
  email: string;
  appUrl: string;
}) {
  const greeting = params.name
    ? `Hi ${escapeHtml(params.name)},`
    : "Hi there,";

  return `
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #18181b;">
    <p>${greeting}</p>
    <p><strong>Your CreateYourQR account was successfully created.</strong></p>
    <p>You can sign in with:</p>
    <ul>
      <li><strong>Email:</strong> ${escapeHtml(params.email)}</li>
      <li><strong>Password:</strong> the one you chose on the registration form (we never store it in plain text and do not send it by email for security).</li>
    </ul>
    <p>
      <a href="${escapeHtml(params.appUrl)}/login" style="color: #18181b;">Go to login</a>
      &nbsp;·&nbsp;
      <a href="${escapeHtml(params.appUrl)}/dashboard" style="color: #18181b;">Open dashboard</a>
    </p>
    <p style="font-size: 12px; color: #71717a;">CreateYourQR — dynamic QR codes with a simple free tier.</p>
  </body>
</html>
`.trim();
}

export type WelcomeEmailResult =
  | { sent: true }
  | { sent: false; failureCode: ResendEmailFailureCode };

export async function sendWelcomeEmail(params: {
  to: string;
  name?: string | null;
  appUrl: string;
}): Promise<WelcomeEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY is not set or empty; skipping welcome email.");
    return { sent: false, failureCode: "missing_api_key" };
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM?.trim() ?? "CreateYourQR <onboarding@resend.dev>";

  try {
    const result = await resend.emails.send({
      from,
      to: params.to,
      subject: "Your CreateYourQR account was successfully created",
      html: buildWelcomeHtml({
        name: params.name,
        email: params.to,
        appUrl: params.appUrl,
      }),
    });

    if (result.error) {
      const code = mapResendErrorName(result.error.name);
      console.error(
        "[email] Resend welcome email rejected:",
        result.error.name,
        result.error.message,
        "statusCode:",
        result.error.statusCode,
        "from:",
        from,
        "to:",
        params.to,
      );
      return { sent: false, failureCode: code };
    }

    return { sent: true };
  } catch (e) {
    console.error("[email] welcome send threw:", e);
    return { sent: false, failureCode: "unknown" };
  }
}
