import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

import { SiteHeaderNav } from "@/components/site-header-nav";

type SiteHeaderProps = {
  session: Session | null;
};

export function SiteHeader({ session }: SiteHeaderProps) {
  const user = session?.user;

  return (
    <header className="relative z-50 border-b border-zinc-200 bg-white">
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
        <SiteHeaderNav isAuthenticated={Boolean(user)} />
      </nav>
    </header>
  );
}
