import Link from "next/link";
import StructuredData from "@/components/structured-data";
import { absoluteUrl, breadcrumbSchema, firmEnglishName, firmSchema } from "@/lib/seo";

const description = "Contact Midlleeast & Partners Law Firm in Lusail, Qatar for legal advice, consultations and information about the firm's legal services.";

export const metadata = {
  title: { absolute: `Contact Us | ${firmEnglishName}` },
  description,
  alternates: { canonical: absoluteUrl("/en/contact"), languages: { ar: absoluteUrl("/contact"), en: absoluteUrl("/en/contact") } },
  openGraph: { type: "website", locale: "en_QA", siteName: firmEnglishName, title: `Contact Us | ${firmEnglishName}`, description, url: absoluteUrl("/en/contact") },
};

export default function ContactPageEn() {
  return <main className="team-page english-shell" dir="ltr">
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [
      { ...firmSchema, name: firmEnglishName },
      breadcrumbSchema([{ name: "Home", path: "/en" }, { name: "Contact Us", path: "/en/contact" }]),
      { "@type": "ContactPage", "@id": absoluteUrl("/en/contact#page"), url: absoluteUrl("/en/contact"), name: `Contact Us | ${firmEnglishName}`, description, inLanguage: "en", about: { "@id": firmSchema["@id"] } },
    ] }} />
    <header className="inner-header">
      <Link className="brand" href="/en"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt={`${firmEnglishName} logo`} /><span className="brand-copy"><strong>Midlleeast &amp; Partners</strong><small>Law Firm</small></span></Link>
      <Link href="/contact" lang="ar">العربية</Link>
    </header>

    <section className="team-page-heading section-pad">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/en">Home</Link><span>/</span><span aria-current="page">Contact Us</span></nav>
      <span className="kicker">Midlleeast &amp; Partners</span>
      <h1>Contact Us</h1>
      <p>Contact our Qatar office to request a legal consultation or ask about our legal services.</p>
    </section>

    <section className="team-page-body section-pad" aria-label="Contact details">
      <div style={{maxWidth:"920px",margin:"0 auto",display:"grid",gap:"22px",fontSize:"1.08rem",lineHeight:2}}>
        <div><strong>Qatar Office</strong><p>Marina District, Twin Tower A, 8th Floor, Lusail, Doha, Qatar.</p></div>
        <div><strong>Phone</strong><p><a href="tel:+97440026487">+974 4002 6487</a><br/><a href="tel:+97477733348">+974 7773 3348</a><br/><a href="tel:+97455600352">+974 5560 0352</a></p></div>
        <div><strong>Email</strong><p><a href="mailto:info@middleeast-qa.com">info@middleeast-qa.com</a></p></div>
        <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}><Link className="button button-gold" href="/consultation">Book a Legal Consultation</Link><a className="button button-outline" href="https://wa.me/97477733348" target="_blank" rel="noreferrer">WhatsApp</a><Link className="button button-outline" href="/en/services">Legal Services</Link></div>
      </div>
    </section>
    <footer className="inner-footer"><Link href="/en">Home</Link><p>© 2026 {firmEnglishName}. All rights reserved.</p></footer>
  </main>;
}
