import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { legalServices } from "@/lib/services";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/team", ...legalServices.map(service => `/services/${service.slug}`)].map(path => ({ url: absoluteUrl(path) }));
}
