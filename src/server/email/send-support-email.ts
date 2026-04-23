import { Resend } from "resend";

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

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
  return `
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #18181b;">
    <p><strong>New support request from CreateYourQR</strong></p>
    <ul>
      <li><strong>Name:</strong> ${escapeHtml(params.name)}</li>
      <li><strong>Email:</strong> ${escapeHtml(params.email)}</li>
      <li><strong>Source:</strong> ${escapeHtml(params.source)}</li>
      <li><strong>Subject:</strong> ${escapeHtml(params.subject)}</li>
    </ul>
    <p><strong>Message</strong></p>
    <pre style="white-space: pre-wrap; background: #f4f4f5; padding: 12px; border-radius: 8px;">${escapeHtml(params.message)}</pre>
  </body>
</html>
`.trim();
}

function buildAutoReplyHtml(params: { name: string; subject: string }) {
  return `
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #18181b;">
    <p>Hi ${escapeHtml(params.name)},</p>
    <p>Thanks for contacting CreateYourQR support.</p>
    <p>We received your request about: <strong>${escapeHtml(params.subject)}</strong>.</p>
    <p>Our team will get back to you as soon as possible.</p>
    <p style="margin-top: 24px;">— CreateYourQR Team</p>
  </body>
</html>
`.trim();
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
