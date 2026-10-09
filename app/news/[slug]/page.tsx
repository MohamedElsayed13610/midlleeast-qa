import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicNewsItem } from "@/lib/cms-server";
import StructuredData from "@/components/structured-data";
import { absoluteUrl, breadcrumbSchema, firmSchema, pageMetadata } from "@/lib/seo";
export const dynamic="force-dynamic";
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props) {
  const {slug}=await params;const item=await getPublicNewsItem(slug);if(!item)notFound();
  const meta=pageMetadata(item.title,item.excerpt,`/news/${item.slug}`);
  return {...meta,openGraph:{...meta.openGraph,type:"article",...(item.published_at ? {publishedTime:item.published_at} : {}),...(item.image_url ? {images:[{url:absoluteUrl(item.image_url),alt:item.image_alt}]} : {})}};
}
export default async function NewsArticle({params}:Props) {
  const {slug}=await params;const item=await getPublicNewsItem(slug);if(!item)notFound();
  const path=`/news/${item.slug}`;
  return <><StructuredData data={{"@context":"https://schema.org","@graph":[{"@type":"Article",headline:item.title,description:item.excerpt,inLanguage:"ar",mainEntityOfPage:absoluteUrl(path),publisher:{"@id":firmSchema["@id"]},...(item.author ? {author:{"@type":item.author==="جريدة الشرق" ? "Organization" : "Person",name:item.author}} : {}),...(item.published_at ? {datePublished:item.published_at} : {}),...(item.updated_at ? {dateModified:item.updated_at} : {}),...(item.image_url ? {image:absoluteUrl(item.image_url)} : {})},breadcrumbSchema([{name:"الرئيسية",path:"/"},{name:"الأخبار",path:"/news"},{name:item.title,path}])]}}/><section className="team-page-heading section-pad"><nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/news">الأخبار</Link></nav><span className="kicker">{item.category}</span><h1>{item.title}</h1><p>{item.excerpt}</p><div className="news-meta">{item.author && <span>{item.author}</span>}{item.published_at && <time dateTime={item.published_at}>{new Date(item.published_at).toLocaleDateString("ar-QA",{timeZone:"UTC"})}</time>}</div></section><article className="news-article section-pad">{item.image_url && <img className="news-cover" src={item.image_url} alt={item.image_alt}/>}<div>{item.content.split(/\n\s*\n/).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div><Link href="/news" className="news-read-link">العودة إلى كل الأخبار ←</Link></article></>;
}
