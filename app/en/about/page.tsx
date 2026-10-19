import Link from "next/link";
import StructuredData from "@/components/structured-data";
import { absoluteUrl, breadcrumbSchema, firmEnglishName, firmSchema } from "@/lib/seo";

export const metadata = {
  title: { absolute: `${firmEnglishName} | About Us` },
  description: "About Midlleeast & Partners Law Firm, a Qatar-based law, arbitration and legal advisory firm serving companies and individuals across the region.",
  alternates: { canonical: absoluteUrl("/en/about"), languages: { ar: absoluteUrl("/about"), en: absoluteUrl("/en/about") } },
  openGraph: { type: "website", locale: "en_QA", siteName: firmEnglishName, title: `${firmEnglishName} | About Us`, description: "Qatar-based legal advice, representation and arbitration with regional reach.", url: absoluteUrl("/en/about") },
};

export default function AboutPageEn() {
  return <main className="team-page english-shell" dir="ltr">
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [
      firmSchema,
      breadcrumbSchema([{ name: "Home", path: "/en" }, { name: "About Us", path: "/en/about" }]),
      { "@type": "AboutPage", "@id": absoluteUrl("/en/about#page"), url: absoluteUrl("/en/about"), name: `${firmEnglishName} | About Us`, description: "About Midlleeast & Partners Law Firm in Qatar.", inLanguage: "en", about: { "@id": firmSchema["@id"] } },
    ] }} />
    <header className="inner-header">
      <Link className="brand" href="/en"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt={`${firmEnglishName} logo`} /><span className="brand-copy"><strong>Midlleeast &amp; Partners</strong><small>Law Firm</small></span></Link>
      <Link href="/en#team">Our Team</Link>
    </header>
    <section className="team-page-heading section-pad">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/en">Home</Link><span>/</span><span aria-current="page">About Us</span></nav>
      <span className="kicker">Midlleeast &amp; Partners</span>
      <h1>About Us</h1>
      <p>A Qatar-based law, arbitration and legal advisory firm combining regional experience with commercially focused legal work.</p>
    </section>
    <section className="team-page-body section-pad" aria-label="About the firm">
      <div style={{maxWidth:"920px",margin:"0 auto",display:"grid",gap:"28px",fontSize:"1.08rem",lineHeight:2}}>
        <p>Midlleeast &amp; Partners Law Firm provides legal services to companies and individuals from Lusail, Qatar, supported by a connected regional network. The firm advises and represents clients across corporate and commercial matters, contracts, disputes and arbitration, employment, real estate, technology and other practice areas.</p>
        <p>Since 2012, the firm has focused on combining legal knowledge with practical business understanding and coordinated regional support.</p>
        <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}><Link className="button button-gold" href="/en#team">Meet Our Team</Link><Link className="button button-outline" href="/en/news">Latest News</Link><Link className="button button-outline" href="/consultation">Book a Consultation</Link></div>
      </div>
    </section>
    <footer className="inner-footer"><Link href="/en#contact">Contact the firm</Link><p>© 2026 {firmEnglishName}. All rights reserved.</p></footer>
  </main>;
}
