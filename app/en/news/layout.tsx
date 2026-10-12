import Link from "next/link";
import type { ReactNode } from "react";

export default function EnglishNewsLayout({children}:{children:ReactNode}) {
  return <main className="team-page service-page news-page english-shell" dir="ltr">
    <header className="inner-header">
      <Link className="brand" href="/en"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt="Middle East & Partners logo"/><span className="brand-copy"><strong>Middle East &amp; Partners</strong><small>L M E LAW FIRM</small></span></Link>
      <div style={{display:"flex",alignItems:"center",gap:18}}><Link href="/news">العربية</Link><Link href="/en#contact">Contact the firm</Link></div>
    </header>
    {children}
    <footer className="inner-footer"><Link href="/en">Back to home</Link><p>© 2026 Middle East &amp; Partners. All rights reserved.</p></footer>
  </main>;
}
