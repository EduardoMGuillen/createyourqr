import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocumentLayout } from "@/components/legal-document-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CreateYourQR collects, uses, and shares personal data.",
};

const LAST = "April 19, 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentLayout title="Privacy Policy" lastUpdated={LAST}>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">1. Who we are</h2>
        <p>
          CreateYourQR (“we,” “us”) operates a web application for creating and managing dynamic QR
          codes. This Privacy Policy explains how we collect, use, disclose, and safeguard
          information when you use our Service at our public website and related endpoints.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">2. Information we collect</h2>
        <p className="font-medium text-zinc-800">2.1 You provide directly</p>
        <ul className="list-inside list-disc space-y-2 pl-1">
          <li>
            <strong>Account data:</strong> email address, name (if provided), and password hash
            when you register with email and password.
          </li>
          <li>
            <strong>OAuth profile data:</strong> if you sign in with Google or another provider, we
            receive identifiers and profile fields that provider shares with us (for example name,
            email, and profile image URL) according to that provider’s consent screen.
          </li>
          <li>
            <strong>QR configuration:</strong> destination URLs you enter, optional visual style
            settings (such as colors and optional logo images encoded for preview), and metadata
            needed to operate codes (for example slugs and plan limits).
          </li>
          <li>
            <strong>Billing identifiers:</strong> when you subscribe through PayPal, we process
            subscription identifiers and status returned by PayPal; we do not store full payment
            card numbers on our servers.
          </li>
        </ul>
        <p className="font-medium text-zinc-800">2.2 Automatically collected</p>
        <ul className="list-inside list-disc space-y-2 pl-1">
          <li>
            <strong>Scan and redirect telemetry:</strong> when someone scans a dynamic QR, we may
            log timestamps and technical data such as IP-derived information (for example a hashed
            or truncated IP for abuse prevention), coarse location signals if supplied by our
            hosting environment (for example country), user agent, and referer URL, to show
            aggregate analytics and protect the Service.
          </li>
          <li>
            <strong>Logs and diagnostics:</strong> server logs, error reports, and security signals
            as needed to operate and secure the platform.
          </li>
          <li>
            <strong>Cookies and similar technologies:</strong> see our{" "}
            <Link
              href="/cookies"
              className="font-medium text-zinc-900 underline underline-offset-2"
            >
              Cookie Policy
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">3. How we use information</h2>
        <p>We use personal data to:</p>
        <ul className="list-inside list-disc space-y-2 pl-1">
          <li>Create and authenticate accounts and sessions;</li>
          <li>Provide, maintain, and improve the Service (including dashboards and QR resolution);
          </li>
          <li>Process subscriptions and communicate about billing where applicable;</li>
          <li>Send transactional emails (for example welcome or security messages) through our
            email provider;</li>
          <li>Detect, prevent, and respond to fraud, abuse, and security incidents;</li>
          <li>Comply with legal obligations and enforce our terms.</li>
        </ul>
        <p>
          We do not sell your personal information as “sale” is commonly defined in U.S. state
          privacy laws. We may use aggregated or de-identified data that cannot reasonably identify
          you.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">4. Legal bases (EEA, UK, Switzerland)</h2>
        <p>
          Where the GDPR or similar frameworks apply, we rely on appropriate bases such as contract
          (providing the Service you request), legitimate interests (security, analytics, product
          improvement—balanced against your rights), consent where required (for example certain
          cookies or marketing, if offered), and legal obligation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">5. Sharing and subprocessors</h2>
        <p>We share data with service providers who assist us, including for example:</p>
        <ul className="list-inside list-disc space-y-2 pl-1">
          <li>
            <strong>Hosting and infrastructure</strong> (for example Vercel or similar) to run the
            application and store data;
          </li>
          <li>
            <strong>Database</strong> providers where your account and QR records are stored;
          </li>
          <li>
            <strong>Authentication</strong> (for example Google OAuth and NextAuth-compatible
            flows);
          </li>
          <li>
            <strong>Payments</strong> (PayPal) for subscription checkout and webhooks;
          </li>
          <li>
            <strong>Email delivery</strong> (for example Resend) for transactional messages.
          </li>
        </ul>
        <p>
          These providers process data under contractual terms and only as needed to perform
          services for us. We may also disclose information if required by law, legal process, or to
          protect rights, safety, and security.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">6. Retention</h2>
        <p>
          We retain account and QR data while your account is active and as needed to provide the
          Service, comply with law, resolve disputes, and enforce agreements. Scan logs may be
          retained for a shorter operational window or aggregated over time. When data is no longer
          needed, we delete or de-identify it subject to backup and technical constraints.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">7. Security</h2>
        <p>
          We implement technical and organizational measures appropriate to the risk, including
          encryption in transit (HTTPS), access controls, and hashed passwords. No method of
          transmission or storage is 100% secure; you use the Service at your own risk within
          reasonable industry standards.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">8. International transfers</h2>
        <p>
          If you access the Service from outside the country where our servers or providers are
          located, your information may be transferred across borders. Where required, we use
          appropriate safeguards (such as standard contractual clauses) or rely on derogations
          permitted by law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">9. Your rights and choices</h2>
        <p>
          Depending on your location, you may have rights to access, correct, delete, or export
          certain personal data, to object to or restrict certain processing, to withdraw consent
          where processing is consent-based, and to lodge a complaint with a supervisory
          authority. You can exercise many choices through your account settings or by contacting us.
          You may opt out of non-essential cookies as described in our Cookie Policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">10. Children</h2>
        <p>
          The Service is not directed to children under 13 (or the age required in your
          jurisdiction). We do not knowingly collect personal information from children. If you
          believe we have, contact us and we will take appropriate steps to delete it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">11. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will post the revised version and
          update the “Last updated” date. Where changes are material, we will provide additional
          notice as required by law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">12. Contact</h2>
        <p>
          For privacy requests or questions, contact us through the support channel published on
          the website or via the email associated with your account. Before launch, replace this
          paragraph with a dedicated privacy inbox if you operate one.
        </p>
      </section>
    </LegalDocumentLayout>
  );
}
