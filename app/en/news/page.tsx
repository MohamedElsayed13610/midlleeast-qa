import type { Metadata } from "next";
import Link from "next/link";
import { getPublicNews } from "@/lib/cms-server";
import { absoluteUrl, breadcrumbSchema, firmEnglishName, firmSchema } from "@/lib/seo";
import StructuredData from "@/components/structured-data";

export const dynamic="force-dynamic";
export const metadata:Metadata={
  title:{absolute:`News & Legal Insights | ${firmEnglishName}`},
  description:`Firm news, legal insights and selected court developments from ${firmEnglishName} in Qatar.`,
  alternates:{canonical:absoluteUrl("/en/news"),languages:{ar:absoluteUrl("/news"),en:absoluteUrl("/en/news")}},
  openGraph:{type:"website",locale:"en_QA",siteName:firmEnglishName,title:`News & Legal Insights | ${firmEnglishName}`,description:`Firm news, legal insights and selected court developments from ${firmEnglishName} in Qatar.`,url:absoluteUrl("/en/news")},
};

export default async function EnglishNewsPage(){
  const news=await getPublicNews();
  return <>
    <StructuredData data={{"@context":"https://schema.org","@graph":[{...firmSchema,name:firmEnglishName},breadcrumbSchema([{name:"Home",path:"/en"},{name:"News",path:"/en/news"}]),{"@type":"CollectionPage",url:absoluteUrl("/en/news"),name:`News & Legal Insights | ${firmEnglishName}`,inLanguage:"en",about:{"@id":firmSchema["@id"]}}]}}/>
    <section className="team-page-heading section-pad">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/en">Home</Link><span>/</span><span aria-current="page">News</span></nav>
      <span className="kicker">From the firm</span>
      <h1>News &amp; Legal Insights</h1>
      <p>Firm updates, legal commentary and selected developments from Qatar and the region.</p>
    </section>
    <section className="news-list section-pad" aria-label="Firm news">
      {news.length ? news.map(item=>{
        const title=item.title_en?.trim() || item.title;
        const excerpt=item.excerpt_en?.trim() || item.excerpt;
        const category=item.category_en?.trim() || item.category;
        const author=item.author_en?.trim() || item.author;
        const href=`/en/news/${item.slug}`;
        return <article className="news-list-card" key={item.slug} dir="ltr">
          {item.image_url && <Link href={href} tabIndex={-1} aria-hidden="true"><img src={item.image_url} alt="" loading="lazy"/></Link>}
          <span className="kicker">{category}</span>
          <h2><Link href={href}>{title}</Link></h2>
          <p>{excerpt}</p>
          <div>{author && <span>{author}</span>}{item.published_at && <time dateTime={item.published_at}>{new Date(item.published_at).toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric",timeZone:"UTC"})}</time>}</div>
          <Link className="news-read-link" href={href}>Read full update →</Link>
        </article>;
      }) : <p>No published news yet.</p>}
    </section>
    <div className="section-pad" style={{display:"flex",justifyContent:"center",gap:"14px",flexWrap:"wrap"}}><Link className="button button-outline" href="/en/services">Legal Services</Link><Link className="button button-outline" href="/en/team">Our Team</Link><Link className="button button-gold" href="/en/contact">Contact Us</Link></div>
  </>;
}
