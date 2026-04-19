import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-zinc-600 md:flex-row md:items-center md:justify-between md:py-10">
        <p>© {year} CreateYourQR</p>
        <nav
          className="flex flex-wrap gap-x-6 gap-y-2"
          aria-label="Footer"
        >
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
    </footer>
  );
}
