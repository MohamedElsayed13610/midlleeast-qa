import Link from "next/link";
import type { Metadata } from "next";
import TeamDirectory from "@/components/team-directory";

export const metadata: Metadata = { title: "فريقنا | الشرق الأوسط وشركاؤه", description: "تعرّف على فريق المحامين والمستشارين والخبراء في الشرق الأوسط وشركاؤه." };

export default function TeamPage() {
  return <main className="team-page" dir="rtl">
    <header className="inner-header"><Link className="brand" href="/"><img src="/assets/brand/logo-white.png" alt="شعار المكتب" /><span className="brand-copy"><strong>الشرق الأوسط وشركاؤه</strong><small>للمحاماة والتحكيم</small></span></Link><Link href="/#team">العودة إلى الرئيسية</Link></header>
    <section className="team-page-heading section-pad"><span className="kicker">شبكة الخبراء</span><h1>فريقنا</h1><p>خبرات قانونية متعددة، ومعيار مهني واحد.</p></section>
    <section className="team-page-body section-pad" aria-label="دليل الفريق"><TeamDirectory /></section>
    <footer className="inner-footer"><Link href="/#contact">تواصل مع المكتب</Link><p>© 2026 الشرق الأوسط وشركاؤه. جميع الحقوق محفوظة.</p></footer>
  </main>;
}
