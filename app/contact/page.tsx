import Link from "next/link";
import StructuredData from "@/components/structured-data";
import { absoluteUrl, breadcrumbSchema, firmEnglishName, firmLegalName, firmName, firmSchema, pageMetadata } from "@/lib/seo";

const description = "تواصل مع مكتب الشرق الأوسط ومشاركوه للمحاماة والاستشارات القانونية في لوسيل، قطر. احجز استشارة أو تواصل هاتفيًا أو عبر واتساب.";

export const metadata = {
  ...pageMetadata("تواصل معنا", description, "/contact"),
  title: { absolute: `تواصل معنا | ${firmName}` },
  alternates: { canonical: absoluteUrl("/contact"), languages: { ar: absoluteUrl("/contact"), en: absoluteUrl("/en/contact") } },
};

export default function ContactPage() {
  return <main className="team-page" dir="rtl">
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [
      firmSchema,
      breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "تواصل معنا", path: "/contact" }]),
      { "@type": "ContactPage", "@id": absoluteUrl("/contact#page"), url: absoluteUrl("/contact"), name: `تواصل معنا | ${firmLegalName}`, description, inLanguage: "ar", about: { "@id": firmSchema["@id"] } },
    ] }} />
    <header className="inner-header">
      <Link className="brand" href="/"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt={`شعار ${firmLegalName}`} /><span className="brand-copy"><strong>{firmName}</strong><small>للمحاماة والاستشارات القانونية</small></span></Link>
      <Link href="/en/contact" lang="en">English</Link>
    </header>

    <section className="team-page-heading section-pad">
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">تواصل معنا</span></nav>
      <span className="kicker">مكتب الشرق الأوسط ومشاركوه</span>
      <h1>تواصل معنا</h1>
      <p>تواصل مع فريق المكتب في قطر لطلب استشارة قانونية أو للاستفسار عن الخدمات.</p>
    </section>

    <section className="team-page-body section-pad" aria-label="بيانات التواصل">
      <div style={{maxWidth:"920px",margin:"0 auto",display:"grid",gap:"22px",fontSize:"1.08rem",lineHeight:2}}>
        <div><strong>المكتب الرئيسي — قطر</strong><p>منطقة المارينا، برج التوأم أ، الطابق الثامن، لوسيل، الدوحة.</p></div>
        <div><strong>الهاتف</strong><p><a href="tel:+97440026487">+974 4002 6487</a><br/><a href="tel:+97477733348">+974 7773 3348</a><br/><a href="tel:+97455600352">+974 5560 0352</a></p></div>
        <div><strong>البريد الإلكتروني</strong><p><a href="mailto:info@middleeast-qa.com">info@middleeast-qa.com</a></p></div>
        <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}><Link className="button button-gold" href="/consultation">احجز استشارة قانونية</Link><a className="button button-outline" href="https://wa.me/97477733348" target="_blank" rel="noreferrer">واتساب</a><Link className="button button-outline" href="/services">الخدمات القانونية</Link></div>
      </div>
    </section>
    <footer className="inner-footer"><Link href="/">الرئيسية</Link><p>© 2026 {firmLegalName}. جميع الحقوق محفوظة.</p></footer>
  </main>;
}
