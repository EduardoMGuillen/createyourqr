import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Link in Bio Builder | CreateYourQR",
  description:
    "Create a free Linktree-style link in bio page, customize buttons and colors, and share one URL everywhere with CreateYourQR.",
  keywords: [
    "free link in bio",
    "linktree alternative",
    "create linktree free",
    "link in bio page builder",
    "creator bio links",
  ],
};

export default function LinkInBioPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-14">
      <section className="rounded-3xl border border-zinc-200 bg-gradient-to-b from-fuchsia-50 via-white to-white p-8 md:p-10">
        <p className="inline-flex rounded-full border border-fuchsia-200 bg-fuchsia-100 px-3 py-1 text-xs font-semibold text-fuchsia-700">
          Free Linktree-style page builder
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">
          Create a free link in bio page and update it anytime
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-600 md:text-lg">
          Use one shareable page for Instagram, TikTok, YouTube, and more. Add multiple links, match
          your brand, and keep your bio URL fresh without rebuilding from scratch.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Create my free bio page
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
          >
            Compare plans
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Linktree alternative",
            body: "Build a clean, mobile-friendly bio page with buttons, title, and brand colors.",
          },
          {
            title: "Edit links anytime",
            body: "Update destinations from your dashboard whenever campaigns, products, or content change.",
          },
          {
            title: "Made for creators",
            body: "One link for social bios, event pages, launches, and affiliate stacks.",
          },
        ].map((item) => (
          <article key={item.title} className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-zinc-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
