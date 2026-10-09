import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { practiceAreas } from "@/lib/services";

type PracticeArea = (typeof practiceAreas)[number];

function PracticeCard({ area }: { area: PracticeArea }) {
  return <Link className="practice-photo-card" href={`/services/${area.slug}`}>
    <img src={`/images/practice/${area.slug}.webp`} alt="" width="1200" height="800" loading="lazy" decoding="async" />
    <div className="practice-card-caption">
      <div><h3>{area.title}</h3><p>{area.summary}</p></div>
      <span className="practice-card-arrow" aria-hidden="true"><ArrowLeft size={21} strokeWidth={1.7} /></span>
    </div>
  </Link>;
}

export default function PracticeAreas() {
  return <section id="services" className="practice-areas section-pad" aria-labelledby="practice-heading">
    <div className="practice-heading reveal" data-reveal>
      <div><span className="practice-eyebrow">مجالات العمل</span><h2 id="practice-heading">مجالات الاختصاص الرئيسية</h2></div>
      <p><strong>حلولك القانونية في قضايا معقّدة</strong><span>نقدّم لك مشورة قانونية متخصصة تدعم قراراتك وتحمي مصالحك.</span></p>
    </div>
    <div className="practice-photo-grid">{practiceAreas.filter(area => area.primary).map(area => <PracticeCard key={area.slug} area={area} />)}</div>
    <details className="practice-more">
      <summary><span className="practice-more-closed">تصفّح جميع المجالات</span><span className="practice-more-open">إخفاء المجالات الإضافية</span><ArrowLeft size={20} aria-hidden="true" /></summary>
      <div className="practice-photo-grid practice-additional">{practiceAreas.filter(area => !area.primary).map(area => <PracticeCard key={area.slug} area={area} />)}</div>
    </details>
  </section>;
}
