import Link from "next/link";
import type { ReactNode } from "react";

type LegalDocumentLayoutProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalDocumentLayout({
  title,
  lastUpdated,
  children,
}: LegalDocumentLayoutProps) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 pb-24">
      <nav className="text-sm text-zinc-600">
        <Link href="/" className="font-medium text-zinc-800 underline-offset-4 hover:underline">
          Home
        </Link>
        <span className="mx-2 text-zinc-400">/</span>
        <span className="text-zinc-500">{title}</span>
      </nav>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-zinc-500">Last updated: {lastUpdated}</p>
      <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-700">{children}</div>
      <nav
        className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-zinc-200 pt-8 text-sm font-medium text-zinc-800"
        aria-label="Legal documents"
      >
        <Link href="/terms" className="underline-offset-4 hover:underline">
          Terms of Service
        </Link>
        <Link href="/privacy" className="underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        <Link href="/cookies" className="underline-offset-4 hover:underline">
          Cookie Policy
        </Link>
      </nav>
      <aside className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
        This document is provided for transparency and convenience. It does not constitute legal
        advice. For questions about these terms, consult a qualified attorney in your jurisdiction.
      </aside>
    </main>
  );
}
