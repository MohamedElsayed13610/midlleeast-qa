import { formatDay, formatTime, methodLabel, serviceTitle } from "@/lib/consultation";
import type { AdminConsultation } from "@/lib/consultation";
import { firmName } from "@/lib/seo";

type Base = Pick<AdminConsultation, "reference_number" | "service_slug" | "consultation_method" | "starts_at" | "duration_minutes">;
const schedule = (c: Base) => [
  `نوع الاستشارة: ${serviceTitle(c.service_slug)}`,
  `طريقة الاستشارة: ${methodLabel(c.consultation_method)}`,
];

/** Message to the assigned lawyer. Subject only: the full case description never goes into WhatsApp. */
export function lawyerMessage(input: { lawyerName: string; consultation: Base & Pick<AdminConsultation, "client_name" | "subject">; documents: { count: number; link: string } | null }) {
  const c = input.consultation;
  const lines = [
    `السلام عليكم أستاذ/ ${input.lawyerName}،`, "",
    `تم إسناد استشارة قانونية جديدة إليك من مكتب ${firmName}.`, "",
    `رقم الطلب: ${c.reference_number}`,
    `العميل: ${c.client_name}`,
    ...schedule(c),
    `الموعد المقترح: ${formatDay(c.starts_at)}`,
    `الوقت: ${formatTime(c.starts_at)}`,
    `مدة الجلسة: ${c.duration_minutes} دقيقة`,
    `عنوان الموضوع: ${c.subject}`,
  ];
  if (input.documents) lines.push("", `المستندات المرفقة: ${input.documents.count}`, "عرض وتحميل المستندات:", input.documents.link, "(الرابط مؤقت وتنتهي صلاحيته خلال 24 ساعة)");
  lines.push("", "يرجى تأكيد مناسبة الموعد أو إبلاغنا في حال عدم ملاءمته.", "", `مكتب ${firmName}`);
  return lines.join("\n");
}

/** Confirmation to the client. Never invents a meeting link. */
export function clientMessage(input: { consultation: Base & Pick<AdminConsultation, "client_name">; updated?: boolean }) {
  const c = input.consultation;
  const section = c.consultation_method === "office" ? ["مكان الاستشارة:", "لوسيل — منطقة المارينا، برج التوأم أ، الطابق الثامن"]
    : c.consultation_method === "video" ? ["سيتم إرسال رابط الاجتماع إليكم قبل الموعد."]
    : ["سيتواصل معكم فريق المكتب على الرقم المسجل في الموعد المحدد."];
  return [
    `الأستاذ/ة ${c.client_name}،`, "",
    input.updated ? `نفيدكم بتحديث موعد استشارتكم القانونية لدى مكتب ${firmName}.` : `تم تأكيد موعد استشارتكم القانونية لدى مكتب ${firmName}.`, "",
    `رقم الطلب: ${c.reference_number}`,
    ...schedule(c),
    `التاريخ: ${formatDay(c.starts_at)}`,
    `الوقت: ${formatTime(c.starts_at)}`,
    `مدة الجلسة: ${c.duration_minutes} دقيقة`, "",
    ...section, "",
    `نشكر لكم ثقتكم بمكتب ${firmName}.`,
  ].join("\n");
}
