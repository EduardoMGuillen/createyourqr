import { landingFaqItems } from "@/lib/landing-faq-content";

const organizationId = "#organization";
const websiteId = "#website";
const softwareId = "#software";
const faqId = "#faq";

export function buildLandingJsonLd(origin: string) {
  const url = origin.replace(/\/+$/, "");
  const logo = `${url}/logo_header.png`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/${organizationId}`,
        name: "CreateYourQR",
        url,
        logo: { "@type": "ImageObject", url: logo },
        description:
          "CreateYourQR builds dynamic QR codes, styled static QR modules, linear barcodes, and link-in-bio pages for marketers and small businesses.",
      },
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: "CreateYourQR — QR code & barcode generator",
        isPartOf: { "@id": `${url}/${websiteId}` },
        description:
          "Create dynamic QR codes, WiFi QRs, contact payloads, linear barcodes, and link-in-bio pages. Plans and quotas are defined in the Terms of Service.",
        inLanguage: "en",
        about: { "@id": `${url}/${softwareId}` },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/${websiteId}`,
        url,
        name: "CreateYourQR",
        publisher: { "@id": `${url}/${organizationId}` },
        inLanguage: "en",
        description:
          "QR and barcode generator: dynamic URL redirects, WiFi QR, email/tel/SMS, plain text, CODE128/EAN-13 barcodes, and customizable link pages. Plan rules in Terms of Service.",
        potentialAction: {
          "@type": "RegisterAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${url}/register`,
          },
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${url}/${softwareId}`,
        name: "CreateYourQR",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description:
            "Account-based access with Free and Pro tiers; usage limits and billing in Terms of Service.",
        },
        featureList: [
          "Dynamic QR codes with editable destination URL",
          "Custom QR styling: colors, dot shapes, corner styles, optional logo",
          "WiFi network QR strings",
          "Email, phone, SMS, and plain text QR payloads",
          "Linear barcode generation (e.g. CODE128, EAN-13)",
          "Link-in-bio style pages served at /qr/slug",
          "Scan insights and lifecycle handling for each hosted code",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}/${faqId}`,
        mainEntity: landingFaqItems.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      },
    ],
  };
}
