import { z } from "zod";
import { legalServices } from "@/lib/services";

/* ---------------------------------------------------------------- vocabulary */
export const otherService = { slug: "other", title: "أخرى" } as const;
export const serviceOptions = [...legalServices.map(service => ({ slug: service.slug as string, title: service.title as string })), otherService as { slug: string; title: string }];
export const serviceSlugs = serviceOptions.map(service => service.slug) as [string, ...string[]];
export const serviceTitle = (slug: string) => serviceOptions.find(service => service.slug === slug)?.title ?? slug;

export const consultationMethods = [
  { value: "office", label: "اجتماع في المكتب", hint: "لوسيل — منطقة المارينا، برج التوأم أ، الطابق الثامن" },
  { value: "video", label: "مكالمة فيديو", hint: "رابط الجلسة يصلك بعد تأكيد الموعد" },
  { value: "phone", label: "مكالمة هاتفية", hint: "يتصل بك أحد أعضاء الفريق على الرقم الذي تحدده" },
] as const;
export type ConsultationMethod = (typeof consultationMethods)[number]["value"];
export const methodLabel = (value: string) => consultationMethods.find(method => method.value === value)?.label ?? value;

export const consultationStatuses = ["new", "pending_confirmation", "confirmed", "completed", "cancelled"] as const;
export type ConsultationStatus = (typeof consultationStatuses)[number];
export const statusLabels: Record<ConsultationStatus, string> = { new: "طلب جديد", pending_confirmation: "بانتظار التأكيد", confirmed: "مؤكد", completed: "مكتمل", cancelled: "ملغي" };
export const activeStatuses: ConsultationStatus[] = ["new", "pending_confirmation", "confirmed"];
export const languageLabels = { ar: "العربية", en: "English" } as const;

