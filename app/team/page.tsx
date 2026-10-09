import Link from "next/link";
import TeamDirectory from "@/components/team-directory";
import StructuredData from "@/components/structured-data";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("فريق المحامين والمستشارين في قطر", "تعرّف على فريق الشرق الأوسط وشركاؤه في قطر وخبرات المحامين والمستشارين، مع شبكة قانونية إقليمية في الإمارات ولبنان ومصر.", "/team");

export default function TeamPage() {
  return <main className="team-page" dir="rtl">
    <StructuredData data={{ "@context": "https://schema.org", ...breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "فريقنا", path: "/team" }]) }} />
    <header className="inner-header"><Link className="brand" href="/"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt="شعار المكتب" /><span className="brand-copy"><strong>الشرق الأوسط وشركاؤه</strong><small>للمحاماة والتحكيم</small></span></Link><Link href="/#team">العودة إلى الرئيسية</Link></header>
    <section className="team-page-heading section-pad"><span className="kicker">شبكة الخبراء</span><h1>فريقنا</h1><p>خبرات قانونية متعددة، ومعيار مهني واحد.</p></section>
    <section className="team-page-body section-pad" aria-label="دليل الفريق"><TeamDirectory /></section>
    <footer className="inner-footer"><Link href="/#contact">تواصل مع المكتب</Link><p>© 2026 الشرق الأوسط وشركاؤه. جميع الحقوق محفوظة.</p></footer>
  </main>;
}
