import { getPublicNews } from "@/lib/cms-server";
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { legalServices } from "@/lib/services";

export const dynamic="force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const news=await getPublicNews();
  return ["/", "/team", "/news", ...legalServices.map(service => `/services/${service.slug}`), ...news.map(item=>`/news/${item.slug}`)].map(path => ({ url: absoluteUrl(path) }));
}
