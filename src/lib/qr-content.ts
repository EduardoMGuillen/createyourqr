import type { QrContentKind } from "@prisma/client";

type WifiPayloadShape = {
  v: 1;
  ssid: string;
  password?: string;
  encryption: "WPA" | "WEP" | "nopass";
};

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeWifiField(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/:/g, "\\:").replace(/,/g, "\\,");
}

/** Standard Wi‑Fi QR string (same rule as typical generators). */
export function buildWifiString(payload: WifiPayloadShape): string {
  const t = payload.encryption === "nopass" ? "nopass" : payload.encryption;
  const s = escapeWifiField(payload.ssid);
  const p =
    payload.encryption === "nopass"
      ? ""
      : escapeWifiField(payload.password ?? "");
  return `WIFI:T:${t};S:${s};P:${p};;`;
}

export function buildMailtoUrl(payload: {
  email: string;
  subject?: string;
  body?: string;
}): string {
  const base = `mailto:${payload.email}`;
  const params = new URLSearchParams();
  if (payload.subject) params.set("subject", payload.subject);
  if (payload.body) params.set("body", payload.body);
  const q = params.toString();
  return q ? `${base}?${q}` : base;
}

export function buildTelUrl(e164: string): string {
  const compact = e164.replace(/[^\d+]/g, "");
  return `tel:${compact}`;
}

export function buildSmsUrl(payload: { e164: string; body?: string }): string {
  const base = `sms:${payload.e164}`;
  if (!payload.body) return base;
  return `${base}?${new URLSearchParams({ body: payload.body })}`;
}

export function textQrHtmlPage(text: string): string {
  const safe = escapeHtml(text);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>QR text</title></head><body style="margin:0;font-family:system-ui,sans-serif;padding:1rem;background:#fafafa;color:#171717"><pre style="white-space:pre-wrap;word-break:break-word;margin:0;font-size:0.95rem;line-height:1.5">${safe}</pre></body></html>`;
}

type LinkPageLink = { label: string; url: string };

export type LinkPageHtmlPayload = {
  title: string;
  subtitle?: string;
  links: readonly LinkPageLink[];
  theme?: {
    v: 1;
    pageBg: string;
    pageText: string;
    cardBg: string;
    cardText: string;
    accent: string;
    buttonRadius: "sm" | "md" | "full";
  };
};

function safeExternalHref(url: string): string {
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return u.href;
  } catch {
    /* ignore */
  }
  return "#";
}

function linkPageRadiusCss(r: "sm" | "md" | "full"): string {
  if (r === "sm") return "10px";
  if (r === "full") return "9999px";
  return "14px";
}

/** Link-in-bio style page (all user text escaped; only http(s) hrefs). */
export function linkPageHtmlPage(payload: LinkPageHtmlPayload): string {
  const t = payload.theme;
  const pageBg = t?.pageBg ?? "#f4f4f5";
  const pageText = t?.pageText ?? "#18181b";
  const cardBg = t?.cardBg ?? "#ffffff";
  const cardText = t?.cardText ?? "#18181b";
  const accent = t?.accent ?? "#2563eb";
  const radius = linkPageRadiusCss(t?.buttonRadius ?? "md");
  const safeTitle = escapeHtml(payload.title);
  const safeSub = payload.subtitle ? escapeHtml(payload.subtitle) : "";
  const linksHtml = payload.links
    .map((link) => {
      const href = safeExternalHref(link.url);
      const label = escapeHtml(link.label);
      return `<li style="list-style:none;margin:0;padding:0"><a href="${href}" rel="noopener noreferrer" target="_blank" style="display:block;text-align:center;text-decoration:none;font-weight:600;font-size:0.95rem;padding:0.85rem 1rem;background:${cardBg};color:${cardText};border-radius:${radius};border:2px solid ${accent};box-shadow:0 1px 2px rgba(0,0,0,0.06);transition:transform 0.15s ease, box-shadow 0.15s ease">${label}</a></li>`;
    })
    .join("");
  const subBlock = safeSub
    ? `<p style="margin:0.35rem 0 1.25rem;font-size:0.9rem;opacity:0.88;line-height:1.45">${safeSub}</p>`
    : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${safeTitle}</title></head><body style="margin:0;font-family:system-ui,-apple-system,sans-serif;min-height:100vh;background:${pageBg};color:${pageText}"><main style="max-width:28rem;margin:0 auto;padding:1.75rem 1.25rem 2.5rem"><h1 style="margin:0;font-size:1.35rem;font-weight:700;letter-spacing:-0.02em;text-align:center;line-height:1.25">${safeTitle}</h1>${subBlock}<ul style="margin:0;padding:0;display:flex;flex-direction:column;gap:0.75rem">${linksHtml}</ul><p style="margin:2rem 0 0;text-align:center;font-size:0.75rem;opacity:0.55">CreateYourQR</p></main></body></html>`;
}

