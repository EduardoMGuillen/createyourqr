import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-12">
      <section className="grid gap-10 py-16 md:grid-cols-2 md:items-center">
        <div className="space-y-5">
          <p className="inline-flex rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold tracking-wide text-white">
            FREE QR CODES FOR 5 DAYS
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
            CreateYourQR lets you launch dynamic QR codes in seconds
          </h1>
          <p className="text-lg text-zinc-600">
            Start free with 50 scans and a 5-day active QR. Upgrade any time to Pro
            for unlimited scans and long-term campaigns.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-md bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Create free QR
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              View pricing
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">How free works</h2>
          <ul className="mt-4 space-y-3 text-sm text-zinc-600">
            <li>1. Create account with Google or email.</li>
            <li>2. Generate a dynamic QR with editable destination.</li>
            <li>3. QR stays active for 5 days or 50 scans.</li>
            <li>4. Expired QRs show reactivation landing.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
