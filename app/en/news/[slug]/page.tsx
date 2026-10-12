import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicNewsItem } from "@/lib/cms-server";
import StructuredData from "@/components/structured-data";
import { absoluteUrl, breadcrumbSchema, firmSchema } from "@/lib/seo";

export const dynamic="force-dynamic";
type Props={params:Promise<{slug:string}>};

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params;
  const item=await getPublicNewsItem(slug);
  if(!item) notFound();
  const title=item.title_en?.trim() || item.title;
  const description=item.excerpt_en?.trim() || item.excerpt;
  const path=`/en/news/${item.slug}`;
  const imageAlt=item.image_alt_en?.trim() || item.image_alt || title;
  return {
    title:`${title} | Middle East & Partners`,
    description,
    alternates:{canonical:absoluteUrl(path),languages:{ar:absoluteUrl(`/news/${item.slug}`),en:absoluteUrl(path)}},
    openGraph:{type:"article",locale:"en_QA",siteName:"Middle East & Partners",title,description,url:absoluteUrl(path),...(item.published_at?{publishedTime:item.published_at}:{}),...(item.image_url?{images:[{url:absoluteUrl(item.image_url),alt:imageAlt}]}:{})},
  };
}

export default async function EnglishNewsArticle({params}:Props){
  const {slug}=await params;
  const item=await getPublicNewsItem(slug);
  if(!item) notFound();
  const title=item.title_en?.trim() || item.title;
  const excerpt=item.excerpt_en?.trim() || item.excerpt;
  const content=item.content_en?.trim() || item.content;
  const category=item.category_en?.trim() || item.category;
  const author=item.author_en?.trim() || item.author;
  const imageAlt=item.image_alt_en?.trim() || item.image_alt || title;
  const path=`/en/news/${item.slug}`;
  return <>
    <StructuredData data={{"@context":"https://schema.org","@graph":[{"@type":"Article",headline:title,description:excerpt,inLanguage:"en",mainEntityOfPage:absoluteUrl(path),publisher:{"@id":firmSchema["@id"]},...(author?{author:{"@type":"Person",name:author}}:{}),...(item.published_at?{datePublished:item.published_at}:{}),...(item.updated_at?{dateModified:item.updated_at}:{}),...(item.image_url?{image:absoluteUrl(item.image_url)}:{})},breadcrumbSchema([{name:"Home",path:"/en"},{name:"News",path:"/en/news"},{name:title,path}])]}}/>
    <section className="team-page-heading section-pad">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/en">Home</Link><span>/</span><Link href="/en/news">News</Link></nav>
      <span className="kicker">{category}</span>
      <h1>{title}</h1>
      <p>{excerpt}</p>
      <div className="news-meta">{author&&<span>{author}</span>}{item.published_at&&<time dateTime={item.published_at}>{new Date(item.published_at).toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric",timeZone:"UTC"})}</time>}</div>
    </section>
    <article className="news-article section-pad" dir="ltr">
      {item.image_url&&<img className="news-cover" src={item.image_url} alt={imageAlt}/>} 
      <div>{content.split(/\n\s*\n/).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>
      <div style={{display:"flex",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}><Link href="/en/news" className="news-read-link">← Back to all news</Link><Link href={`/news/${item.slug}`} className="news-read-link">العربية</Link></div>
    </article>
  </>;
}
