import type { CmsPartner } from "@/lib/cms-types";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";

type Props={partners:CmsPartner[];locale:"ar"|"en";index?:string};

export default function PartnersSection({partners,locale,index="01"}:Props) {
  const ar=locale==="ar";
  return <section id="partners" className="partners section-pad">
    <div className="section-index reveal" data-reveal><span>{index}</span><p>{ar ? "شركاؤنا الإقليميون والدوليون" : "Regional & International Partners"}</p></div>
    <div className="partners-heading reveal" data-reveal>
      <div><span className="kicker">{ar ? "شبكة قانونية تتجاوز الحدود" : "A legal network beyond borders"}</span><h2>{ar ? <>شراكات مهنية،<br/><em>وحضور دولي متصل.</em></> : <>Trusted partnerships.<br/><em>Connected internationally.</em></>}</h2></div>
      <p>{ar ? "نتعاون مع مكاتب محاماة دولية ونقدّم الدعم والتمثيل القانوني لعملائها في دولة قطر ضمن شبكة مهنية متكاملة." : "We work with international law firms and support their clients in Qatar through a connected professional legal network."}</p>
    </div>
    {partners.length ? <div className="partners-grid">{partners.map(partner=>{
      const name=ar ? partner.name_ar : partner.name_en;
      const country=ar ? partner.country_ar : partner.country_en;
      const description=ar ? partner.description_ar : partner.description_en;
      const content=<><div className="partner-logo"><img src={partner.logo_url} alt={`${name} logo`} loading="lazy"/></div><div className="partner-copy"><span>{country}</span><h3>{name}</h3>{description && <p>{description}</p>}{partner.website_url && <small>{ar ? <>زيارة الموقع <ArrowUpLeft size={14}/></> : <>Visit website <ArrowUpRight size={14}/></>}</small>}</div></>;
      return partner.website_url ? <a className="partner-card reveal" data-reveal href={partner.website_url} target="_blank" rel="noreferrer" key={partner.id}>{content}</a> : <article className="partner-card reveal" data-reveal key={partner.id}>{content}</article>;
    })}</div> : <div className="partners-empty reveal" data-reveal><span>{ar ? "شبكة الشركاء" : "Partner network"}</span><p>{ar ? "سيتم إضافة شعارات وبيانات الشركاء من لوحة إدارة الموقع." : "Partner logos and details will appear here once added from the website dashboard."}</p></div>}
  </section>;
}
