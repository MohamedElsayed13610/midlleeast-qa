import { getPublicMembers, getPublicNews, getPublicPartners } from "@/lib/cms-server";
import HomePage from "@/components/home-page";
import StructuredData from "@/components/structured-data";
import { absoluteUrl, firmDescription, firmLegalName, firmSchema, pageMetadata } from "@/lib/seo";
import { legalServices } from "@/lib/services";

export const metadata = {
  ...pageMetadata("مكتب محاماة واستشارات قانونية في قطر", firmDescription, "/"),
  title: { absolute: `${firmLegalName} | مكتب محاماة في قطر` },
  alternates: { canonical: absoluteUrl("/"), languages: { ar: absoluteUrl("/"), en: absoluteUrl("/en") } },
};

export const revalidate = 0;
export default async function Home() {
  const [members,news,partners]=await Promise.all([getPublicMembers(),getPublicNews(2),getPublicPartners()]);
  return <>
    <link rel="preload" as="image" href="/assets/team/mohamed-bin-aujan-cutout.webp" type="image/webp" />
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [
      { ...firmSchema, hasOfferCatalog: { "@type": "OfferCatalog", name: "خدمات المكتب القانونية", itemListElement: legalServices.map(service => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: service.title, url: absoluteUrl(`/services/${service.slug}`) } })) } },
      { "@type": "WebSite", "@id": absoluteUrl("/#website"), url: absoluteUrl(), name: firmLegalName, inLanguage: "ar", publisher: { "@id": firmSchema["@id"] } },
      { "@type": "WebPage", "@id": absoluteUrl("/#webpage"), url: absoluteUrl(), name: "مكتب محاماة واستشارات قانونية في قطر", description: firmDescription, inLanguage: "ar", isPartOf: { "@id": absoluteUrl("/#website") }, about: { "@id": firmSchema["@id"] } },
    ] }} />
    <HomePage members={members} news={news} partners={partners}/>
  </>;
}
