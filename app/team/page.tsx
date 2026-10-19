import { getPublicMembers } from "@/lib/cms-server";
import Link from "next/link";
import TeamDirectory from "@/components/team-directory";
import StructuredData from "@/components/structured-data";
import { absoluteUrl, breadcrumbSchema, firmLegalName, firmName, firmSchema, pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata("فريق المحامين والمستشارين في قطر", "تعرّف على فريق مكتب الشرق الأوسط وشركاه للمحاماة والاستشارات القانونية في قطر وخبرات المحامين والمستشارين ضمن شبكة المكتب الإقليمية.", "/team"),
  alternates: { canonical: absoluteUrl("/team"), languages: { ar: absoluteUrl("/team"), en: absoluteUrl("/en/team") } },
};

export const dynamic="force-dynamic";
export default async function TeamPage() {
  const members=await getPublicMembers();
  return <main className="team-page" dir="rtl">
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [
      firmSchema,
      breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "فريقنا", path: "/team" }]),
      { "@type": "CollectionPage", url: absoluteUrl("/team"), name: `فريقنا | ${firmName}`, inLanguage: "ar", about: { "@id": firmSchema["@id"] } },
    ] }} />
    <header className="inner-header"><Link className="brand" href="/"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt={`شعار ${firmLegalName}`} /><span className="brand-copy"><strong>{firmName}</strong><small>للمحاماة والاستشارات القانونية</small></span></Link><Link href="/contact">تواصل معنا</Link></header>
    <section className="team-page-heading section-pad"><nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">فريقنا</span></nav><span className="kicker">شبكة الخبراء</span><h1>فريقنا</h1><p>خبرات قانونية متعددة، ومعيار مهني واحد.</p></section>
    <section className="team-page-body section-pad" aria-label="دليل الفريق"><TeamDirectory members={members}/></section>
    <footer className="inner-footer"><Link href="/contact">تواصل مع المكتب</Link><p>© 2026 {firmLegalName}. جميع الحقوق محفوظة.</p></footer>
  </main>;
}
