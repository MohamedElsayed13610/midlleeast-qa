import Link from "next/link";
import type { ReactNode } from "react";
import { firmName } from "@/lib/seo";
export default function NewsLayout({children}:{children:ReactNode}) {
  return <main className="team-page service-page news-page" dir="rtl"><header className="inner-header"><Link className="brand" href="/"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt={`شعار ${firmName}`}/><span className="brand-copy"><strong>{firmName}</strong><small>للمحاماة والتحكيم</small></span></Link><Link href="/#contact">تواصل مع المكتب</Link></header>{children}<footer className="inner-footer"><Link href="/">العودة إلى الرئيسية</Link><p>© 2026 {firmName}. جميع الحقوق محفوظة.</p></footer></main>;
}
