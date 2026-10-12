import HomePageEn from "@/components/home-page-en";
import StructuredData from "@/components/structured-data";
import { getPublicMembers, getPublicNews, getPublicPartners } from "@/lib/cms-server";
import { absoluteUrl, firmEnglishName, firmSchema } from "@/lib/seo";
import { legalServicesEn } from "@/lib/services-en";

export const metadata = {
  title: { absolute: "Middle East & Partners Law Firm | Law Firm in Qatar" },
  description: "Middle East & Partners is a law and legal advisory firm in Qatar serving companies and individuals across corporate, disputes, contracts, employment, technology, real estate and other practice areas.",
  alternates: { canonical: absoluteUrl("/en"), languages: { ar: absoluteUrl("/"), en: absoluteUrl("/en") } },
  openGraph: { type: "website", locale: "en_QA", siteName: firmEnglishName, title: "Middle East & Partners Law Firm | Law Firm in Qatar", description: "Regional legal advice and representation from Lusail, Qatar.", url: absoluteUrl("/en") },
};

export const revalidate = 0;
export default async function EnglishHome() {
  const [members,news,partners]=await Promise.all([getPublicMembers(),getPublicNews(2),getPublicPartners()]);
  return <>
    <link rel="preload" as="image" href="/assets/team/mohamed-bin-aujan-cutout.webp" type="image/webp" />
    <StructuredData data={{"@context":"https://schema.org","@graph":[
      {...firmSchema,name:firmEnglishName,hasOfferCatalog:{"@type":"OfferCatalog",name:"Legal Services",itemListElement:legalServicesEn.map(service=>({"@type":"Offer",itemOffered:{"@type":"Service",name:service.title,url:absoluteUrl(`/en/services/${service.slug}`)}}))}},
      {"@type":"WebSite","@id":absoluteUrl("/#website"),url:absoluteUrl(),name:firmEnglishName,alternateName:["Middle East & Partners","L.M.E LAWFIRM"],inLanguage:["ar","en"],publisher:{"@id":firmSchema["@id"]}},
      {"@type":"WebPage",url:absoluteUrl("/en"),name:"Middle East & Partners Law Firm | Law Firm in Qatar",inLanguage:"en",isPartOf:{"@id":absoluteUrl("/#website")},about:{"@id":firmSchema["@id"]}},
      {"@type":"SiteNavigationElement",name:["About Us","Our Team","News","Legal Consultation"],url:[absoluteUrl("/en/about"),absoluteUrl("/en/team"),absoluteUrl("/en/news"),absoluteUrl("/consultation")]}
    ]}}/>
    <HomePageEn members={members} news={news} partners={partners}/>
  </>;
}
