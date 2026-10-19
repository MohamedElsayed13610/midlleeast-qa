import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicNewsItem } from "@/lib/cms-server";
import StructuredData from "@/components/structured-data";
import { absoluteUrl, breadcrumbSchema, firmEnglishName, firmSchema } from "@/lib/seo";
import { cleanNewsText, newsParagraphs, textDirection } from "@/lib/news-text";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublicNewsItem(slug);
  if (!item) notFound();

  const title = cleanNewsText(item.title_en?.trim() || item.title);
  const description = cleanNewsText(item.excerpt_en?.trim() || item.excerpt);
  const path = `/en/news/${item.slug}`;
  const imageAlt = cleanNewsText(item.image_alt_en?.trim() || item.image_alt || title);

  return {
    title: { absolute: `${title} | ${firmEnglishName}` },
    description,
    alternates: {
      canonical: absoluteUrl(path),
      languages: { ar: absoluteUrl(`/news/${item.slug}`), en: absoluteUrl(path) },
    },
    openGraph: {
      type: "article",
      locale: "en_QA",
      siteName: firmEnglishName,
      title,
      description,
      url: absoluteUrl(path),
      ...(item.published_at ? { publishedTime: item.published_at } : {}),
      ...(item.image_url
        ? { images: [{ url: absoluteUrl(item.image_url), alt: imageAlt }] }
        : {}),
    },
  };
}

export default async function EnglishNewsArticle({ params }: Props) {
  const { slug } = await params;
  const item = await getPublicNewsItem(slug);
  if (!item) notFound();

  const hasEnglishContent = Boolean(item.title_en?.trim() || item.excerpt_en?.trim() || item.content_en?.trim());
  const title = cleanNewsText(item.title_en?.trim() || item.title);
  const excerpt = cleanNewsText(item.excerpt_en?.trim() || item.excerpt);
  const content = item.content_en?.trim() || item.content;
  const category = cleanNewsText(item.category_en?.trim() || item.category);
  const author = cleanNewsText(item.author_en?.trim() || item.author);
  const imageAlt = cleanNewsText(item.image_alt_en?.trim() || item.image_alt || title);
  const direction = textDirection(`${title} ${excerpt} ${content}`);
  const language = direction === "rtl" ? "ar" : "en";
  const paragraphs = newsParagraphs(content, title);
  const path = `/en/news/${item.slug}`;

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
              inLanguage: language,
              mainEntityOfPage: absoluteUrl(path),
              publisher: { "@id": firmSchema["@id"] },
              ...(author ? { author: { "@type": "Person", name: author } } : {}),
              ...(item.published_at ? { datePublished: item.published_at } : {}),
              ...(item.updated_at ? { dateModified: item.updated_at } : {}),
              ...(item.image_url ? { image: absoluteUrl(item.image_url) } : {}),
            },
            breadcrumbSchema(
              hasEnglishContent
                ? [
                    { name: "Home", path: "/en" },
                    { name: "News", path: "/en/news" },
                    { name: title, path },
                  ]
                : [
                    { name: "الرئيسية", path: "/" },
                    { name: "الأخبار", path: "/news" },
                    { name: title, path: `/news/${item.slug}` },
                  ],
            ),
          ],
        }}
      />

      <section className="team-page-heading section-pad" dir={direction} lang={language}>
        <nav className="breadcrumbs" aria-label={hasEnglishContent ? "Breadcrumb" : "مسار الصفحة"}>
          {hasEnglishContent ? (
            <>
              <Link href="/en">Home</Link>
              <span>/</span>
              <Link href="/en/news">News</Link>
            </>
          ) : (
            <>
              <Link href="/">الرئيسية</Link>
              <span>/</span>
              <Link href="/news">الأخبار</Link>
            </>
          )}
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
              {new Date(item.published_at).toLocaleDateString(hasEnglishContent ? "en-GB" : "ar-QA", {
                year: "numeric",
                month: hasEnglishContent ? "long" : undefined,
                day: "numeric",
                timeZone: "UTC",
              })}
            </time>
          )}
        </div>
      </section>

      <article className="news-article section-pad" dir={direction} lang={language}>
        {item.image_url && <img className="news-cover" src={item.image_url} alt={imageAlt} />}
        <div>
          {paragraphs.map((paragraph, index) => (
            <p key={index} dir="auto" style={{ unicodeBidi: "plaintext" }}>
              {paragraph}
            </p>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <Link href={hasEnglishContent ? "/en/news" : "/news"} className="news-read-link">
            {hasEnglishContent ? "← Back to all news" : "العودة إلى كل الأخبار ←"}
          </Link>
          <Link href="/en/contact" className="news-read-link">Contact Us</Link>
          {hasEnglishContent && (
            <Link href={`/news/${item.slug}`} className="news-read-link">
              العربية
            </Link>
          )}
        </div>
      </article>
    </>
  );
}
