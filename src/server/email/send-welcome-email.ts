import { Resend } from "resend";

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
  | { sent: false; reason: "missing_api_key" | "send_failed" };

export async function sendWelcomeEmail(params: {
  to: string;
  name?: string | null;
  appUrl: string;
}): Promise<WelcomeEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY is not set; skipping welcome email.");
    return { sent: false, reason: "missing_api_key" };
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM ?? "CreateYourQR <onboarding@resend.dev>";

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: "Your CreateYourQR account was successfully created",
      html: buildWelcomeHtml({
        name: params.name,
        email: params.to,
        appUrl: params.appUrl,
      }),
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { sent: false, reason: "send_failed" };
    }

    return { sent: true };
  } catch (e) {
    console.error("[email] welcome send failed", e);
    return { sent: false, reason: "send_failed" };
  }
}
