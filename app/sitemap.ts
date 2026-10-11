import { getPublicNews } from "@/lib/cms-server";
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { legalServices } from "@/lib/services";
import { legalServicesEn } from "@/lib/services-en";

export const dynamic="force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const news=await getPublicNews();
  const paths=[
    "/", "/en", "/team", "/news", "/consultation",
    ...legalServices.map(service=>`/services/${service.slug}`),
    ...legalServicesEn.map(service=>`/en/services/${service.slug}`),
    ...news.map(item=>`/news/${item.slug}`),
  ];
  return paths.map(path=>({url:absoluteUrl(path)}));
}
