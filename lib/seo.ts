import type { Metadata } from "next";

const configuredOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://lmelawfirm.com");
if (!['https:', 'http:'].includes(configuredOrigin.protocol) || configuredOrigin.username || configuredOrigin.password || configuredOrigin.pathname !== '/' || configuredOrigin.search || configuredOrigin.hash) {
  throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute website origin without a path.");
}

export const siteUrl = configuredOrigin.origin;
export const brandName = "مكتب الشرق الأوسط ومشاركوه";
export const firmName = brandName;
export const firmLegalName = "مكتب الشرق الأوسط ومشاركوه للمحاماة والاستشارات القانونية";
export const firmArabicName = firmName;
export const firmEnglishName = "Midlleeast & Partners Law Firm";
export const firmLegacyEnglishName = "Middle East & Partners Law Firm";
export const firmDescription = "مكتب الشرق الأوسط ومشاركوه للمحاماة والاستشارات القانونية في قطر، ويقدم خدمات الشركات والعقود والتقاضي والتحكيم والعمل والهجرة والعقارات والطاقة والتكنولوجيا من لوسيل.";
export const isPreview = process.env.VERCEL_ENV === "preview" || process.env.SEO_NOINDEX === "true";
export const absoluteUrl = (path = "/") => new URL(path, `${siteUrl}/`).toString();
export const firmLogoUrl = absoluteUrl("/assets/brand/logo-white.png");

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { type: "website", locale: "ar_QA", siteName: brandName, title: `${title} | ${brandName}`, description, url: absoluteUrl(path) },
    twitter: { card: "summary", title: `${title} | ${brandName}`, description },
  };
}

export const firmSchema = {
  "@type": ["LegalService", "Organization"],
  "@id": absoluteUrl("/#organization"),
  name: firmArabicName,
  legalName: firmLegalName,
  alternateName: [
    firmEnglishName,
    firmLegacyEnglishName,
    "Midlleeast Law Firm",
    "Midlleeast & Partners",
    "Middle East Office Partners Law Firm",
    "Middle East & Partners",
  ],
  url: absoluteUrl(),
  description: firmDescription,
  logo: {
    "@type": "ImageObject",
    url: firmLogoUrl,
    contentUrl: firmLogoUrl,
    width: 2363,
    height: 2363,
    caption: firmArabicName,
  },
  image: firmLogoUrl,
  foundingDate: "2012",
  telephone: "+97440026487",
  email: "info@middleeast-qa.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "منطقة المارينا، برج التوأم أ، الطابق الثامن",
    addressLocality: "لوسيل",
    addressRegion: "الدوحة",
    addressCountry: "QA",
  },
  areaServed: ["QA", "AE", "LB", "EG"].map(code => ({ "@type": "Country", name: code })),
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+97477733348",
      contactType: "customer service",
      availableLanguage: ["ar", "en"],
      areaServed: "QA",
    },
    {
      "@type": "ContactPoint",
      telephone: "+97440026487",
      contactType: "legal services",
      availableLanguage: ["ar", "en"],
      areaServed: "QA",
    },
  ],
};

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}
