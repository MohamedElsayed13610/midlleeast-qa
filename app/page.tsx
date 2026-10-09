import { getPublicMembers, getPublicNews } from "@/lib/cms-server";
import HomePage from "@/components/home-page";
import StructuredData from "@/components/structured-data";
import { absoluteUrl, firmDescription, firmName, firmSchema, pageMetadata } from "@/lib/seo";
import { legalServices } from "@/lib/services";

export const metadata = {
  ...pageMetadata("مكتب محاماة واستشارات قانونية في قطر", firmDescription, "/"),
  title: { absolute: "مكتب محاماة في قطر | الشرق الأوسط وشركاؤه" },
};

export const dynamic="force-dynamic";
export default async function Home() {
  const [members,news]=await Promise.all([getPublicMembers(),getPublicNews(4)]);
  return <>
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [
      { ...firmSchema, hasOfferCatalog: { "@type": "OfferCatalog", name: "خدمات المكتب القانونية", itemListElement: legalServices.map(service => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: service.title, url: absoluteUrl(`/services/${service.slug}`) } })) } },
      { "@type": "WebSite", "@id": absoluteUrl("/#website"), url: absoluteUrl(), name: firmName, inLanguage: "ar", publisher: { "@id": firmSchema["@id"] } },
      { "@type": "WebPage", "@id": absoluteUrl("/#webpage"), url: absoluteUrl(), name: "مكتب محاماة واستشارات قانونية في قطر", description: firmDescription, inLanguage: "ar", isPartOf: { "@id": absoluteUrl("/#website") }, about: { "@id": firmSchema["@id"] } },
    ] }} />
    <HomePage members={members} news={news}/>
  </>;
}
