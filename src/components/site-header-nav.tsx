"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";

const linkClass =
  "block rounded-md px-3 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900";

type SiteHeaderNavProps = {
  isAuthenticated: boolean;
};

export function SiteHeaderNav({ isAuthenticated }: SiteHeaderNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const root = rootRef.current;
      if (!root?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open, close]);

  const navLinks = (
    <>
      <Link href="/" className={linkClass} onClick={close}>
        Home
      </Link>
      <Link href="/pricing" className={linkClass} onClick={close}>
        Pricing
      </Link>
      {isAuthenticated ? (
        <>
          <Link href="/dashboard" className={linkClass} onClick={close}>
            Dashboard
          </Link>
          <div className="px-3 pt-1">
            <LogoutButton />
          </div>
        </>
      ) : (
        <>
          <Link href="/register" className={linkClass} onClick={close}>
            Register
          </Link>
          <Link
            href="/login"
            className={`${linkClass} mt-1 border border-zinc-300 text-center`}
            onClick={close}
          >
            Log in
          </Link>
        </>
      )}
    </>
  );

  return (
    <div ref={rootRef} className="relative flex shrink-0 items-center">
      {/* Desktop */}
      <div className="hidden flex-wrap items-center justify-end gap-3 text-sm md:flex">
        <Link href="/" className="text-zinc-700 hover:text-zinc-900">
          Home
        </Link>
        <Link href="/pricing" className="text-zinc-700 hover:text-zinc-900">
          Pricing
        </Link>
        {isAuthenticated ? (
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
              className="text-zinc-700 underline-offset-4 hover:text-zinc-900 hover:underline"
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

      {/* Mobile toggle */}
      <button
        type="button"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-900 shadow-sm hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 md:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {/* Mobile dropdown */}
      {open ? (
        <div
          id={panelId}
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-3rem,16rem)] rounded-lg border border-zinc-200 bg-white py-2 shadow-lg md:hidden"
        >
          <div className="flex flex-col">{navLinks}</div>
        </div>
      ) : null}
    </div>
  );
}
