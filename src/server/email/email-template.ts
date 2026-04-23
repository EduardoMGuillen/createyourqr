export function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildBrandedEmailLayout(params: {
  title: string;
  preheader?: string;
  appUrl: string;
  bodyHtml: string;
}) {
  const logoUrl = `${params.appUrl.replace(/\/+$/, "")}/logo_header.png`;
  const preheader = params.preheader ?? params.title;

  return `
<!DOCTYPE html>
<html>
  <body style="margin:0;background:#f4f4f5;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${escapeHtml(preheader)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="background:linear-gradient(135deg,#7c3aed,#ec4899);padding:22px 24px;">
          <img src="${escapeHtml(logoUrl)}" alt="CreateYourQR" width="180" style="display:block;height:auto;border:0;" />
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 14px;font-size:22px;line-height:1.25;color:#111827;">${escapeHtml(params.title)}</h1>
          ${params.bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="border-top:1px solid #e4e4e7;padding:16px 24px;color:#71717a;font-size:12px;line-height:1.5;">
          <p style="margin:0;">CreateYourQR Team</p>
          <p style="margin:4px 0 0;">${escapeHtml(params.appUrl)}</p>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();
}
