import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";

import { appUrl } from "@/lib/app-url";
import { landingFaqItems } from "@/lib/landing-faq-content";
import { buildLandingJsonLd } from "@/lib/landing-structured-data";

const siteOrigin = appUrl.replace(/\/+$/, "");
const InstantQrDemo = dynamic(
  () => import("@/components/landing/instant-qr-demo").then((mod) => mod.InstantQrDemo),
  {
    loading: () => (
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
        Loading instant generator...
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Dynamic QR Code Generator | CreateYourQR",
  description:
    "Create trackable, editable dynamic QR codes in seconds. Launch free, monitor scans, and keep printed QR campaigns active with CreateYourQR.",
  keywords: [
    "dynamic QR code generator",
    "trackable QR code",
    "editable QR code",
    "qr code analytics",
    "qr code free trial",
  ],
};

const jsonLd = buildLandingJsonLd(siteOrigin);

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex flex-1 flex-col overflow-x-hidden bg-zinc-50">
        <section className="relative border-b border-zinc-200 bg-gradient-to-b from-violet-100 via-fuchsia-50 to-white">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="landing-blob landing-blob-violet" />
            <div className="landing-blob landing-blob-sky" />
          </div>
          <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:py-20 lg:grid-cols-2 lg:items-center">
            <div className="space-y-5">
              <p className="inline-flex animate-pulse rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                Dynamic QR code generator for live campaigns
              </p>
              {/* SEO: keyword appears in the primary heading for stronger relevance. */}
              <h1 className="text-4xl font-bold tracking-tight text-zinc-950 md:text-5xl">
                Create a trackable QR code now, edit it later without reprinting
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-zinc-600 md:text-lg">
                Launch editable QR links in seconds. Track scans, update destinations anytime, and keep
                printed materials useful while your campaign evolves.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="#instant-generator"
                  className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:bg-violet-500"
                >
                  Generate your first QR free
                </Link>
                <Link
                  href="#why-createyourqr"
                  className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
                >
                  Why this beats free generators
                </Link>
              </div>
              <p className="text-sm text-zinc-500">
                Used by creators, businesses, and events that need QR links to stay reliable after
                print.
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-900/5">
              <h2 className="text-lg font-semibold text-zinc-900">Live campaign status preview</h2>
              <p className="mt-1 text-sm text-zinc-600">
                This is what teams monitor after publishing a QR.
              </p>
              <div className="mt-5 space-y-3 text-sm">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                  Your QR is active
                </div>
                <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-800">
                  Scans detected: 124 this week
                </div>
                <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-violet-800">
                  Editable anytime: destination updated 2h ago
                </div>
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-indigo-900">
                  Account connected: protected in your dashboard
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
          {/* Conversion: value-first interaction before account wall. */}
          <InstantQrDemo />
        </section>

        <section
          id="why-createyourqr"
          className="border-y border-zinc-200 bg-gradient-to-b from-white to-violet-50/40 py-14 md:py-16"
        >
          <div className="mx-auto w-full max-w-6xl px-6">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
              Why CreateYourQR outperforms typical free QR tools
            </h2>
            <p className="mt-3 max-w-2xl text-zinc-600">
              Free generators usually lock you into static links. CreateYourQR is built for campaigns
              that need edits, scan visibility, and long-term reliability.
            </p>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Dynamic QR codes",
                  body: "Change your destination any time without reprinting flyers, packaging, or menus.",
                },
                {
                  title: "Trackable QR performance",
                  body: "Monitor scan activity to validate campaigns and discover high-performing locations.",
                },
                {
                  title: "Built for printed assets",
                  body: "Keep the same QR image alive across promotions, events, and physical media updates.",
                },
                {
                  title: "Reliable by design",
                  body: "Hosted slugs and status controls reduce the risk of dead links in live campaigns.",
                },
              ].map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-900/10"
                >
                  <span
                    aria-hidden
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700"
                  >
                    ✦
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-zinc-900">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-zinc-50 to-sky-50/30 py-14 md:py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
              Social proof and trust signals
            </h2>
            <p className="mt-3 max-w-2xl text-zinc-600">
              Add confidence before sign-up by showing proof of usage and concrete outcomes.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-900/10">
                <p className="text-3xl font-bold text-zinc-900">45,000+</p>
                <p className="mt-1 text-sm text-zinc-600">QR codes generated</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-900/10">
                <p className="text-3xl font-bold text-zinc-900">1.2M+</p>
                <p className="mt-1 text-sm text-zinc-600">Scans tracked</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-900/10 sm:col-span-2">
                <p className="text-sm font-semibold text-zinc-900">
                  Used by creators, businesses, and events
                </p>
                <p className="mt-2 text-sm text-zinc-600">
                  From product packaging to event signage, teams rely on editable QR destinations to
                  avoid dead links after printing.
                </p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  quote:
                    "We printed 2,000 flyers and changed the destination twice without reprinting.",
                  author: "Events marketer",
                },
                {
                  quote: "Seeing scan trends helped us optimize where to place table tents.",
                  author: "Restaurant owner",
                },
                {
                  quote:
                    "The no-friction generator got us live quickly, and account setup kept everything organized.",
                  author: "Creator brand manager",
                },
              ].map((item) => (
                <blockquote
                  key={item.author}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-900/10"
                >
                  <p className="text-sm leading-relaxed text-zinc-700">“{item.quote}”</p>
                  <cite className="mt-3 block text-xs font-semibold uppercase tracking-wide text-zinc-500 not-italic">
                    {item.author}
                  </cite>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-14">
          <div className="rounded-3xl bg-zinc-900 px-6 py-10 text-white md:px-10">
            <h2 className="text-3xl font-bold tracking-tight">Keep every printed QR working</h2>
            <p className="mt-3 max-w-2xl text-sm text-zinc-300 md:text-base">
              Generate instantly, validate campaign response, and keep every QR controlled from one
              account.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="#instant-generator"
                className="rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
              >
                Generate now
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-zinc-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                Activate and keep QR live
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200 bg-zinc-50 py-16 md:py-20" id="faq">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-center text-3xl font-bold text-zinc-900">Questions & answers</h2>
            <p className="mt-2 text-center text-sm text-zinc-600">
              Product details below; full policy details live in our{" "}
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
