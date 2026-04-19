import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocumentLayout } from "@/components/legal-document-layout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How CreateYourQR uses cookies and similar technologies.",
};

const LAST = "April 19, 2026";

export default function CookiePolicyPage() {
  return (
    <LegalDocumentLayout title="Cookie Policy" lastUpdated={LAST}>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">1. Overview</h2>
        <p>
          This Cookie Policy explains how CreateYourQR (“we,” “us”) uses cookies and similar
          technologies (such as local storage and pixels) when you visit our website or use our web
          application. It should be read together with our{" "}
          <Link href="/privacy" className="font-medium text-zinc-900 underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">2. What cookies are</h2>
        <p>
          Cookies are small text files stored on your device. They can be “first-party” (set by us)
          or “third-party” (set by another domain, such as a payment or authentication provider).
          Similar technologies include local storage keys used to keep you signed in or remember
          preferences.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">3. How we use cookies</h2>
        <p className="font-medium text-zinc-800">3.1 Strictly necessary</p>
        <p>
          These cookies and storage items are required for core functionality, for example
          maintaining your authenticated session after login, protecting against cross-site request
          forgery where applicable, and routing requests securely. Without them, parts of the
          Service may not work.
        </p>
        <p className="font-medium text-zinc-800">3.2 Functional</p>
        <p>
          We may use storage to remember choices you make in the interface (for example language or
          dismissed banners) to improve your experience.
        </p>
        <p className="font-medium text-zinc-800">3.3 Third-party integrations</p>
        <p>
          When you use features such as <strong>Google sign-in</strong> or{" "}
          <strong>PayPal checkout</strong>, those providers may set their own cookies or read their
          own storage under their policies. We do not control those technologies; please review
          Google’s and PayPal’s respective privacy and cookie notices.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">4. Analytics and marketing</h2>
        <p>
          We may introduce optional analytics or marketing cookies in the future. If we do, we
          will update this policy and, where required, provide a consent mechanism before
          non-essential cookies are set in applicable regions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">5. Managing cookies</h2>
        <p>
          Most browsers let you refuse or delete cookies through settings. Blocking all cookies may
          prevent you from using sign-in or payment features that depend on them. You can also use
          private browsing modes to limit persistence on shared devices.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">6. Changes</h2>
        <p>
          We may update this Cookie Policy when our practices or partners change. Check the “Last
          updated” date above for the current version.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">7. Contact</h2>
        <p>
          Questions about this policy can be directed through the same channels described in our
          Privacy Policy.
        </p>
      </section>
    </LegalDocumentLayout>
  );
}