/* ---------------------------------------------------------------- documents */
export const documentRules = {
  maxFiles: 3,
  maxBytes: 10 * 1024 * 1024,
  types: { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" } as Record<string, "pdf" | "jpg" | "png">,
  accept: "application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png",
} as const;
export type DocumentMime = keyof typeof documentRules.types;

/** Identify a file by its leading bytes; never trust the browser-reported MIME type alone. */
export function sniffDocument(bytes: Uint8Array): DocumentMime | null {
  const starts = (signature: number[]) => bytes.length >= signature.length && signature.every((value, index) => bytes[index] === value);
  if (starts([0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";
  if (starts([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  return null;
}

/* ---------------------------------------------------------------- validation */
const controlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
export const cleanText = (value: string) => value.replace(controlCharacters, "").trim();

const phone = z.string().trim().min(1, "أدخل رقم الهاتف.").max(24, "رقم الهاتف طويل جدًا.")
  .regex(/^\+?[0-9\s\-()]+$/, "اكتب رقم هاتف صحيحًا بالأرقام فقط، مثال: +974 5555 5555")
  .refine(value => { const digits = value.replace(/\D/g, "").length; return digits >= 7 && digits <= 15; }, "رقم الهاتف يجب أن يكون بين 7 و15 رقمًا.");

export const serviceStepSchema = z.object({
  service_slug: z.enum(serviceSlugs, { errorMap: () => ({ message: "اختر نوع الاستشارة للمتابعة." }) }),
});
export const methodStepSchema = z.object({
  consultation_method: z.enum(["office", "video", "phone"], { errorMap: () => ({ message: "اختر طريقة الاستشارة للمتابعة." }) }),
});
export const clientStepSchema = z.object({
  client_name: z.string().trim().min(3, "اكتب الاسم الكامل (3 أحرف على الأقل).").max(120, "الاسم طويل جدًا."),
  client_phone: phone,
  client_email: z.string().trim().min(1, "أدخل البريد الإلكتروني.").email("اكتب بريدًا إلكترونيًا صحيحًا.").max(254, "البريد الإلكتروني طويل جدًا."),
  client_company: z.string().trim().max(150, "اسم الجهة طويل جدًا."),
  preferred_language: z.enum(["ar", "en"]),
});
export const detailsStepSchema = z.object({
  subject: z.string().trim().min(5, "اكتب عنوانًا مختصرًا للموضوع (5 أحرف على الأقل).").max(150, "العنوان طويل جدًا (150 حرفًا كحد أقصى)."),
  description: z.string().trim().min(20, "اشرح الحالة باختصار (20 حرفًا على الأقل).").max(4000, "الوصف طويل جدًا (4000 حرف كحد أقصى)."),
});
export const scheduleStepSchema = z.object({
  starts_at: z.string({ required_error: "اختر موعدًا من المواعيد المتاحة." }).min(1, "اختر موعدًا من المواعيد المتاحة.").datetime({ offset: true, message: "الموعد غير صحيح." }),
});
export const bookingSchema = serviceStepSchema.merge(methodStepSchema).merge(clientStepSchema).merge(detailsStepSchema).merge(scheduleStepSchema);
export type BookingValues = z.infer<typeof bookingSchema>;

export const documentMetaSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(["application/pdf", "image/jpeg", "image/png"], { errorMap: () => ({ message: "الصيغ المسموحة للمستندات: PDF أو JPG أو PNG." }) }),
  size: z.number().int().min(1, "المستند فارغ.").max(documentRules.maxBytes, "حجم المستند يجب ألا يتجاوز 10 ميجابايت."),
});
/** What the browser posts to /api/consultations. File bytes go straight to private storage afterwards. */
export const bookingRequestSchema = bookingSchema.extend({
  documents: z.array(documentMetaSchema).max(documentRules.maxFiles, "يمكن إرفاق 3 مستندات كحد أقصى.").default([]),
  website: z.string().max(200).optional(), // honeypot
});
export type BookingRequest = z.infer<typeof bookingRequestSchema>;

/* ---------------------------------------------------------------- API shapes */
export type SlotDay = { time: string; starts_at: string }[];
export type AvailabilityResponse = { configured: boolean; today: string; maxDate: string; slotMinutes: number; days: Record<string, SlotDay> };
export type DocumentUpload = { index: number; name: string; path: string; signedUrl: string; type: DocumentMime };
export type BookingResponse = { reference: string; starts_at: string; ends_at: string; method: ConsultationMethod; uploads: DocumentUpload[]; documentsRejected: number };

export type AdminConsultation = {
  id: string; reference_number: string; service_slug: string; consultation_method: ConsultationMethod; client_name: string; client_phone: string; client_email: string;
  client_company: string | null; preferred_language: "ar" | "en"; subject: string; description: string; starts_at: string; ends_at: string; duration_minutes: number;
  assigned_member_id: string | null; status: ConsultationStatus; created_at: string; updated_at: string;
  assigned: { id: string; name: string; role: string } | null;
};
export type AdminDocument = { id: string; original_name: string; mime_type: string; size_bytes: number; created_at: string };
export type AdminEvent = { id: string; kind: "created" | "status" | "reschedule" | "assign" | "note"; from_value: string | null; to_value: string | null; note: string | null; actor_email: string | null; created_at: string };
export type AdminSettings = { working_days: number[]; start_time: string; end_time: string; slot_minutes: number; min_notice_hours: number; max_advance_days: number; updated_at: string };
export type AdminBlockedDate = { id: string; blocked_on: string; reason: string };

/* ---------------------------------------------------------------- Qatar time (UTC+3, no DST) */
export const officeTimeZone = "Asia/Qatar";
const locale = "ar-QA-u-ca-gregory-nu-latn";
export const formatDateTime = (iso: string) => new Intl.DateTimeFormat(locale, { timeZone: officeTimeZone, weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
export const formatDay = (iso: string) => new Intl.DateTimeFormat(locale, { timeZone: officeTimeZone, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
export const formatTime = (iso: string) => new Intl.DateTimeFormat(locale, { timeZone: officeTimeZone, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso));
export const formatShortDate = (iso: string) => new Intl.DateTimeFormat(locale, { timeZone: officeTimeZone, day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
/** Format a plain `YYYY-MM-DD` office-local date without any timezone shifting. */
export const formatLocalDay = (date: string, options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day, 12)));
};
export const localDateOf = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: officeTimeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
export const isoDate = /^\d{4}-\d{2}-\d{2}$/;
