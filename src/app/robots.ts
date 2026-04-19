import type { MetadataRoute } from "next";

import { appUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  const origin = new URL(appUrl);
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${appUrl}/sitemap.xml`,
    host: origin.host,
  };
}
