import { Resend } from "resend";

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildPasswordResetHtml(params: { resetUrl: string; appUrl: string }) {
  const safeReset = escapeHtml(params.resetUrl);
  const safeApp = escapeHtml(params.appUrl);
  return `
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.55; color: #18181b; max-width: 560px;">
    <p><strong>Password reset</strong></p>
    <p>We received a request to reset the password for your CreateYourQR account. Use the button below to choose a new password. This link expires in <strong>one hour</strong>.</p>
    <p style="margin: 1.5rem 0;">
      <a href="${safeReset}" style="display: inline-block; background: #18181b; color: #fafafa; text-decoration: none; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600;">Reset password</a>
    </p>
    <p style="font-size: 13px; color: #52525b;">If the button does not work, copy and paste this URL into your browser:</p>
    <p style="font-size: 12px; word-break: break-all; color: #3f3f46;"><a href="${safeReset}" style="color: #2563eb;">${safeReset}</a></p>
    <p style="font-size: 13px; color: #71717a;">If you did not request this, you can ignore this email. Your password will stay the same.</p>
    <p style="font-size: 12px; color: #a1a1aa; margin-top: 2rem;">CreateYourQR — ${safeApp}</p>
  </body>
</html>
`.trim();
}

export type PasswordResetEmailResult =
  | { sent: true }
  | { sent: false; reason: "missing_api_key" | "send_failed" };

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
  appUrl: string;
}): Promise<PasswordResetEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY is not set; cannot send password reset email.");
    return { sent: false, reason: "missing_api_key" };
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM ?? "CreateYourQR <onboarding@resend.dev>";

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: "Reset your CreateYourQR password",
      html: buildPasswordResetHtml({
        resetUrl: params.resetUrl,
        appUrl: params.appUrl,
      }),
    });

    if (error) {
      console.error("[email] Resend password reset error:", error);
      return { sent: false, reason: "send_failed" };
    }

    return { sent: true };
  } catch (e) {
    console.error("[email] password reset send failed", e);
    return { sent: false, reason: "send_failed" };
  }
}
