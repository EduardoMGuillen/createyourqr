/** Single source for homepage FAQ (UI + JSON-LD FAQPage). */
export const landingFaqItems = [
  {
    q: "What is a dynamic QR code?",
    a: "It encodes a short URL we host. You update the redirect target from your dashboard while the printed image stays the same — ideal for menus, flyers, and packaging.",
  },
  {
    q: "How is a barcode different from a QR code on CreateYourQR?",
    a: "Our linear barcodes (e.g. CODE128, EAN-13) draw your value directly in the bars. Dynamic QRs instead point to a URL you can change later; pick the format that fits retail vs. marketing.",
  },
  {
    q: "Can I generate a WiFi QR code?",
    a: "Yes. Choose WPA/WEP/nopass, SSID, and password where applicable. Guests scan once to join — great for hospitality and offices.",
  },
  {
    q: "What is the link page / link-in-bio option?",
    a: "Visitors land on a simple page with your title, optional subtitle, and button links — like a micro landing page tied to your QR slug.",
  },
  {
    q: "Where are plan limits, durations, and billing rules documented?",
    a: "Exact quotas (including how long a code stays active and how many scans it can receive before it may pause), what happens next for people who scan it, and how Pro restores continuous use, are spelled out in our Terms of Service under “Free and paid plans.” The Pricing page summarizes what you pay for Pro.",
  },
  {
    q: "Can I customize how the QR looks?",
    a: "Yes — pick dot and corner styles, colors, and an optional logo. We store your style JSON so exports from the dashboard match what you designed.",
  },
  {
    q: "How do I upgrade to Pro?",
    a: "Open Pricing from the site header or your dashboard and complete PayPal subscription checkout when you want a code to keep resolving without interruption. Eligibility and renewal terms are in our Terms of Service.",
  },
  {
    q: "Do you support Google sign-in?",
    a: "Yes — use Google on register or login alongside email and password.",
  },
] as const;
