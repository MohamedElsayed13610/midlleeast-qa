"use client";
import Link from "next/link";
export default function SiteError({reset}:{reset:()=>void}) {
  return <main className="team-page section-pad" dir="rtl"><h1>تعذّر تحميل الصفحة الآن</h1><p>حاول مرة أخرى بعد قليل.</p><button className="button button-gold" onClick={reset}>إعادة المحاولة</button><Link href="/">العودة إلى الرئيسية</Link></main>;
}
