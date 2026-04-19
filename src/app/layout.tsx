import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";

import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
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
    images: [{ url: "/logo_header.png", alt: "CreateYourQR" }],
  },
  icons: {
    icon: [{ url: "/logo500x500.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/logo500x500.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/logo500x500.png",
  },
  appleWebApp: {
    capable: true,
    title: "CreateYourQR",
    statusBarStyle: "default",
  },
  manifest: "/site.webmanifest",
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
          <SiteHeader session={session} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
