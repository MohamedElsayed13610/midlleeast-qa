import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicNewsItem } from "@/lib/cms-server";
import StructuredData from "@/components/structured-data";
import { absoluteUrl, breadcrumbSchema, firmSchema, pageMetadata } from "@/lib/seo";
import { cleanNewsText, newsParagraphs } from "@/lib/news-text";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = await getPublicNewsItem(slug);
  if (!item) notFound();

  const title = cleanNewsText(item.title);
  const excerpt = cleanNewsText(item.excerpt);
  const meta = pageMetadata(title, excerpt, `/news/${item.slug}`);

  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      ...(item.published_at ? { publishedTime: item.published_at } : {}),
      ...(item.image_url
        ? { images: [{ url: absoluteUrl(item.image_url), alt: cleanNewsText(item.image_alt) }] }
        : {}),
    },
  };
}

export default async function NewsArticle({ params }: Props) {
  const { slug } = await params;
  const item = await getPublicNewsItem(slug);
  if (!item) notFound();

  const title = cleanNewsText(item.title);
  const excerpt = cleanNewsText(item.excerpt);
  const category = cleanNewsText(item.category);
  const author = cleanNewsText(item.author);
  const imageAlt = cleanNewsText(item.image_alt) || title;
  const paragraphs = newsParagraphs(item.content, title);
  const path = `/news/${item.slug}`;

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: title,
              description: excerpt,
              inLanguage: "ar",
              mainEntityOfPage: absoluteUrl(path),
              publisher: { "@id": firmSchema["@id"] },
              ...(author
                ? {
                    author: {
                      "@type": author === "جريدة الشرق" ? "Organization" : "Person",
                      name: author,
                    },
                  }
                : {}),
              ...(item.published_at ? { datePublished: item.published_at } : {}),
              ...(item.updated_at ? { dateModified: item.updated_at } : {}),
              ...(item.image_url ? { image: absoluteUrl(item.image_url) } : {}),
            },
            breadcrumbSchema([
              { name: "الرئيسية", path: "/" },
              { name: "الأخبار", path: "/news" },
              { name: title, path },
            ]),
          ],
        }}
      />

      <section className="team-page-heading section-pad" dir="rtl" lang="ar">
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link>
          <span>/</span>
          <Link href="/news">الأخبار</Link>
        </nav>
        <span className="kicker">{category}</span>
        <h1 dir="auto" style={{ unicodeBidi: "plaintext" }}>
          {title}
        </h1>
        <p dir="auto" style={{ unicodeBidi: "plaintext" }}>
          {excerpt}
        </p>
        <div className="news-meta">
          {author && <span>{author}</span>}
          {item.published_at && (
            <time dateTime={item.published_at}>
              {new Date(item.published_at).toLocaleDateString("ar-QA", { timeZone: "UTC" })}
            </time>
          )}
        </div>
      </section>

      <article className="news-article section-pad" dir="rtl" lang="ar">
        {item.image_url && <img className="news-cover" src={item.image_url} alt={imageAlt} />}
        <div>
          {paragraphs.map((paragraph, index) => (
            <p key={index} dir="auto" style={{ unicodeBidi: "plaintext" }}>
              {paragraph}
            </p>
          ))}
        </div>
        <Link href="/news" className="news-read-link">
          العودة إلى كل الأخبار ←
        </Link>
      </article>
    </>
  );
}
