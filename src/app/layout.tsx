import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import Script from "next/script";

import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth/config";
import { appUrl } from "@/lib/app-url";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-N5SPMTGNKT";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "CreateYourQR - Free Dynamic QR Generator",
    template: "%s | CreateYourQR",
  },
  description:
    "CreateYourQR — dynamic QR codes, WiFi & contact QRs, linear barcodes (CODE128, EAN-13), link-in-bio pages, and styled exports. Create codes, place them in the wild, scale with Pro when you need them always on.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "CreateYourQR",
    description:
      "QR codes, barcodes, WiFi joins, and link pages — built for campaigns that ship fast.",
    url: "/",
    siteName: "CreateYourQR",
    images: [{ url: "/logo_header.png", alt: "CreateYourQR" }],
  },
  icons: {
    icon: [{ url: "/logo500x500.png", type: "image/png", sizes: "500x500" }],
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
        <div id="google_translate_element" className="hidden" />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Providers session={session}>
          <SiteHeader session={session} />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
