import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/pricing", "/login", "/register"];

  return staticPages.map((path) => ({
    url: `${appUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
    lastModified: new Date(),
  }));
}
