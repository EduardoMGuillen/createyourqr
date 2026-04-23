/** Single source for homepage FAQ (UI + JSON-LD FAQPage). */
export const landingFaqItems = [
  {
    q: "What is a dynamic QR code?",
    a: "It encodes a short URL we host. You update the redirect target from your dashboard while the printed image stays the same — ideal for menus, flyers, and packaging.",
  },
  {
    q: "How is a barcode different from a QR code on CreateYourQR?",
    a: "Barcodes encode fixed data directly in bars. Dynamic QR codes point to an editable hosted link, so you can update destinations later without reprinting.",
  },
  {
    q: "Can I generate a QR without signing up first?",
    a: "Yes. You can generate and preview a dynamic QR instantly on the landing page. Create an account afterward to keep it active and manage scans.",
  },
  {
    q: "Why is editable QR important for printed campaigns?",
    a: "Printed materials outlive most campaigns. Editable QR links let you change destinations later so posters, menus, and packaging stay useful.",
  },
  {
    q: "What does 'trackable QR code' mean?",
    a: "Trackable means you can monitor scan activity over time and detect when campaigns are working. This helps prioritize channels and keep high-value QRs active.",
  },
  {
    q: "Will my trial QR expire?",
    a: "Trial QRs are time-limited. You will see expiration warnings in the app so you can activate your account before printed codes lose continuity.",
  },
  {
    q: "Can I customize how the QR looks?",
    a: "Yes. You can style colors, dots, corners, and optionally add a logo so your QR stays on-brand while remaining scannable.",
  },
  {
    q: "Do you support Google sign-in?",
    a: "Yes — use Google on register or login alongside email and password.",
  },
] as const;
