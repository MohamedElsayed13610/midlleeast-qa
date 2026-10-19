import Link from "next/link";
import StructuredData from "@/components/structured-data";
import { absoluteUrl, breadcrumbSchema, firmEnglishName, firmSchema } from "@/lib/seo";
import { legalServicesEn } from "@/lib/services-en";

const description = "Explore Midlleeast & Partners Law Firm legal services in Qatar, including corporate and commercial matters, disputes and arbitration, employment, real estate, technology and energy.";

export const metadata = {
  title: { absolute: `${firmEnglishName} | Legal Services in Qatar` },
  description,
  alternates: { canonical: absoluteUrl("/en/services"), languages: { ar: absoluteUrl("/services"), en: absoluteUrl("/en/services") } },
  openGraph: { type: "website", locale: "en_QA", siteName: firmEnglishName, title: `${firmEnglishName} | Legal Services in Qatar`, description, url: absoluteUrl("/en/services") },
};

export default function ServicesPageEn() {
  return <main className="team-page english-shell" dir="ltr">
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [
      { ...firmSchema, name: firmEnglishName },
      breadcrumbSchema([{ name: "Home", path: "/en" }, { name: "Legal Services", path: "/en/services" }]),
      { "@type": "CollectionPage", "@id": absoluteUrl("/en/services#page"), url: absoluteUrl("/en/services"), name: `${firmEnglishName} | Legal Services in Qatar`, description, inLanguage: "en", about: { "@id": firmSchema["@id"] }, mainEntity: { "@type": "ItemList", itemListElement: legalServicesEn.map((service, index) => ({ "@type": "ListItem", position: index + 1, name: service.title, url: absoluteUrl(`/en/services/${service.slug}`) })) } },
    ] }} />
    <header className="inner-header">
      <Link className="brand" href="/en"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt={`${firmEnglishName} logo`} /><span className="brand-copy"><strong>Midlleeast &amp; Partners</strong><small>Law Firm</small></span></Link>
      <div style={{display:"flex",gap:"16px",alignItems:"center"}}><Link href="/en/team">Our Team</Link><Link href="/en/contact">Contact Us</Link><Link href="/services" lang="ar">AR</Link></div>
    </header>
    <section className="team-page-heading section-pad">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/en">Home</Link><span>/</span><span aria-current="page">Legal Services</span></nav>
      <span className="kicker">Midlleeast &amp; Partners</span>
      <h1>Legal Services</h1>
      <p>Legal support for companies and individuals in Qatar and across the firm's regional network, combining legal analysis with practical business understanding.</p>
    </section>
    <section className="team-page-body section-pad" aria-label="Practice areas">
      <div style={{maxWidth:"1180px",margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"18px"}}>
        {legalServicesEn.map((service, index) => <article key={service.slug} style={{border:"1px solid rgba(214,187,130,.24)",padding:"26px",display:"grid",gap:"14px",alignContent:"start"}}>
          <span style={{fontSize:".78rem",opacity:.65}}>{String(index + 1).padStart(2,"0")}</span>
          <h2 style={{fontSize:"1.35rem",margin:0}}>{service.title}</h2>
          <p style={{margin:0,lineHeight:1.9,opacity:.82}}>{service.description}</p>
          <Link className="text-link" href={`/en/services/${service.slug}`}>Learn more <span>→</span></Link>
        </article>)}
      </div>
    </section>
    <footer className="inner-footer"><Link href="/en/contact">Contact Us</Link><Link href="/consultation">Book a legal consultation</Link><p>© 2026 {firmEnglishName}. All rights reserved.</p></footer>
  </main>;
}
