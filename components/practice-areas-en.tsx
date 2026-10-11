import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { legalServicesEn } from "@/lib/services-en";

function Card({ area }: { area: (typeof legalServicesEn)[number] }) {
  return <Link className="practice-photo-card" href={`/en/services/${area.slug}`}>
    <img src={`/images/practice/${area.slug}.webp`} alt="" width="1200" height="800" loading="lazy" decoding="async" />
    <div className="practice-card-caption"><div><h3>{area.title}</h3><p>{area.summary}</p></div><span className="practice-card-arrow" aria-hidden="true"><ArrowRight size={21} strokeWidth={1.7} /></span></div>
  </Link>;
}

export default function PracticeAreasEn() {
  return <section id="services" className="practice-areas section-pad" aria-labelledby="practice-heading-en">
    <div className="practice-heading reveal" data-reveal>
      <div><span className="practice-eyebrow">Practice Areas</span><h2 id="practice-heading-en">Core areas of legal practice</h2></div>
      <p><strong>Legal solutions for complex matters</strong><span>Specialist advice designed to support decisions and protect long-term interests.</span></p>
    </div>
    <div className="practice-photo-grid">{legalServicesEn.filter(area => area.primary).map(area => <Card key={area.slug} area={area} />)}</div>
    <details className="practice-more"><summary><span className="practice-more-closed">View all practice areas</span><span className="practice-more-open">Hide additional areas</span><ArrowRight size={20} aria-hidden="true" /></summary><div className="practice-photo-grid practice-additional">{legalServicesEn.filter(area => !area.primary).map(area => <Card key={area.slug} area={area} />)}</div></details>
  </section>;
}
