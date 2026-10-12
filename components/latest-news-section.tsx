import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import type { CmsNews } from "@/lib/cms-types";

type Props={news:CmsNews[];locale:"ar"|"en";index?:string};

export default function LatestNewsSection({news,locale,index="02"}:Props) {
  const ar=locale==="ar";
  return <section id="knowledge" className="latest-news section-pad">
    <div className="section-index light reveal" data-reveal><span>{index}</span><p>{ar ? "أحدث الأخبار" : "Latest News"}</p></div>
    <div className="latest-news-heading reveal" data-reveal><div><span className="kicker">{ar ? "من المكتب" : "From the firm"}</span><h2>{ar ? <>آخر ما نُشر،<br/><em>بوضوح واختصار.</em></> : <>The latest updates,<br/><em>clearly presented.</em></>}</h2></div><p>{ar ? "آخر خبرين منشورين من لوحة الإدارة يظهران هنا تلقائيًا." : "The two most recently published updates from the dashboard appear here automatically."}</p></div>
    <div className="latest-news-grid">{news.slice(0,2).map(item=><article className="latest-news-card reveal" data-reveal key={item.slug} dir="auto">
      {item.image_url ? <Link className="latest-news-image" href={`/news/${item.slug}`}><img src={item.image_url} alt={item.image_alt || item.title} loading="lazy"/></Link> : <div className="latest-news-image latest-news-placeholder" aria-hidden="true"><span>§</span></div>}
      <div className="latest-news-copy"><div className="latest-news-meta"><span>{item.category}</span>{item.published_at && <time dateTime={item.published_at}>{new Date(item.published_at).toLocaleDateString(ar?"ar-QA":"en-GB",{year:"numeric",month:"short",day:"numeric",timeZone:"UTC"})}</time>}</div><h3><Link href={`/news/${item.slug}`}>{item.title}</Link></h3><p>{item.excerpt}</p><Link className="latest-news-read" href={`/news/${item.slug}`}>{ar ? <>اقرأ الخبر <ArrowUpLeft size={16}/></> : <>Read update <ArrowUpRight size={16}/></>}</Link></div>
    </article>)}{!news.length && <div className="latest-news-empty">{ar ? "لا توجد أخبار منشورة حاليًا." : "No published news yet."}</div>}</div>
    <div className="latest-news-all"><Link className="button button-gold" href="/news">{ar ? <>شاهد باقي الأخبار <ArrowUpLeft size={18}/></> : <>View all news <ArrowUpRight size={18}/></>}</Link></div>
  </section>;
}
