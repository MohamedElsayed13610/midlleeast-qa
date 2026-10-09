import type { MetadataRoute } from "next";
import { absoluteUrl, isPreview, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", ...(isPreview ? { disallow: "/" } : { allow: "/" }) },
    ...(isPreview ? {} : { sitemap: absoluteUrl("/sitemap.xml"), host: siteUrl }),
  };
}
