import Link from "next/link";
import StructuredData from "@/components/structured-data";
import { absoluteUrl, brandName, breadcrumbSchema, firmSchema, pageMetadata } from "@/lib/seo";
import { legalServices } from "@/lib/services";

const description = "استعرض الخدمات القانونية التي يقدمها L.M.E LAWFIRM في قطر، بما في ذلك الشركات والعقود، المنازعات والتحكيم، العمل والهجرة، العقارات، التكنولوجيا والطاقة.";

export const metadata = {
  ...pageMetadata("الخدمات القانونية في قطر", description, "/services"),
  title: { absolute: `${brandName} | الخدمات القانونية في قطر` },
  alternates: { canonical: absoluteUrl("/services"), languages: { ar: absoluteUrl("/services"), en: absoluteUrl("/en/services") } },
};

export default function ServicesPage() {
  return <main className="team-page" dir="rtl">
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [
      firmSchema,
      breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "الخدمات القانونية", path: "/services" }]),
      { "@type": "CollectionPage", "@id": absoluteUrl("/services#page"), url: absoluteUrl("/services"), name: `${brandName} | الخدمات القانونية في قطر`, description, inLanguage: "ar", about: { "@id": firmSchema["@id"] }, mainEntity: { "@type": "ItemList", itemListElement: legalServices.map((service, index) => ({ "@type": "ListItem", position: index + 1, name: service.title, url: absoluteUrl(`/services/${service.slug}`) })) } },
    ] }} />
    <header className="inner-header">
      <Link className="brand" href="/"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt={`شعار ${brandName}`} /><span className="brand-copy"><strong>{brandName}</strong><small>للمحاماة والتحكيم</small></span></Link>
      <div style={{display:"flex",gap:"16px",alignItems:"center"}}><Link href="/team">فريقنا</Link><Link href="/en/services" lang="en">EN</Link></div>
    </header>
    <section className="team-page-heading section-pad">
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">الخدمات القانونية</span></nav>
      <span className="kicker">{brandName}</span>
      <h1>الخدمات القانونية</h1>
      <p>حلول قانونية للشركات والأفراد من قطر وعبر شبكة المكتب الإقليمية، مع ربط المشورة القانونية باحتياجات الأعمال وطبيعة كل ملف.</p>
    </section>
    <section className="team-page-body section-pad" aria-label="مجالات الممارسة">
      <div style={{maxWidth:"1180px",margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"18px"}}>
        {legalServices.map((service, index) => <article key={service.slug} style={{border:"1px solid rgba(214,187,130,.24)",padding:"26px",display:"grid",gap:"14px",alignContent:"start"}}>
          <span style={{fontSize:".78rem",opacity:.65}}>{String(index + 1).padStart(2,"0")}</span>
          <h2 style={{fontSize:"1.35rem",margin:0}}>{service.title}</h2>
          <p style={{margin:0,lineHeight:1.9,opacity:.82}}>{service.description}</p>
          <Link className="text-link" href={`/services/${service.slug}`}>اعرف المزيد <span>←</span></Link>
        </article>)}
      </div>
    </section>
    <footer className="inner-footer"><Link href="/consultation">احجز استشارة قانونية</Link><p>© 2026 {brandName}. جميع الحقوق محفوظة.</p></footer>
  </main>;
}
