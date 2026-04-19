import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { appUrl } from "@/lib/app-url";
import { landingFaqItems } from "@/lib/landing-faq-content";
import { buildLandingJsonLd } from "@/lib/landing-structured-data";

const siteOrigin = appUrl.replace(/\/+$/, "");

export const metadata: Metadata = {
  title:
    "QR Code & Barcode Generator — Dynamic QR, WiFi, Link Page, EAN-13 | CreateYourQR",
  description:
    "Create dynamic QR codes you can edit after printing, WiFi join codes, email/phone/SMS/text QRs, linear barcodes (CODE128, EAN-13), and branded link-in-bio pages — styled modules, logos, and one dashboard to ship and iterate.",
  keywords: [
    "QR code generator",
    "online QR code maker",
    "dynamic QR code",
    "editable QR code",
    "QR code with logo",
    "WiFi QR code generator",
    "email QR code",
    "phone QR code",
    "SMS QR code",
    "text QR code",
    "barcode generator online",
    "CODE128 generator",
    "EAN-13 barcode generator",
    "linear barcode maker",
    "link in bio tool",
    "link page QR",
    "restaurant QR menu",
    "event QR code",
    "marketing QR",
    "trackable QR",
  ],
  authors: [{ name: "CreateYourQR" }],
  creator: "CreateYourQR",
  publisher: "CreateYourQR",
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: {
    canonical: "/",
    languages: { "x-default": "/", en: "/" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "CreateYourQR",
    title: "CreateYourQR — QR codes, barcodes & link-in-bio pages",
    description:
      "Dynamic URL QRs, WiFi, vCard-style payloads, linear barcodes, and customizable link pages — launch in minutes.",
    images: [
      {
        url: "/logo_header.png",
        width: 1200,
        height: 630,
        alt: "CreateYourQR — QR and barcode creator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CreateYourQR — QR codes, barcodes & link pages",
    description:
      "Dynamic QRs, WiFi QRs, styled codes, CODE128/EAN-13 barcodes, and link-in-bio experiences.",
    images: [`${siteOrigin}/logo_header.png`],
  },
  category: "technology",
};

const jsonLd = buildLandingJsonLd(siteOrigin);

const UNSPLASH = {
  hero: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
  mobile: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
  retail: "https://images.unsplash.com/photo-1604719311146-596e8887c93d?auto=format&fit=crop&w=1200&q=80",
  wifi: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
  campaign: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  team: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
} as const;

const offerings = [
  {
    title: "Dynamic URL QR",
    tag: "Edit anytime",
    body: "Encode your public /qr/slug. Change landing pages, promos, or app store links without reprinting posters or packaging.",
    href: "/register",
    gradient: "from-violet-500 to-purple-600",
    image: UNSPLASH.campaign,
    imageAlt: "Laptop with analytics charts representing campaign tracking",
  },
  {
    title: "WiFi QR",
    tag: "Guest onboarding",
    body: "WPA, WEP, or open networks — one scan joins visitors to your café, office, or event WiFi with fewer support questions.",
    href: "/register",
    gradient: "from-sky-500 to-blue-600",
    image: UNSPLASH.wifi,
    imageAlt: "Wireless router and connected workspace",
  },
  {
    title: "Contact QRs",
    tag: "Email · Phone · SMS · Text",
    body: "Pre-filled email, E.164 phone dial, SMS body, or plain text — perfect for support lines, handouts, and NFC-adjacent flows.",
    href: "/register",
    gradient: "from-emerald-500 to-teal-600",
    image: UNSPLASH.mobile,
    imageAlt: "Smartphones showing communication apps",
  },
  {
    title: "Linear barcodes",
    tag: "CODE128 · EAN-13",
    body: "Retail-style barcodes for SKUs and internal logistics. Static image encodes your data directly — ideal beside QR on labels.",
    href: "/register",
    gradient: "from-amber-500 to-orange-600",
    image: UNSPLASH.retail,
    imageAlt: "Retail shelf with product labels",
  },
  {
    title: "Link-in-bio page",
    tag: "One scan, many actions",
    body: "Build a lightweight link hub on your slug: headline, buttons, theme colors, and rounded cards that match your brand.",
    href: "/register",
    gradient: "from-fuchsia-500 to-pink-600",
    image: UNSPLASH.team,
    imageAlt: "Team collaborating on creative project",
  },
  {
    title: "Styled QR modules",
    tag: "Brand-safe",
    body: "Module dots, corner caps, foreground/background colors, and optional center logos with high error correction when needed.",
    href: "/register",
    gradient: "from-indigo-500 to-violet-600",
    image: UNSPLASH.hero,
    imageAlt: "Dashboard metrics and growth charts",
  },
] as const;

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex flex-1 flex-col overflow-x-hidden">
        {/* Hero */}
        <section className="relative isolate border-b border-white/10 bg-gradient-to-br from-violet-700 via-fuchsia-600 to-indigo-800 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:py-24">
            <div className="max-w-xl flex-1 space-y-6">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/95 shadow-lg backdrop-blur">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" aria-hidden />
                QR · Barcode · Link page
              </p>
              <h1 className="text-4xl font-bold tracking-tight drop-shadow-sm md:text-5xl lg:text-6xl">
                The launchpad for{" "}
                <span className="bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-transparent">
                  scannable campaigns
                </span>
              </h1>
              <p className="text-lg leading-relaxed text-violet-100 md:text-xl">
                Dynamic URL codes, WiFi joins, email and phone payloads, SMS and plain text, linear
                barcodes (CODE128, EAN-13), and polished link-in-bio pages — design, publish, and
                iterate from one dashboard.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-violet-900 shadow-xl shadow-violet-950/30 transition hover:bg-violet-50"
                >
                  Create your first code
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Plans & Pro
                </Link>
              </div>
              <p className="text-sm text-violet-200/90">
                No credit card to start · Plan rules and quotas are defined in our{" "}
                <Link href="/terms" className="font-medium underline decoration-white/40 underline-offset-2 hover:text-white">
                  Terms of Service
                </Link>
              </p>
            </div>
            <div className="relative flex-1 lg:max-w-lg">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-cyan-400/30 to-amber-300/20 blur-2xl" aria-hidden />
              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 shadow-2xl shadow-indigo-950/50 ring-1 ring-white/10 backdrop-blur">
                <Image
                  src={UNSPLASH.hero}
                  alt="Analytics dashboard representing measurable QR campaigns"
                  width={700}
                  height={520}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-indigo-950/90 to-transparent p-5 pt-20">
                  <p className="text-sm font-medium text-white">Built for measurable growth</p>
                  <p className="mt-1 text-xs text-white/75">
                    Photo: Unsplash — abstract analytics workspace
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Format pills */}
        <section
          aria-label="Supported formats"
          className="border-b border-zinc-200 bg-zinc-50 py-6"
        >
          <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-2 px-6">
            {[
              "Dynamic URL",
              "WiFi",
              "Email",
              "Phone",
              "SMS",
              "Plain text",
              "CODE128",
              "EAN-13",
              "Link page",
              "Logo in QR",
            ].map((label) => (
              <span
                key={label}
                className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* Bento offerings */}
        <section className="bg-gradient-to-b from-zinc-50 to-white py-16 md:py-24" id="formats">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
              Everything you can create
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-base text-zinc-600">
              One workspace for matrix QRs, linear barcodes, and hosted link pages — tuned for
              retail, events, hospitality, and growth teams.
            </p>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {offerings.map((item) => (
                <article
                  key={item.title}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-md ring-1 ring-zinc-900/5 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${item.gradient} opacity-40 mix-blend-multiply`}
                      aria-hidden
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
                      {item.tag}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold text-zinc-900">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">{item.body}</p>
                    <Link
                      href={item.href}
                      className={`mt-4 inline-flex w-fit items-center rounded-lg bg-gradient-to-r px-3 py-2 text-xs font-semibold text-white shadow ${item.gradient}`}
                    >
                      Try in dashboard →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Story sections */}
        <section className="border-y border-zinc-200 bg-white py-16 md:py-20" id="why-dynamic">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-zinc-900">Dynamic beats dead links</h2>
              <p className="mt-4 text-zinc-600">
                Printed codes outlive single campaigns. When your A/B test, seasonal SKU, or app
                store URL changes, update the redirect — not the artwork. The same sticker, poster,
                or menu keeps working while your strategy moves.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-700">
                <li className="flex gap-2">
                  <span className="text-fuchsia-600" aria-hidden>
                    ●
                  </span>
                  Stable public <code className="rounded bg-zinc-100 px-1 text-xs">/qr/your-slug</code>{" "}
                  URLs
                </li>
                <li className="flex gap-2">
                  <span className="text-fuchsia-600" aria-hidden>
                    ●
                  </span>
                  When you need a code to stay live without interruption, Pro keeps redirects running
                </li>
                <li className="flex gap-2">
                  <span className="text-fuchsia-600" aria-hidden>
                    ●
                  </span>
                  PayPal-powered upgrade for teams already using subscriptions
                </li>
              </ul>
            </div>
            <div className="order-1 overflow-hidden rounded-3xl border border-zinc-200 shadow-lg md:order-2">
              <Image
                src={UNSPLASH.campaign}
                alt="Marketing professional reviewing growth metrics on laptop"
                width={640}
                height={420}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-sky-50 via-white to-violet-50 py-16 md:py-20" id="barcodes">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-sky-100 shadow-lg">
              <Image
                src={UNSPLASH.retail}
                alt="Retail products with scannable packaging"
                width={640}
                height={420}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-zinc-900">Barcodes for the real shelf</h2>
              <p className="mt-4 text-zinc-600">
                Generate PNG barcodes for inventory stickers, event badges, or companion labels next
                to a QR. Symbologies like CODE128 and EAN-13 cover common numeric and alphanumeric
                payloads.
              </p>
              <Link
                href="/register"
                className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg"
              >
                Create a barcode
              </Link>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="border-y border-zinc-200 bg-zinc-900 py-16 text-white md:py-20" id="steps">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold">Ship in three beats</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-zinc-400">
              From account to printable asset without wrestling design tools.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Create your account",
                  body: "Email, password, or Google — your codes stay tied to a workspace you control.",
                },
                {
                  step: "02",
                  title: "Pick a format & style",
                  body: "URL, WiFi, contacts, barcode, or link page — tune colors, dots, corners, and logos.",
                },
                {
                  step: "03",
                  title: "Publish & download",
                  body: "Grab PNGs for print, share the public link, and edit destinations whenever strategy shifts.",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10"
                >
                  <span className="text-xs font-black text-fuchsia-400">{s.step}</span>
                  <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="mx-auto w-full max-w-6xl px-6 py-14">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 p-10 text-center text-white shadow-2xl md:p-14">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
              aria-hidden
            />
            <h2 className="relative text-2xl font-bold md:text-3xl">Ready when your audience is</h2>
            <p className="relative mx-auto mt-3 max-w-lg text-sm text-violet-100 md:text-base">
              Join teams using dynamic QRs, WiFi codes, and barcodes in one flow. Put a code in the
              wild, learn from real scans, then scale with Pro when that link has to keep working.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-violet-900 shadow-lg hover:bg-violet-50"
              >
                Create an account
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-zinc-200 bg-zinc-50 py-16 md:py-20" id="faq">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-center text-3xl font-bold text-zinc-900">Questions & answers</h2>
            <p className="mt-2 text-center text-sm text-zinc-600">
              Product questions below; commercial and quota details live in our{" "}
              <Link href="/terms" className="font-medium text-zinc-900 underline underline-offset-2">
                Terms of Service
              </Link>
              .
            </p>
            <dl className="mt-10 space-y-6">
              {landingFaqItems.map((item) => (
                <div
                  key={item.q}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <dt className="font-semibold text-zinc-900">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-zinc-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
    </>
  );
}
