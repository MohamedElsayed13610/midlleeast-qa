import Link from "next/link";
import { notFound } from "next/navigation";
import StructuredData from "@/components/structured-data";
import { legalServices } from "@/lib/services";
import { absoluteUrl, breadcrumbSchema, firmName, firmSchema, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() { return legalServices.map(service => ({ slug: service.slug })); }

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = legalServices.find(item => item.slug === slug);
  if (!service) notFound();
  return pageMetadata(service.heading, service.description, `/services/${slug}`);
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = legalServices.find(item => item.slug === slug);
  if (!service) notFound();
  const related = legalServices.filter(item => item.slug !== slug);
  const path = `/services/${slug}`;
  return <main className="team-page service-page">
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [
      { "@type": "Service", "@id": absoluteUrl(`${path}#service`), name: service.heading, description: service.description, serviceType: service.title, url: absoluteUrl(path), provider: { "@id": firmSchema["@id"] }, areaServed: { "@type": "Country", name: "Qatar" } },
      breadcrumbSchema([{ name: "الرئيسية", path: "/" }, { name: service.title, path }]),
    ] }} />
    <header className="inner-header"><Link className="brand" href="/"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt={`شعار ${firmName}`} /><span className="brand-copy"><strong>{firmName}</strong><small>للمحاماة والتحكيم</small></span></Link><Link href="/#contact">تواصل مع المكتب</Link></header>
    <section className="team-page-heading section-pad">
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span aria-hidden="true">/</span><span aria-current="page">{service.title}</span></nav>
      <span className="kicker">خدماتنا القانونية</span><h1>{service.heading}</h1><p>{service.description}</p>
    </section>
    <article className="service-body section-pad">
      <p className="service-intro">{service.intro}</p>
      <div className="service-sections">{service.sections.map(section => <section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}</div>
      <section className="service-documents"><h2>ما الذي يساعد في دراسة ملفك؟</h2><p>عند التواصل مع الفريق، يساعد تجهيز المستندات التالية في فهم المسألة وتحديد نطاق المشورة:</p><ul>{service.documents.map(document => <li key={document}>{document}</li>)}</ul></section>
      <section className="service-contact"><h2>ناقش ملفك مع فريق المكتب</h2><p>مكتب قطر: منطقة المارينا، برج التوأم أ، الطابق الثامن، لوسيل.</p><div className="service-actions"><a className="button button-gold" href="https://wa.me/97477733348" target="_blank" rel="noreferrer">تواصل عبر واتساب</a><a href="tel:+97440026487" dir="ltr">+974 4002 6487</a><Link href="/team">تعرّف على فريقنا</Link></div></section>
      <aside className="related-services"><h2>خدمات قانونية أخرى</h2><div>{related.map(item => <Link key={item.slug} href={`/services/${item.slug}`}>{item.title}</Link>)}</div></aside>
    </article>
    <footer className="inner-footer"><Link href="/#services">كل مجالات الخبرة</Link><p>© 2026 {firmName}. جميع الحقوق محفوظة.</p></footer>
  </main>;
}
