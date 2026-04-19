import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { Providers } from "@/components/providers";
import { authOptions } from "@/lib/auth/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "CreateYourQR - Free Dynamic QR Generator",
    template: "%s | CreateYourQR",
  },
  description:
    "Generate free dynamic QR codes with 5-day lifetime and easy Pro reactivation.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "CreateYourQR",
    description:
      "Dynamic QR code generator with a freemium model built for campaigns.",
    url: "/",
    siteName: "CreateYourQR",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <Providers session={session}>
          <header className="border-b border-zinc-200 bg-white">
            <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-semibold tracking-tight">
                CreateYourQR
              </Link>
              <div className="flex items-center gap-4 text-sm">
                <Link href="/pricing" className="text-zinc-700 hover:text-zinc-900">
                  Pricing
                </Link>
                <Link href="/dashboard" className="text-zinc-700 hover:text-zinc-900">
                  Dashboard
                </Link>
                <Link
                  href="/login"
                  className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium hover:bg-zinc-100"
                >
                  Log in
                </Link>
              </div>
            </nav>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
