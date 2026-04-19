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
