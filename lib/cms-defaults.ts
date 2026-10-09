import { allPeople, qatarFeaturedPeople } from "@/lib/team";
import type { CmsNews, PublicTeamMember } from "@/lib/cms-types";

export const defaultMembers: PublicTeamMember[] = allPeople.map((member,index) => ({ ...member, featured: qatarFeaturedPeople.some(item => item.slug === member.slug), sort_order: index }));
export const defaultNews: CmsNews[] = [
  { id: "cross-border-law-firms", slug: "cross-border-law-firms", title: "المحاماة بين المحلية والعالمية: رحلة انتشار عابرة للحدود", excerpt: "قراءة في توسّع مكاتب المحاماة إقليميًا، ودور التحالفات القانونية في خدمة الاستثمارات والمعاملات الدولية.", content: "يتناول التحليل كيف أصبح الحضور العابر للحدود ضرورة لخدمة العملاء في العقود الدولية والتحكيم والاستثمار، مع الحفاظ على فهم عميق للقوانين المحلية والمعايير المهنية في كل سوق.", category: "رؤية قانونية", author: "المحامي محمد بن عوجان الهاجري", image_url: "", image_alt: "", published_at: null, status: "published", updated_at: "" },
  { id: "real-estate-jurisdiction", slug: "real-estate-jurisdiction", title: "سابقة قضائية تحسم الاختصاص في التطوير العقاري", excerpt: "محكمة التمييز تقر اختصاص لجنة فض المنازعات وتوضح المسار الإجرائي للنزاع.", content: "تسلّط السابقة الضوء على معيار تحديد الجهة المختصة في منازعات التطوير العقاري، وما يترتب عليه من وضوح أكبر عند اختيار المسار القانوني قبل بدء الإجراءات.", category: "سابقة قضائية", author: "جريدة الشرق", image_url: "", image_alt: "", published_at: "2026-04-29", status: "published", updated_at: "" },
];
