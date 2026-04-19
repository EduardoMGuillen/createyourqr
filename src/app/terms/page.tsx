import type { Metadata } from "next";
import Link from "next/link";

import { LegalDocumentLayout } from "@/components/legal-document-layout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for CreateYourQR dynamic QR code platform.",
};

const LAST = "April 19, 2026";

export default function TermsOfServicePage() {
  return (
    <LegalDocumentLayout title="Terms of Service" lastUpdated={LAST}>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">1. Agreement</h2>
        <p>
          By accessing or using CreateYourQR (“Service,” “we,” “us,” or “our”), including our
          website, APIs, and related features, you agree to these Terms of Service. If you do not
          agree, do not use the Service. We may update these terms from time to time; the “Last
          updated” date above will change, and continued use after changes constitutes acceptance
          where permitted by law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">2. Description of the Service</h2>
        <p>
          CreateYourQR provides tools to create and manage <strong>dynamic QR codes</strong> that
          resolve through URLs we host, allowing you to change the destination link associated with
          a code without reprinting it. Features may include account registration, dashboards, scan
          statistics, visual customization of generated codes, and optional paid plans (“Pro”)
          delivered through third-party payment processors such as PayPal.
        </p>
        <p>
          We may modify, suspend, or discontinue parts of the Service with reasonable notice where
          practicable. We do not guarantee uninterrupted availability or error-free operation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">3. Accounts and eligibility</h2>
        <p>
          You must provide accurate registration information and keep your credentials secure. You
          are responsible for all activity under your account. You may sign in with email and
          password or, where enabled, third-party providers (for example Google). You must be at
          least the age of digital consent in your country to create an account.
        </p>
        <p>
          We may suspend or terminate accounts that violate these terms, pose security risks, or
          abuse the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">4. Acceptable use</h2>
        <p>You agree not to use the Service to:</p>
        <ul className="list-inside list-disc space-y-2 pl-1">
          <li>Violate any applicable law or regulation;</li>
          <li>Infringe intellectual property, privacy, or publicity rights of others;</li>
          <li>Distribute malware, phishing, spam, or deceptive content;</li>
          <li>Harass, threaten, or harm individuals or groups;</li>
          <li>Attempt to gain unauthorized access to our systems, other users’ data, or third-party
            services;</li>
          <li>Overload or disrupt the Service (including automated scraping or denial-of-service
            style traffic) except as expressly permitted in writing;</li>
          <li>Use dynamic redirects to circumvent platform policies, law enforcement, or security
            controls of third parties.</li>
        </ul>
        <p>
          You are solely responsible for the <strong>destination URLs</strong> and content you link
          to through your QR codes, and for obtaining any licenses or consents required for your use
          cases (including logos or images you upload for styling).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">5. Free and paid plans</h2>
        <p>
          We may offer a free tier with limits (for example, duration of activation and maximum
          scans per code) as described on our website or in-product messaging. Paid subscriptions
          are billed through our payment partner; fees, renewal, cancellation, and refunds are
          governed by the partner’s terms in addition to any summary we provide at checkout.
        </p>
        <p>
          If a free QR reaches its limits, redirects or landing experiences may change (for example,
          to inform end users or offer upgrade paths). Pro features are only available while your
          subscription is active and in good standing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">6. Intellectual property</h2>
        <p>
          The Service, including software, branding, templates, and documentation, is owned by us
          or our licensors. We grant you a limited, non-exclusive, non-transferable license to use
          the Service for its intended purpose. You retain rights to content you upload; you grant
          us a license to host, process, and display that content as needed to operate the Service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">7. Disclaimers</h2>
        <p>
          THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE,” WITHOUT WARRANTIES OF ANY KIND,
          WHETHER EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          AND NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">8. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WE AND OUR AFFILIATES, OFFICERS,
          DIRECTORS, EMPLOYEES, AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL,
          ARISING FROM YOUR USE OF THE SERVICE. OUR AGGREGATE LIABILITY FOR CLAIMS RELATING TO THE
          SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID US FOR THE SERVICE IN THE
          TWELVE MONTHS BEFORE THE CLAIM OR (B) ONE HUNDRED U.S. DOLLARS (USD $100), EXCEPT WHERE
          PROHIBITED BY LAW.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">9. Indemnity</h2>
        <p>
          You will defend and indemnify us against claims, damages, losses, and expenses (including
          reasonable attorneys’ fees) arising from your use of the Service, your content or linked
          destinations, or your violation of these terms or applicable law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">10. Governing law and disputes</h2>
        <p>
          These terms are governed by the laws of the jurisdiction we designate in a future update,
          without regard to conflict-of-law rules. For now, if no specific venue is stated, you
          agree to attempt good-faith resolution of disputes by contacting us through the channels
          described in our{" "}
          <Link href="/privacy" className="font-medium text-zinc-900 underline underline-offset-2">
            Privacy Policy
          </Link>
          . Courts or arbitration in your region may apply where required by mandatory consumer law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900">11. Contact</h2>
        <p>
          For legal or compliance inquiries, contact us using the email address on file for your
          account or the support method we publish on the website. Replace this section with your
          operational contact details before production launch if different.
        </p>
      </section>
    </LegalDocumentLayout>
  );
}