export function wifiQrHtmlPage(wifiString: string): string {
  const safe = escapeHtml(wifiString);
  const b64 = Buffer.from(wifiString, "utf8").toString("base64");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Wi‑Fi</title></head><body style="margin:0;font-family:system-ui,sans-serif;padding:1rem;background:#fafafa;color:#171717"><p style="margin:0 0 0.75rem;font-size:0.9rem;line-height:1.45">Este QR dinámico no une la red sola en todos los dispositivos. Copia la cadena o usa un QR Wi‑Fi estático para conectar.</p><label for="w" style="display:block;font-size:0.8rem;font-weight:600;margin-bottom:0.35rem">Cadena de red</label><textarea id="w" readonly rows="6" style="width:100%;box-sizing:border-box;font-family:ui-monospace,monospace;font-size:0.8rem;padding:0.5rem;border:1px solid #d4d4d8;border-radius:6px;background:#fff">${safe}</textarea><p style="margin:0.75rem 0 0;display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center"><button type="button" id="c" data-b64="${escapeHtml(b64)}" style="cursor:pointer;border-radius:6px;border:1px solid #27272a;background:#18181b;color:#fafafa;padding:0.45rem 0.85rem;font-size:0.85rem;font-weight:600">Copiar</button><span id="m" style="font-size:0.8rem;color:#52525b"></span></p><p style="margin:0.75rem 0 0;font-size:0.8rem;color:#52525b">También puedes seleccionar el texto y copiarlo, o unir la red manualmente en ajustes del sistema.</p><script>(function(){var b=document.getElementById("c");var t=document.getElementById("w");var m=document.getElementById("m");function dec(s){try{return decodeURIComponent(escape(atob(s)))}catch(e){return""}}var s=dec(b.getAttribute("data-b64"));b.addEventListener("click",function(){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(s).then(function(){m.textContent="Copiado."}).catch(function(){t.select();m.textContent="Selecciona el texto y copia."})}else{t.select();m.textContent="Selecciona el texto y copia."}});})();</script></body></html>`;
}

export function formatQrDestinationCell(qr: {
  contentKind: QrContentKind;
  destinationUrl: string | null;
  payloadJson: unknown;
}): string {
  switch (qr.contentKind) {
    case "URL":
      return qr.destinationUrl ?? "—";
    case "EMAIL": {
      const p = qr.payloadJson as { email?: string } | null;
      return p?.email ? p.email : "—";
    }
    case "PHONE":
    case "SMS": {
      const p = qr.payloadJson as { e164?: string } | null;
      return p?.e164 ?? "—";
    }
    case "TEXT": {
      const p = qr.payloadJson as { text?: string } | null;
      const t = p?.text;
      if (!t) return "—";
      return t.length > 48 ? `${t.slice(0, 48)}…` : t;
    }
    case "WIFI": {
      const p = qr.payloadJson as { ssid?: string } | null;
      return p?.ssid ? `Wi‑Fi: ${p.ssid}` : "—";
    }
    case "BARCODE": {
      const p = qr.payloadJson as { symbology?: string; data?: string } | null;
      if (!p?.data) return "—";
      const label = p.symbology ? `${p.symbology}: ` : "";
      const t = `${label}${p.data}`;
      return t.length > 48 ? `${t.slice(0, 48)}…` : t;
    }
    case "LINK_PAGE": {
      const p = qr.payloadJson as { title?: string } | null;
      const title = p?.title?.trim();
      return title ? (title.length > 40 ? `${title.slice(0, 40)}…` : title) : "—";
    }
    default:
      return "—";
  }
}

/** HTML page when opening a saved static barcode by its `/qr/slug` link (image is regenerated server-side). */
export function barcodeHtmlPage(imageDataUrl: string, symbology: string, data: string): string {
  const safeSym = escapeHtml(symbology);
  const safeData = escapeHtml(data);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Barcode</title></head><body style="margin:0;font-family:system-ui,sans-serif;padding:1rem;background:#fafafa;color:#171717"><p style="margin:0 0 0.75rem;font-size:0.9rem;line-height:1.45">Static barcode — the image encodes the value directly (not a dynamic redirect).</p><p style="margin:0 0 0.5rem;font-size:0.8rem;font-weight:600">${safeSym}</p><p style="margin:0 0 1rem;font-family:ui-monospace,monospace;font-size:0.9rem;word-break:break-all">${safeData}</p><img src="${imageDataUrl}" alt="Barcode" style="max-width:100%;height:auto;display:block"/></body></html>`;
}
