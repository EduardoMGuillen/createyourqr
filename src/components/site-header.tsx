import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";

type SiteHeaderProps = {
  session: Session | null;
};

export function SiteHeader({ session }: SiteHeaderProps) {
  const user = session?.user;

  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 rounded-sm"
        >
          <Image
            src="/logo_header.png"
            alt="CreateYourQR"
            width={240}
            height={52}
            className="h-10 w-auto max-w-[min(240px,58vw)] object-contain object-left"
            priority
          />
          <span className="sr-only">CreateYourQR</span>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <Link href="/" className="text-zinc-700 hover:text-zinc-900">
            Home
          </Link>
          <Link href="/pricing" className="text-zinc-700 hover:text-zinc-900">
            Pricing
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-zinc-700 hover:text-zinc-900">
                Dashboard
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="text-zinc-700 hover:text-zinc-900 underline-offset-4 hover:underline"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium hover:bg-zinc-100"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
