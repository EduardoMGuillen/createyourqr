import type { MetadataRoute } from "next";

import { appUrl } from "@/lib/app-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/link-in-bio",
    "/pricing",
    "/login",
    "/register",
    "/terms",
    "/privacy",
    "/cookies",
  ];

  return staticPages.map((path) => ({
    url: `${appUrl}${path}`,
    changeFrequency: "weekly",
    priority:
      path === ""
        ? 1
        : path === "/terms" || path === "/privacy" || path === "/cookies"
          ? 0.5
          : 0.7,
    lastModified: new Date(),
  }));
}
