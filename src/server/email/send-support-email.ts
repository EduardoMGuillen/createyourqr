import { Resend } from "resend";
import { appUrl } from "@/lib/app-url";
import {
  buildBrandedEmailLayout,
  escapeHtml,
} from "@/server/email/email-template";

function supportInboxEmail() {
  return process.env.SUPPORT_INBOX_EMAIL?.trim() || "eduardoguillendev@proton.me";
}

function supportFromAddress() {
  return process.env.RESEND_FROM?.trim() ?? "CreateYourQR <onboarding@resend.dev>";
}

function buildInboxHtml(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
  source: string;
}) {
  const bodyHtml = `
    <p style="margin:0 0 12px;line-height:1.6;"><strong>New support request received.</strong></p>
    <ul style="margin:0 0 14px 18px;padding:0;line-height:1.6;">
      <li><strong>Name:</strong> ${escapeHtml(params.name)}</li>
      <li><strong>Email:</strong> ${escapeHtml(params.email)}</li>
      <li><strong>Source:</strong> ${escapeHtml(params.source)}</li>
      <li><strong>Subject:</strong> ${escapeHtml(params.subject)}</li>
    </ul>
    <p style="margin:0 0 8px;line-height:1.6;"><strong>Message</strong></p>
    <pre style="white-space:pre-wrap;background:#f4f4f5;padding:12px;border-radius:8px;border:1px solid #e4e4e7;">${escapeHtml(params.message)}</pre>
  `;
  return buildBrandedEmailLayout({
    title: "New support request",
    preheader: "CreateYourQR support inbox notification.",
    appUrl,
    bodyHtml,
  });
}

function buildAutoReplyHtml(params: { name: string; subject: string }) {
  const bodyHtml = `
    <p style="margin:0 0 12px;line-height:1.6;">Hi ${escapeHtml(params.name)},</p>
    <p style="margin:0 0 12px;line-height:1.6;">Thanks for contacting CreateYourQR support.</p>
    <p style="margin:0 0 12px;line-height:1.6;">We received your request about: <strong>${escapeHtml(params.subject)}</strong>.</p>
    <p style="margin:0;line-height:1.6;">Our team will get back to you as soon as possible.</p>
  `;
  return buildBrandedEmailLayout({
    title: "Support request received",
    preheader: "Your support request is in our queue.",
    appUrl,
    bodyHtml,
  });
}

export async function sendSupportEmails(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
  source: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const resend = new Resend(apiKey);
  const from = supportFromAddress();
  const inbox = supportInboxEmail();

  const inboxSend = await resend.emails.send({
    from,
    to: inbox,
    replyTo: params.email,
    subject: `[Support] ${params.subject}`,
    html: buildInboxHtml(params),
  });
  if (!inboxSend.data?.id || inboxSend.error) {
    throw new Error("Could not send support message.");
  }

  const autoReply = await resend.emails.send({
    from,
    to: params.email,
    subject: "We received your support request — CreateYourQR Team",
    html: buildAutoReplyHtml({ name: params.name, subject: params.subject }),
  });
  if (!autoReply.data?.id || autoReply.error) {
    throw new Error("Support request sent, but auto-reply failed.");
  }
}
