import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-zinc-200 bg-gradient-to-b from-white via-zinc-50 to-zinc-100">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 md:flex-row md:items-center md:py-24">
          <div className="max-w-xl space-y-6">
            <p className="inline-flex w-fit rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold tracking-wide text-zinc-800 shadow-sm">
              Dynamic QR codes for real campaigns
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
              CreateYourQR — change the link without reprinting the code
            </h1>
            <p className="text-lg text-zinc-600">
              Launch free dynamic QRs with a short trial window, then upgrade to Pro when your
              code is already in the wild. Edit destinations, track scans, and keep campaigns
              running.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-md bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-sm ring-1 ring-zinc-900/10 hover:bg-zinc-800"
              >
                Create free QR
              </Link>
              <Link
                href="/pricing"
                className="rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
              >
                View pricing
              </Link>
            </div>
          </div>
          <div className="flex-1 rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm md:max-w-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Why teams use us
            </p>
            <ul className="mt-4 space-y-3 text-sm text-zinc-700">
              <li className="flex gap-2">
                <span className="mt-0.5 text-emerald-600">✓</span>
                <span>
                  <strong className="text-zinc-900">Dynamic redirects</strong> — swap landing
                  pages without breaking printed assets.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-emerald-600">✓</span>
                <span>
                  <strong className="text-zinc-900">Scan insights</strong> — country, device, and
                  referer signals to tune campaigns.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-emerald-600">✓</span>
                <span>
                  <strong className="text-zinc-900">Freemium that fits</strong> — start free, go
                  Pro when you need long life and unlimited scans.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <h2 className="text-center text-2xl font-semibold text-zinc-900">Built for speed</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-600">
          Everything you need to ship a QR-backed campaign in minutes — not days.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Editable destinations",
              body: "Point users to promos, sign-up flows, or app stores — update anytime from your dashboard.",
            },
            {
              title: "Branded visuals",
              body: "Tune colors, dot styles, and optional center logos so codes match your brand.",
            },
            {
              title: "Pro when you need it",
              body: "Unlock unlimited scans and long-lived codes when your experiment graduates to production.",
            },
            {
              title: "Secure accounts",
              body: "Email or Google sign-in, password guidance on registration, and predictable session handling.",
            },
            {
              title: "PayPal checkout",
              body: "Upgrade with PayPal subscriptions — familiar flow for teams already on PayPal.",
            },
            {
              title: "Reactivation path",
              body: "When a free QR hits its window, send people to a clear upgrade experience.",
            },
          ].map((f) => (
            <article
              key={f.title}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm ring-1 ring-zinc-900/5"
            >
              <h3 className="text-base font-semibold text-zinc-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
          {[
            { step: "1", title: "Create your account", body: "Sign up with email or Google in a few clicks." },
            { step: "2", title: "Design your QR", body: "Set the destination, preview styling, and publish." },
            { step: "3", title: "Share and iterate", body: "Print or post the public link; edit the target anytime." },
          ].map((s) => (
            <div key={s.step} className="relative rounded-xl border border-zinc-200 p-5">
              <span className="text-xs font-bold text-zinc-400">STEP {s.step}</span>
              <h3 className="mt-2 text-lg font-semibold text-zinc-900">{s.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-zinc-200 bg-gradient-to-r from-zinc-900 to-zinc-800 px-8 py-10 text-white shadow-lg md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Pro for serious campaigns</h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-300">
              $15/month — unlimited scans, no 5-day expiry, and room to grow. Compare plans on the
              pricing page.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
          >
            See pricing
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <h2 className="text-2xl font-semibold text-zinc-900">FAQ</h2>
        <dl className="mt-6 space-y-5 text-sm text-zinc-700">
          <div>
            <dt className="font-medium text-zinc-900">What is a dynamic QR code?</dt>
            <dd className="mt-1">
              It encodes a stable URL we host. You change where that URL redirects without
              reprinting the code.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-900">How long does the free tier last?</dt>
            <dd className="mt-1">
              Each free QR is active for five days or up to fifty scans — whichever comes first.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-900">Can I customize how the QR looks?</dt>
            <dd className="mt-1">
              Yes — pick module and corner styles, colors, and an optional center logo; we store
              your choices with the QR.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-900">How do I upgrade?</dt>
            <dd className="mt-1">
              Log in, open Pricing or your dashboard, and complete checkout with PayPal
              (subscription).
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-900">Do you support Google sign-in?</dt>
            <dd className="mt-1">Yes — use Google on the register or login screens.</dd>
          </div>
        </dl>
      </section>

      <footer className="mt-auto border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-zinc-600 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} CreateYourQR</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/terms" className="text-zinc-800 underline-offset-4 hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-zinc-800 underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="text-zinc-800 underline-offset-4 hover:underline">
              Cookie Policy
            </Link>
            <Link href="/pricing" className="text-zinc-800 underline-offset-4 hover:underline">
              Pricing
            </Link>
            <Link href="/login" className="text-zinc-800 underline-offset-4 hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
