import type { Metadata } from "next";

// Set this to the connected production domain when the site moves off Vercel.
const configuredOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://midlleeast-qa.vercel.app");
if (!['https:', 'http:'].includes(configuredOrigin.protocol) || configuredOrigin.username || configuredOrigin.password || configuredOrigin.pathname !== '/' || configuredOrigin.search || configuredOrigin.hash) {
  throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute website origin without a path.");
}

export const siteUrl = configuredOrigin.origin;
export const firmName = "الشرق الأوسط وشركاؤه";
export const firmDescription = "مكتب الشرق الأوسط وشركاؤه للمحاماة والاستشارات القانونية في قطر. خدمات الشركات والعقود، التقاضي والتحكيم، العمل والهجرة، الطاقة والتكنولوجيا والضرائب من لوسيل.";
export const isPreview = process.env.VERCEL_ENV === "preview" || process.env.SEO_NOINDEX === "true";
export const absoluteUrl = (path = "/") => new URL(path, `${siteUrl}/`).toString();

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: { type: "website", locale: "ar_QA", siteName: firmName, title: `${title} | ${firmName}`, description, url: absoluteUrl(path) },
    twitter: { card: "summary", title: `${title} | ${firmName}`, description },
  };
}

export const firmSchema = {
  "@type": "LegalService",
  "@id": absoluteUrl("/#organization"),
  name: firmName,
  alternateName: "Middle East & Partners Law Firm",
  url: absoluteUrl(),
  description: firmDescription,
  logo: absoluteUrl("/assets/brand/logo-white.webp"),
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
    availableLanguage: "ar",
  },
};

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}
