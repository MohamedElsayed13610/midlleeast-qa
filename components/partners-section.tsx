"use client";

import { useState } from "react";
import type { CmsPartner } from "@/lib/cms-types";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props={partners:CmsPartner[];locale:"ar"|"en";index?:string};

export default function PartnersSection({partners,locale,index="01"}:Props) {
  const ar=locale==="ar";
  const [showAll,setShowAll]=useState(false);

  const partnerContent=(partner:CmsPartner,compact=false)=>{
    const name=ar ? partner.name_ar : partner.name_en;
    const country=ar ? partner.country_ar : partner.country_en;
    const description=ar ? partner.description_ar : partner.description_en;
    return <>
      <div className="partner-logo"><img src={partner.logo_url} alt={`${name} logo`} loading="lazy"/></div>
      <div className="partner-copy" dir={ar?"rtl":"ltr"}>
        <span>{country}</span>
        <h3>{name}</h3>
        {!compact && description && <p>{description}</p>}
        {!compact && partner.website_url && <small>{ar ? <>زيارة الموقع <ArrowUpLeft size={14}/></> : <>Visit website <ArrowUpRight size={14}/></>}</small>}
      </div>
    </>;
  };

  return <section id="partners" className="partners section-pad">
    <div className="section-index reveal" data-reveal><span>{index}</span><p>{ar ? "شركاؤنا الإقليميون والدوليون" : "Regional & International Partners"}</p></div>
    <div className="partners-heading reveal" data-reveal>
      <div><span className="kicker">{ar ? "شبكة قانونية تتجاوز الحدود" : "A legal network beyond borders"}</span><h2>{ar ? <>شراكات مهنية،<br/><em>وحضور دولي متصل.</em></> : <>Trusted partnerships.<br/><em>Connected internationally.</em></>}</h2></div>
      <p>{ar ? "نتعاون مع مكاتب محاماة دولية ونقدّم الدعم والتمثيل القانوني لعملائها في دولة قطر ضمن شبكة مهنية متكاملة." : "We work with international law firms and support their clients in Qatar through a connected professional legal network."}</p>
    </div>

    {partners.length ? <>
      <div className="partners-marquee reveal" data-reveal aria-label={ar?"شبكة شركائنا":"Our partner network"}>
        <div className="partners-marquee-track">
          <div className="partners-marquee-group">
            {partners.map(partner=>partner.website_url ?
              <a className="partner-card partner-card-marquee" href={partner.website_url} target="_blank" rel="noreferrer" key={`primary-${partner.id}`}>{partnerContent(partner,true)}</a> :
              <article className="partner-card partner-card-marquee" key={`primary-${partner.id}`}>{partnerContent(partner,true)}</article>
            )}
          </div>
          <div className="partners-marquee-group" aria-hidden="true">
            {partners.map(partner=><div className="partner-card partner-card-marquee partner-card-clone" key={`clone-${partner.id}`}>{partnerContent(partner,true)}</div>)}
          </div>
        </div>
      </div>

      <div className={`partners-mobile-grid ${showAll ? "is-expanded" : ""}`}>
        {partners.map((partner,partnerIndex)=>{
          const extraClass=partnerIndex>=3 ? " partner-card-extra" : "";
          return partner.website_url ?
            <a className={`partner-card reveal${extraClass}`} data-reveal href={partner.website_url} target="_blank" rel="noreferrer" key={partner.id}>{partnerContent(partner)}</a> :
            <article className={`partner-card reveal${extraClass}`} data-reveal key={partner.id}>{partnerContent(partner)}</article>;
        })}
      </div>
      {partners.length>3 && <div className="partners-more"><Button className="button button-gold" aria-expanded={showAll} onClick={()=>setShowAll(value=>!value)}>{showAll ? (ar ? "إخفاء باقي الشركاء" : "Show fewer partners") : (ar ? "شاهد باقي الشركاء" : "Show more partners")}</Button></div>}
    </> : <div className="partners-empty reveal" data-reveal><span>{ar ? "شبكة الشركاء" : "Partner network"}</span><p>{ar ? "سيتم إضافة شعارات وبيانات الشركاء من لوحة إدارة الموقع." : "Partner logos and details will appear here once added from the website dashboard."}</p></div>}
  </section>;
}
