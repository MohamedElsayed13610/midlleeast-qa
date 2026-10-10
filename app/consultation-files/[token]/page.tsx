import Link from "next/link";
import { Download, FileText, ShieldAlert } from "lucide-react";
import { formatDateTime } from "@/lib/consultation";
import { resolveShare } from "@/lib/consultation-share";
import { firmName } from "@/lib/seo";
import "../share.css";

// Private, temporary document access. Never indexed, never cached, and the token is not leaked through referrers.
export const dynamic = "force-dynamic";
export const metadata = { title: "مستندات الاستشارة", robots: { index: false, follow: false, nocache: true }, referrer: "no-referrer" as const };

const kind = (type: string) => (type === "application/pdf" ? "PDF" : type === "image/png" ? "PNG" : "JPG");
const size = (bytes: number) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export default async function SharedDocumentsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const share = await resolveShare(token); // null for invalid, expired, revoked or unknown: the page never says which
  return <main className="team-page share-page" dir="rtl">
    <header className="inner-header"><Link className="brand" href="/"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt={`شعار ${firmName}`} /><span className="brand-copy"><strong>{firmName}</strong><small>للمحاماة والتحكيم</small></span></Link></header>
    {share ? <>
      <section className="team-page-heading section-pad">
        <span className="kicker">مستندات خاصة</span>
        <h1>مستندات الاستشارة</h1>
        <p>رقم الطلب: <span dir="ltr" className="share-ref">{share.reference}</span> · {share.documents.length} {share.documents.length === 1 ? "مستند" : "مستندات"}</p>
      </section>
      <section className="share-body section-pad" aria-label="المستندات">
        <ul className="share-list">{share.documents.map(doc => <li key={doc.id}>
          <FileText size={22} strokeWidth={1.4} />
          <span className="share-name"><strong>{doc.name}</strong><small dir="ltr">{kind(doc.type)} · {size(doc.size)}</small></span>
          <a className="button button-gold" href={`/consultation-files/${token}/download/${doc.id}`}><Download size={17} />تحميل</a>
        </li>)}</ul>
        <p className="share-note"><ShieldAlert size={18} strokeWidth={1.4} />هذه المستندات سرية ومخصصة للمحامي المسؤول فقط. الرابط مؤقت وتنتهي صلاحيته في {formatDateTime(share.expiresAt)} (بتوقيت قطر). لا تشارك الرابط مع أي جهة أخرى.</p>
      </section>
    </> : <section className="team-page-heading section-pad share-invalid">
      <h1>رابط غير متاح</h1>
      <p>هذا الرابط غير صالح أو انتهت صلاحيته.</p>
    </section>}
    <footer className="inner-footer"><Link href="/">الموقع الرئيسي</Link><p>© 2026 {firmName}. جميع الحقوق محفوظة.</p></footer>
  </main>;
}
