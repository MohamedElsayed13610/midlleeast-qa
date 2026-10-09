import Link from "next/link";
import BookingFlow from "@/components/consultation/booking-flow";
import Reveal from "@/components/consultation/reveal";
import StructuredData from "@/components/structured-data";
import { absoluteUrl, breadcrumbSchema, firmName, firmSchema, pageMetadata } from "@/lib/seo";
import { officePhone, whatsappUrl } from "@/lib/contact";
import "./consultation.css";

const description = "احجز استشارة قانونية مع الشرق الأوسط وشركاؤه في قطر: اختر مجال الاستشارة (الشركات والعقود، المنازعات والتحكيم، الطاقة، العمل والهجرة، التكنولوجيا، الضرائب) والموعد المناسب، وسيتواصل معك فريق المكتب لتأكيد الجلسة.";
export const metadata = {
  ...pageMetadata("حجز استشارة قانونية في قطر", description, "/consultation"),
  title: { absolute: "حجز استشارة قانونية في قطر | الشرق الأوسط وشركاؤه" },
};

const trust = [
  { title: "سرية وخصوصية", text: "تفاصيل طلبك ومستنداتك محفوظة بسرية ولا يطّلع عليها إلا فريق المكتب." },
  { title: "فريق قانوني متخصص", text: "تُراجع الطلبات من محامين ومستشارين بحسب مجال استشارتك." },
  { title: "جلسات حضورية وعن بُعد", text: "اجتماع في مكتب لوسيل، أو مكالمة فيديو، أو مكالمة هاتفية." },
];
const after = [
  { number: "01", title: "مراجعة الطلب", text: "يطّلع فريق المكتب على موضوعك والمستندات المرفقة ويحدد المحامي المناسب." },
  { number: "02", title: "تأكيد الموعد", text: "نتواصل معك على الهاتف أو البريد لتأكيد الموعد أو اقتراح بديل مناسب." },
  { number: "03", title: "الجلسة", text: "تُعقد الاستشارة بالطريقة التي اخترتها، ويُحدَّد بعدها نطاق العمل القانوني إن لزم." },
];

export default function ConsultationPage() {
  return <main className="team-page consult-page" dir="rtl">
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [
      { "@type": "WebPage", "@id": absoluteUrl("/consultation#webpage"), url: absoluteUrl("/consultation"), name: "حجز استشارة قانونية في قطر", description, inLanguage: "ar", isPartOf: { "@id": absoluteUrl("/#website") }, about: { "@id": firmSchema["@id"] } },
      breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: "حجز استشارة قانونية", path: "/consultation" }]),
    ] }} />
    <Reveal />
    <header className="inner-header"><Link className="brand" href="/"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt={`شعار ${firmName}`} /><span className="brand-copy"><strong>{firmName}</strong><small>للمحاماة والتحكيم</small></span></Link><Link href="/">العودة إلى الرئيسية</Link></header>

    <section className="consult-hero section-pad" aria-labelledby="consult-title">
      <div className="consult-hero-lines" aria-hidden="true" />
      <div className="consult-hero-copy">
        <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span aria-hidden="true">/</span><span aria-current="page">حجز استشارة قانونية</span></nav>
        <div className="eyebrow"><span /> استشارة قانونية</div>
        <h1 id="consult-title">ابدأ بخطوة قانونية <em>واضحة.</em></h1>
        <p>اختر نوع الاستشارة والموعد المناسب، وأرسل تفاصيلك لفريق الشرق الأوسط وشركاؤه لمراجعتها وتأكيد الجلسة.</p>
      </div>
      <ul className="consult-trust">{trust.map((item, index) => <li key={item.title} className="reveal" data-reveal style={{ transitionDelay: `${index * 0.1}s` }}><strong>{item.title}</strong><span>{item.text}</span></li>)}</ul>
    </section>

    <section className="consult-booking section-pad" aria-label="نموذج حجز الاستشارة" id="booking"><BookingFlow /></section>

    <section className="consult-after section-pad" aria-labelledby="consult-after-title">
      <div className="section-index light reveal" data-reveal><span>—</span><p>ماذا بعد إرسال الطلب؟</p></div>
      <h2 id="consult-after-title" className="reveal" data-reveal>خطوات واضحة،<br /><em>دون التزام مسبق.</em></h2>
      <ol className="consult-after-list">{after.map((item, index) => <li key={item.number} className="reveal" data-reveal style={{ transitionDelay: `${index * 0.1}s` }}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>)}</ol>
      <p className="consult-after-contact reveal" data-reveal>تفضّل التحدث مباشرة؟ <a href={whatsappUrl} target="_blank" rel="noreferrer">واتساب</a> · <a href={officePhone.href} dir="ltr">{officePhone.display}</a></p>
    </section>

    <footer className="inner-footer"><Link href="/#contact">تواصل مع المكتب</Link><p>© 2026 {firmName}. جميع الحقوق محفوظة.</p></footer>
  </main>;
}
