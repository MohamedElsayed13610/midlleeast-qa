"use client";

import type { CmsPartner } from "@/lib/cms-types";

type Props={partners:CmsPartner[];locale:"ar"|"en";index?:string};

export default function PartnersSection({partners,locale,index="01"}:Props) {
  const ar=locale==="ar";

  const partnerContent=(partner:CmsPartner)=>{
    const name=ar ? partner.name_ar : partner.name_en;
    const country=ar ? partner.country_ar : partner.country_en;
    return <>
      <div className="partner-logo"><img src={partner.logo_url} alt={`${name} logo`} loading="lazy"/></div>
      <div className="partner-copy" dir={ar?"rtl":"ltr"}>
        <h3>{name}</h3>
        <span>{country}</span>
      </div>
    </>;
  };

  return <section id="partners" className="partners section-pad">
    <div className="section-index reveal" data-reveal><span>{index}</span><p>{ar ? "شركاؤنا الإقليميون والدوليون" : "Regional & International Partners"}</p></div>
    <div className="partners-heading reveal" data-reveal>
      <div><span className="kicker">{ar ? "شبكة قانونية تتجاوز الحدود" : "A legal network beyond borders"}</span><h2>{ar ? <>شراكات مهنية، <em>وحضور دولي.</em></> : <>Trusted partnerships. <em>International reach.</em></>}</h2></div>
      <p>{ar ? "نتعاون مع مكاتب محاماة دولية ونقدّم الدعم والتمثيل القانوني لعملائها في دولة قطر." : "We work with international law firms and support their clients in Qatar through a connected legal network."}</p>
    </div>

    {partners.length ? <div className="partners-marquee reveal" data-reveal aria-label={ar?"شبكة شركائنا":"Our partner network"}>
      <div className="partners-marquee-track">
        <div className="partners-marquee-group">
          {partners.map(partner=>partner.website_url ?
            <a className="partner-card partner-card-marquee" href={partner.website_url} target="_blank" rel="noreferrer" key={`primary-${partner.id}`}>{partnerContent(partner)}</a> :
            <article className="partner-card partner-card-marquee" key={`primary-${partner.id}`}>{partnerContent(partner)}</article>
          )}
        </div>
        <div className="partners-marquee-group" aria-hidden="true">
          {partners.map(partner=><div className="partner-card partner-card-marquee partner-card-clone" key={`clone-${partner.id}`}>{partnerContent(partner)}</div>)}
        </div>
      </div>
    </div> : <div className="partners-empty reveal" data-reveal><span>{ar ? "شبكة الشركاء" : "Partner network"}</span><p>{ar ? "سيتم إضافة شعارات وبيانات الشركاء من لوحة إدارة الموقع." : "Partner logos and details will appear here once added from the website dashboard."}</p></div>}
  </section>;
}
