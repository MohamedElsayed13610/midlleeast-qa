import Link from "next/link";
import StructuredData from "@/components/structured-data";
import { absoluteUrl, breadcrumbSchema, firmDescription, firmLegalName, firmName, firmSchema, pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata("من نحن", `تعرّف على ${firmLegalName}، مكتب محاماة واستشارات قانونية في قطر وشبكة إقليمية تخدم الشركات والأفراد.`, "/about"),
  alternates: { canonical: absoluteUrl("/about"), languages: { ar: absoluteUrl("/about"), en: absoluteUrl("/en/about") } },
};

export default function AboutPage() {
  return <main className="team-page" dir="rtl">
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [
      firmSchema,
      breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "من نحن", path: "/about" }]),
      { "@type": "AboutPage", "@id": absoluteUrl("/about#page"), url: absoluteUrl("/about"), name: `من نحن | ${firmLegalName}`, description: firmDescription, inLanguage: "ar", about: { "@id": firmSchema["@id"] } },
    ] }} />
    <header className="inner-header">
      <Link className="brand" href="/"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt={`شعار ${firmLegalName}`} /><span className="brand-copy"><strong>{firmName}</strong><small>للمحاماة والاستشارات القانونية</small></span></Link>
      <div style={{display:"flex",gap:"16px",alignItems:"center"}}><Link href="/services">الخدمات</Link><Link href="/team">فريقنا</Link><Link href="/contact">تواصل معنا</Link></div>
    </header>
    <section className="team-page-heading section-pad">
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">من نحن</span></nav>
      <span className="kicker">مكتب الشرق الأوسط ومشاركوه</span>
      <h1>من نحن</h1>
      <p>مكتب محاماة واستشارات قانونية في قطر بخبرة إقليمية ونهج عملي يربط القانون باحتياجات الأعمال.</p>
    </section>
    <section className="team-page-body section-pad" aria-label="نبذة عن المكتب">
      <div style={{maxWidth:"920px",margin:"0 auto",display:"grid",gap:"28px",fontSize:"1.08rem",lineHeight:2}}>
        <p>{firmLegalName} يقدم خدمات قانونية للشركات والأفراد من لوسيل، قطر، ضمن شبكة إقليمية مترابطة. يعمل الفريق على تقديم استشارات واضحة وتمثيل قانوني منظم في المسائل التجارية، العقود، التقاضي والتحكيم، العمل، العقارات، التكنولوجيا وغيرها من مجالات الممارسة.</p>
        <p>منذ عام 2012، يركز المكتب على الجمع بين المعرفة القانونية والفهم العملي لبيئة الأعمال، مع تنسيق الخبرات بين أعضاء الفريق والمكاتب الإقليمية لتقديم حلول قانونية قابلة للتنفيذ.</p>
        <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}><Link className="button button-gold" href="/team">تعرّف على فريقنا</Link><Link className="button button-outline" href="/services">الخدمات القانونية</Link><Link className="button button-outline" href="/news">آخر الأخبار</Link><Link className="button button-outline" href="/contact">تواصل معنا</Link><Link className="button button-outline" href="/consultation">احجز استشارة قانونية</Link></div>
      </div>
    </section>
    <footer className="inner-footer"><Link href="/contact">تواصل مع المكتب</Link><p>© 2026 {firmLegalName}. جميع الحقوق محفوظة.</p></footer>
  </main>;
}
