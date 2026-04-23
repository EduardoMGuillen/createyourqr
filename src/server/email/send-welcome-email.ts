import { Resend } from "resend";

import {
  mapResendErrorName,
  type ResendEmailFailureCode,
} from "@/server/email/resend-failure-codes";
import {
  buildBrandedEmailLayout,
  escapeHtml,
} from "@/server/email/email-template";

function buildWelcomeHtml(params: {
  name?: string | null;
  email: string;
  appUrl: string;
}) {
  const greeting = params.name
    ? `Hi ${escapeHtml(params.name)},`
    : "Hi there,";

  const bodyHtml = `
    <p style="margin:0 0 12px;line-height:1.6;">${greeting}</p>
    <p style="margin:0 0 12px;line-height:1.6;"><strong>Your CreateYourQR account is ready.</strong></p>
    <p style="margin:0 0 8px;line-height:1.6;">You can sign in with:</p>
    <ul style="margin:0 0 14px 18px;padding:0;line-height:1.6;">
      <li><strong>Email:</strong> ${escapeHtml(params.email)}</li>
      <li><strong>Password:</strong> the one you chose during registration (never sent in plain text).</li>
    </ul>
    <p style="margin:0 0 16px;">
      <a href="${escapeHtml(params.appUrl)}/dashboard" style="display:inline-block;background:#18181b;color:#fafafa;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:600;">Open dashboard</a>
    </p>
    <p style="margin:0;color:#52525b;font-size:13px;line-height:1.6;">Need help? Reply to this email and our team will assist you.</p>
  `;
  return buildBrandedEmailLayout({
    title: "Welcome to CreateYourQR",
    preheader: "Your account was created successfully.",
    appUrl: params.appUrl,
    bodyHtml,
  });
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

    if (result.data?.id) {
      return { sent: true };
    }

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

    console.error("[email] Resend welcome: unexpected response (no id, no error)", {
      hasData: Boolean(result.data),
    });
    return { sent: false, failureCode: "unknown" };
  } catch (e) {
    console.error("[email] welcome send threw:", e);
    return { sent: false, failureCode: "unknown" };
  }
}
