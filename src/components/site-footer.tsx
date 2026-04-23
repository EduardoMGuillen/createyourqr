import Link from "next/link";

import { PaymentMethodBadges } from "@/components/payment-method-badges";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-zinc-600 md:py-10">
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Secure payments accepted
          </p>
          <PaymentMethodBadges />
        </div>
        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p>© {year} CreateYourQR</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
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
          </nav>
        </div>
      </div>
    </footer>
  );
}
