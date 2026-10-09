import Link from "next/link";
import { getPublicNews } from "@/lib/cms-server";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";
import StructuredData from "@/components/structured-data";
export const dynamic="force-dynamic";
export const metadata=pageMetadata("أخبار المكتب والمقالات القانونية","أخبار الشرق الأوسط وشركاؤه للمحاماة والتحكيم في قطر، ومقالات ورؤى قانونية وسوابق قضائية.","/news");
export default async function NewsPage() {
  const news=await getPublicNews();
  return <><StructuredData data={{"@context":"https://schema.org",...breadcrumbSchema([{name:"الرئيسية",path:"/"},{name:"الأخبار",path:"/news"}])}}/><section className="team-page-heading section-pad"><nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">الأخبار</span></nav><span className="kicker">من المكتب</span><h1>الأخبار والمقالات القانونية</h1><p>رؤى المكتب وأبرز التطورات القضائية.</p></section><section className="news-list section-pad" aria-label="أخبار المكتب">{news.length ? news.map(item=><article className="news-list-card" key={item.slug}>{item.image_url && <Link href={`/news/${item.slug}`} tabIndex={-1} aria-hidden="true"><img src={item.image_url} alt="" loading="lazy"/></Link>}<span className="kicker">{item.category}</span><h2><Link href={`/news/${item.slug}`}>{item.title}</Link></h2><p>{item.excerpt}</p><div>{item.author && <span>{item.author}</span>}{item.published_at && <time dateTime={item.published_at}>{new Date(item.published_at).toLocaleDateString("ar-QA",{timeZone:"UTC"})}</time>}</div><Link className="news-read-link" href={`/news/${item.slug}`}>اقرأ الخبر كاملًا ←</Link></article>) : <p>لا توجد أخبار منشورة حاليًا.</p>}</section></>;
}
