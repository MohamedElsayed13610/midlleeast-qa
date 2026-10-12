import type { Metadata } from "next";

const configuredOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://midlleeast-qa.vercel.app");
if (!['https:', 'http:'].includes(configuredOrigin.protocol) || configuredOrigin.username || configuredOrigin.password || configuredOrigin.pathname !== '/' || configuredOrigin.search || configuredOrigin.hash) {
  throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute website origin without a path.");
}

export const siteUrl = configuredOrigin.origin;
export const firmName = "الشرق الأوسط ومشاركوه";
export const firmLegalName = "الشرق الأوسط ومشاركوه للمحاماة والتحكيم";
export const firmEnglishName = "Middle East & Partners Law Firm";
export const firmDescription = "مكتب الشرق الأوسط ومشاركوه للمحاماة والتحكيم والاستشارات القانونية في قطر. خدمات الشركات والعقود، التقاضي والتحكيم، العمل والهجرة، الطاقة والتكنولوجيا والضرائب من لوسيل.";
export const isPreview = process.env.VERCEL_ENV === "preview" || process.env.SEO_NOINDEX === "true";
export const absoluteUrl = (path = "/") => new URL(path, `${siteUrl}/`).toString();
export const firmLogoUrl = absoluteUrl("/assets/brand/logo-white.png");

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { type: "website", locale: "ar_QA", siteName: firmLegalName, title: `${title} | ${firmLegalName}`, description, url: absoluteUrl(path) },
    twitter: { card: "summary", title: `${title} | ${firmLegalName}`, description },
  };
}

export const firmSchema = {
  "@type": "LegalService",
  "@id": absoluteUrl("/#organization"),
  name: firmLegalName,
  legalName: firmLegalName,
  alternateName: [firmEnglishName, "Middle East & Partners", "L.M.E LAWFIRM"],
  url: absoluteUrl(),
  description: firmDescription,
  logo: {
    "@type": "ImageObject",
    url: firmLogoUrl,
    contentUrl: firmLogoUrl,
    caption: firmLegalName,
  },
  image: firmLogoUrl,
  foundingDate: "2012",
  telephone: "+97440026487",
  email: "info@middleeast-qa.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "منطقة المارينا، برج التوأم أ، الطابق الثامن",
    addressLocality: "لوسيل",
    addressCountry: "QA",
  },
  areaServed: ["QA", "AE", "LB", "EG"].map(code => ({ "@type": "Country", name: code })),
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+97477733348",
    contactType: "customer service",
    availableLanguage: ["ar", "en"],
  },
};

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}
