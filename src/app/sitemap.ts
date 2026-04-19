import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
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
