import HomePageEn from "@/components/home-page-en";
import StructuredData from "@/components/structured-data";
import { getPublicMembers } from "@/lib/cms-server";
import { absoluteUrl, firmSchema } from "@/lib/seo";
import { legalServicesEn } from "@/lib/services-en";

export const metadata = {
  title: { absolute: "Law Firm in Qatar | Middle East & Partners" },
  description: "Middle East & Partners is a law and legal advisory firm in Qatar serving companies and individuals across corporate, disputes, contracts, employment, technology, real estate and other practice areas.",
  alternates: { canonical: absoluteUrl("/en"), languages: { ar: absoluteUrl("/"), en: absoluteUrl("/en") } },
  openGraph: { type: "website", locale: "en_QA", siteName: "Middle East & Partners", title: "Law Firm in Qatar | Middle East & Partners", description: "Regional legal advice and representation from Lusail, Qatar.", url: absoluteUrl("/en") },
};

export const revalidate = 300;
export default async function EnglishHome() {
  const members = await getPublicMembers();
  return <>
    <link rel="preload" as="image" href="/assets/team/mohamed-bin-aujan-cutout.webp" type="image/webp" />
    <StructuredData data={{"@context":"https://schema.org","@graph":[{...firmSchema,name:"Middle East & Partners",hasOfferCatalog:{"@type":"OfferCatalog",name:"Legal Services",itemListElement:legalServicesEn.map(service=>({"@type":"Offer",itemOffered:{"@type":"Service",name:service.title,url:absoluteUrl(`/en/services/${service.slug}`)}}))}},{"@type":"WebPage",url:absoluteUrl("/en"),name:"Middle East & Partners",inLanguage:"en"}]}}/>
    <HomePageEn members={members}/>
  </>;
}
