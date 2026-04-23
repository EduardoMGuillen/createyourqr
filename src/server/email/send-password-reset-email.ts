import { Resend } from "resend";
import {
  buildBrandedEmailLayout,
  escapeHtml,
} from "@/server/email/email-template";

function buildPasswordResetHtml(params: { resetUrl: string; appUrl: string }) {
  const safeReset = escapeHtml(params.resetUrl);
  const bodyHtml = `
    <p style="margin:0 0 12px;line-height:1.6;">We received a request to reset your CreateYourQR password.</p>
    <p style="margin:0 0 16px;line-height:1.6;">Use the button below to choose a new password. This link expires in <strong>one hour</strong>.</p>
    <p style="margin:0 0 16px;">
      <a href="${safeReset}" style="display:inline-block;background:#18181b;color:#fafafa;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:600;">Reset password</a>
    </p>
    <p style="margin:0 0 8px;color:#52525b;font-size:13px;line-height:1.6;">If the button does not work, use this URL:</p>
    <p style="margin:0 0 12px;font-size:12px;word-break:break-all;color:#3f3f46;"><a href="${safeReset}" style="color:#2563eb;">${safeReset}</a></p>
    <p style="margin:0;color:#52525b;font-size:13px;line-height:1.6;">If you did not request this, you can ignore this email.</p>
  `;
  return buildBrandedEmailLayout({
    title: "Reset your password",
    preheader: "Use this secure link to reset your CreateYourQR password.",
    appUrl: params.appUrl,
    bodyHtml,
  });
}

export type PasswordResetEmailResult =
  | { sent: true }
  | { sent: false; reason: "missing_api_key" | "send_failed" };

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
  appUrl: string;
}): Promise<PasswordResetEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY is not set; cannot send password reset email.");
    return { sent: false, reason: "missing_api_key" };
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM?.trim() ?? "CreateYourQR <onboarding@resend.dev>";

  try {
    const result = await resend.emails.send({
      from,
      to: params.to,
      subject: "Reset your CreateYourQR password",
      html: buildPasswordResetHtml({
        resetUrl: params.resetUrl,
        appUrl: params.appUrl,
      }),
    });

    // Prefer `data.id`: Resend accepts the send with HTTP 2xx and returns `{ id }`.
    if (result.data?.id) {
      return { sent: true };
    }

    if (result.error) {
      console.error("[email] Resend password reset error:", result.error);
      return { sent: false, reason: "send_failed" };
    }

    console.error("[email] Resend password reset: unexpected response (no id, no error)", {
      hasData: Boolean(result.data),
    });
    return { sent: false, reason: "send_failed" };
  } catch (e) {
    console.error("[email] password reset send failed", e);
    return { sent: false, reason: "send_failed" };
  }
}
