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
          "CreateYourQR builds dynamic, trackable, and editable QR codes for creators, businesses, and event teams.",
      },
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: "CreateYourQR — Dynamic QR code generator",
        isPartOf: { "@id": `${url}/${websiteId}` },
        description:
          "Create trackable and editable dynamic QR codes, monitor scan activity, and keep printed campaigns reliable over time.",
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
          "Dynamic QR code generator with editable links, scan visibility, and account-based activation for print campaigns.",
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
          "Trackable QR code analytics and scan visibility",
          "Post-generation account activation prompts",
          "Link-in-bio page builder (Linktree-style)",
          "Custom QR styling: colors, dot shapes, corner styles, optional logo",
          "Hosted slugs for long-term printed QR usability",
          "Reliable status handling for active campaign codes",
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
