import { getPublicNews } from "@/lib/cms-server";
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { legalServices } from "@/lib/services";
import { legalServicesEn } from "@/lib/services-en";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const news = await getPublicNews();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/en"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/en/about"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/services"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/en/services"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/team"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/en/team"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/en/contact"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/news"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/en/news"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/consultation"), changeFrequency: "monthly", priority: 0.8 },
  ];

  const serviceEntries: MetadataRoute.Sitemap = [
    ...legalServices.map((service) => ({
      url: absoluteUrl(`/services/${service.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...legalServicesEn.map((service) => ({
      url: absoluteUrl(`/en/services/${service.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  const newsEntries: MetadataRoute.Sitemap = news.flatMap((item) => {
    const lastModified = item.updated_at || item.published_at || undefined;
    const entries: MetadataRoute.Sitemap = [
      {
        url: absoluteUrl(`/news/${item.slug}`),
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];

    const hasEnglish = Boolean(item.title_en?.trim() || item.excerpt_en?.trim() || item.content_en?.trim());
    if (hasEnglish) {
      entries.push({
        url: absoluteUrl(`/en/news/${item.slug}`),
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    return entries;
  });

  return [...staticEntries, ...serviceEntries, ...newsEntries];
}
