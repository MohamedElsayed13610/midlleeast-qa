import Link from "next/link";
import { getPublicMembers } from "@/lib/cms-server";
import TeamCardEn from "@/components/team-card-en";
import StructuredData from "@/components/structured-data";
import { groupTeam } from "@/lib/cms-types";
import { absoluteUrl, breadcrumbSchema, firmEnglishName, firmSchema } from "@/lib/seo";

export const metadata = {
  title: { absolute: `Our Team | ${firmEnglishName}` },
  description: "Meet the lawyers, legal advisers and professionals of Middle East & Partners Law Firm in Qatar and across its regional network.",
  alternates: { canonical: absoluteUrl("/en/team"), languages: { ar: absoluteUrl("/team"), en: absoluteUrl("/en/team") } },
  openGraph: { type: "website", locale: "en_QA", siteName: firmEnglishName, title: `Our Team | ${firmEnglishName}`, description: "Meet the firm's legal team in Qatar and across the region.", url: absoluteUrl("/en/team") },
};

export const dynamic = "force-dynamic";
export default async function EnglishTeamPage() {
  const members = await getPublicMembers();
  const { qatar, regional } = groupTeam(members);
  const people = [...qatar, ...regional];

  return <main className="team-page english-shell" dir="ltr">
    <StructuredData data={{ "@context": "https://schema.org", "@graph": [
      firmSchema,
      breadcrumbSchema([{ name: "Home", path: "/en" }, { name: "Our Team", path: "/en/team" }]),
      { "@type": "CollectionPage", url: absoluteUrl("/en/team"), name: `Our Team | ${firmEnglishName}`, inLanguage: "en", about: { "@id": firmSchema["@id"] } },
    ] }} />
    <header className="inner-header"><Link className="brand" href="/en"><img src="/assets/brand/logo-white.webp" width="64" height="64" alt={`${firmEnglishName} logo`} /><span className="brand-copy"><strong>Middle East &amp; Partners</strong><small>Law &amp; Arbitration</small></span></Link><Link href="/en/about">About Us</Link></header>
    <section className="team-page-heading section-pad"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/en">Home</Link><span>/</span><span aria-current="page">Our Team</span></nav><span className="kicker">Regional legal team</span><h1>Our Team</h1><p>Lawyers, advisers and professionals working together across Qatar and the firm's regional network.</p></section>
    <section className="team-page-body section-pad" aria-label="Team directory"><div className="compact-team-grid">{people.map(member => <TeamCardEn key={member.slug} member={member} />)}</div></section>
    <footer className="inner-footer"><Link href="/en#contact">Contact the firm</Link><p>© 2026 {firmEnglishName}. All rights reserved.</p></footer>
  </main>;
}
