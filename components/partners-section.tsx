"use client";

import type { CmsPartner } from "@/lib/cms-types";

type Props={partners:CmsPartner[];locale:"ar"|"en";index?:string};

export default function PartnersSection({partners,locale,index="01"}:Props) {
  const ar=locale==="ar";
  const uniquePartners=partners.filter((partner,index,list)=>list.findIndex(item=>item.id===partner.id||item.slug===partner.slug)===index);

  const partnerContent=(partner:CmsPartner)=>{
    const name=ar ? partner.name_ar : partner.name_en;
    const country=ar ? partner.country_ar : partner.country_en;
    return <>
      <div className="partner-logo"><img src={partner.logo_url} alt={`${name} logo`} loading="lazy"/></div>
      <div className="partner-copy" dir={ar?"rtl":"ltr"}><span>{country}</span></div>
    </>;
  };

  const renderPartner=(partner:CmsPartner,key:string,clone=false)=>partner.website_url && !clone ?
    <a className="partner-card partner-card-marquee" href={partner.website_url} target="_blank" rel="noreferrer" key={key}>{partnerContent(partner)}</a> :
    <div className={`partner-card partner-card-marquee${clone ? " partner-card-clone" : ""}`} key={key}>{partnerContent(partner)}</div>;

  return <section id="partners" className="partners section-pad">
    <div className="section-index reveal" data-reveal><span>{index}</span><p>{ar ? "شركاؤنا الإقليميون والدوليون" : "Regional & International Partners"}</p></div>
    <div className="partners-heading reveal" data-reveal>
      <div><span className="kicker">{ar ? "شبكة مهنية تتجاوز الحدود" : "A professional network beyond borders"}</span><h2>{ar ? <>شراكات مهنية، <em>وحضور دولي.</em></> : <>Trusted partnerships. <em>International reach.</em></>}</h2></div>
      <p>{ar ? "نتعاون مع مكاتب قانونية وجهات مهنية دولية لتوسيع نطاق الدعم والخدمات المقدمة لعملائنا داخل دولة قطر وخارجها." : "We collaborate with international law firms and professional organizations to extend the support and services available to our clients in Qatar and across borders."}</p>
    </div>

    {uniquePartners.length ? <div className="partners-marquee reveal" data-reveal aria-label={ar?"شبكة شركائنا":"Our partner network"}>
      <div className="partners-marquee-track">
        <div className="partners-marquee-group">
          {uniquePartners.map(partner=>renderPartner(partner,`primary-${partner.id}`))}
        </div>
        <div className="partners-marquee-group partners-marquee-clone" aria-hidden="true">
          {uniquePartners.map(partner=>renderPartner(partner,`clone-${partner.id}`,true))}
        </div>
      </div>
    </div> : <div className="partners-empty reveal" data-reveal><span>{ar ? "شبكة الشركاء" : "Partner network"}</span><p>{ar ? "سيتم إضافة شعارات وبيانات الشركاء من لوحة إدارة الموقع." : "Partner logos and details will appear here once added from the website dashboard."}</p></div>}
  </section>;
}
