import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    { url: new URL("/", siteUrl).toString(), changeFrequency: "weekly", priority: 1 },
    { url: new URL("/services", siteUrl).toString(), changeFrequency: "weekly", priority: 0.8 },
    { url: new URL("/gallery", siteUrl).toString(), changeFrequency: "weekly", priority: 0.7 },
    { url: new URL("/booking", siteUrl).toString(), changeFrequency: "weekly", priority: 0.8 },
    { url: new URL("/contact", siteUrl).toString(), changeFrequency: "weekly", priority: 0.6 },
  ];
}
