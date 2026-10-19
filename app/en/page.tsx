import HomePageEn from "@/components/home-page-en";
import StructuredData from "@/components/structured-data";
import { getPublicMembers, getPublicNews, getPublicPartners } from "@/lib/cms-server";
import { absoluteUrl, firmArabicName, firmEnglishName, firmLegacyEnglishName, firmSchema } from "@/lib/seo";
import { legalServicesEn } from "@/lib/services-en";

const englishDescription = "Midlleeast & Partners Law Firm is a Qatar-based law and legal advisory firm serving companies and individuals across corporate, disputes, contracts, employment, technology, real estate and other practice areas.";

export const metadata = {
  title: { absolute: `${firmEnglishName} | Law Firm in Qatar` },
  description: englishDescription,
  alternates: { canonical: absoluteUrl("/en"), languages: { ar: absoluteUrl("/"), en: absoluteUrl("/en") } },
  openGraph: { type: "website", locale: "en_QA", siteName: firmEnglishName, title: `${firmEnglishName} | Law Firm in Qatar`, description: englishDescription, url: absoluteUrl("/en") },
};

export const revalidate = 0;
export default async function EnglishHome() {
  const [members,news,partners]=await Promise.all([getPublicMembers(),getPublicNews(2),getPublicPartners()]);
  return <>
    <link rel="preload" as="image" href="/assets/team/mohamed-bin-aujan-cutout.webp" type="image/webp" />
    <StructuredData data={{"@context":"https://schema.org","@graph":[
      {...firmSchema,name:firmEnglishName,alternateName:["Midlleeast Law Firm","Midlleeast & Partners",firmLegacyEnglishName,firmArabicName],hasOfferCatalog:{"@type":"OfferCatalog",name:"Legal Services",itemListElement:legalServicesEn.map(service=>({"@type":"Offer",itemOffered:{"@type":"Service",name:service.title,url:absoluteUrl(`/en/services/${service.slug}`)}}))}},
      {"@type":"WebSite","@id":absoluteUrl("/#website"),url:absoluteUrl(),name:firmEnglishName,alternateName:["Midlleeast Law Firm","Midlleeast & Partners",firmLegacyEnglishName,firmArabicName],inLanguage:["ar","en"],publisher:{"@id":firmSchema["@id"]}},
      {"@type":"WebPage",url:absoluteUrl("/en"),name:`${firmEnglishName} | Law Firm in Qatar`,description:englishDescription,inLanguage:"en",isPartOf:{"@id":absoluteUrl("/#website")},about:{"@id":firmSchema["@id"]}},
      {"@type":"SiteNavigationElement",name:["About Us","Legal Services","Our Team","News","Contact Us","Legal Consultation"],url:[absoluteUrl("/en/about"),absoluteUrl("/en/services"),absoluteUrl("/en/team"),absoluteUrl("/en/news"),absoluteUrl("/en/contact"),absoluteUrl("/consultation")]}
    ]}}/>
    <HomePageEn members={members} news={news} partners={partners}/>
  </>;
}
