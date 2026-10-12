import Link from "next/link";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import type { CmsNews } from "@/lib/cms-types";

type Props={news:CmsNews[];locale:"ar"|"en";index?:string};

export default function LatestNewsSection({news,locale,index="02"}:Props) {
  const ar=locale==="ar";
  const basePath=ar ? "/news" : "/en/news";
  return <section id="knowledge" className="latest-news section-pad">
    <div className="section-index light reveal" data-reveal><span>{index}</span><p>{ar ? "أحدث الأخبار" : "Latest News"}</p></div>
    <div className="latest-news-heading reveal" data-reveal>
      <div>
        <span className="kicker">{ar ? "من المكتب" : "From the firm"}</span>
        <h2>{ar ? "آخر الأخبار والمستجدات" : "The latest updates"}</h2>
      </div>
      <p>{ar ? "اطّلع على أحدث أخبار المكتب، وأبرز إنجازاته ومشاركاته المهنية." : "Explore the firm's latest news, key achievements, and professional engagements."}</p>
    </div>
    <div className="latest-news-grid">{news.slice(0,2).map(item=>{
      const title=ar ? item.title : (item.title_en?.trim() || item.title);
      const excerpt=ar ? item.excerpt : (item.excerpt_en?.trim() || item.excerpt);
      const category=ar ? item.category : (item.category_en?.trim() || item.category);
      const imageAlt=ar ? item.image_alt : (item.image_alt_en?.trim() || item.image_alt || title);
      const href=`${basePath}/${item.slug}`;
      return <article className="latest-news-card reveal" data-reveal key={item.slug} dir={ar?"rtl":"ltr"}>
        {item.image_url ? <Link className="latest-news-image" href={href}><img src={item.image_url} alt={imageAlt || title} loading="lazy"/></Link> : <div className="latest-news-image latest-news-placeholder" aria-hidden="true"><span>§</span></div>}
        <div className="latest-news-copy"><div className="latest-news-meta"><span>{category}</span>{item.published_at && <time dateTime={item.published_at}>{new Date(item.published_at).toLocaleDateString(ar?"ar-QA":"en-GB",{year:"numeric",month:"short",day:"numeric",timeZone:"UTC"})}</time>}</div><h3><Link href={href}>{title}</Link></h3><p>{excerpt}</p><Link className="latest-news-read" href={href}>{ar ? <>اقرأ الخبر <ArrowUpLeft size={16}/></> : <>Read update <ArrowUpRight size={16}/></>}</Link></div>
      </article>;
    })}{!news.length && <div className="latest-news-empty">{ar ? "لا توجد أخبار منشورة حاليًا." : "No published news yet."}</div>}</div>
    <div className="latest-news-all"><Link className="button button-gold" href={basePath}>{ar ? <>شاهد باقي الأخبار <ArrowUpLeft size={18}/></> : <>View all news <ArrowUpRight size={18}/></>}</Link></div>
  </section>;
}
