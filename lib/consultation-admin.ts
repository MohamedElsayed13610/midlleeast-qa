import { z } from "zod";
import { CmsError } from "@/lib/cms-auth";
import type { ConsultationStatus } from "@/lib/consultation";

/** Columns the admin UI may read. client_ip_hash and payment internals never leave the server. */
export const consultationColumns = "id,reference_number,service_slug,consultation_method,client_name,client_phone,client_email,client_company,preferred_language,subject,description,starts_at,ends_at,duration_minutes,assigned_member_id,status,created_at,updated_at,assigned:cms_team(id,name,role)";

export const consultationId = z.string().uuid("معرّف الطلب غير صحيح.");
const stamp = z.string().datetime({ offset: true });

export const consultationPatch = z.discriminatedUnion("action", [
  z.object({ action: z.literal("set_status"), status: z.enum(["pending_confirmation", "confirmed", "completed", "cancelled"]), expected_updated_at: stamp }),
  z.object({ action: z.literal("reschedule"), starts_at: stamp, expected_updated_at: stamp }),
  z.object({ action: z.literal("assign"), member_id: z.string().uuid().nullable(), expected_updated_at: stamp }),
  z.object({ action: z.literal("add_note"), note: z.string().trim().min(1, "اكتب نص الملاحظة.").max(2000, "الملاحظة طويلة جدًا.") }),
]);

const nextStatuses: Record<ConsultationStatus, ConsultationStatus[]> = {
  new: ["pending_confirmation", "confirmed", "cancelled"],
  pending_confirmation: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};
export function assertTransition(from: ConsultationStatus, to: ConsultationStatus) {
  if (!nextStatuses[from]?.includes(to)) throw new CmsError(409, "لا يمكن نقل الطلب إلى هذه الحالة من حالته الحالية.");
}

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "اكتب الوقت بصيغة صحيحة.");
export const settingsInput = z.object({
  working_days: z.array(z.number().int().min(0).max(6)).max(7).transform(days => [...new Set(days)].sort()),
  start_time: time, end_time: time,
  slot_minutes: z.union([z.literal(15), z.literal(20), z.literal(30), z.literal(45), z.literal(60), z.literal(90), z.literal(120)]),
  min_notice_hours: z.number().int().min(0).max(168),
  max_advance_days: z.number().int().min(1).max(180),
  expected_updated_at: z.string().datetime({ offset: true }),
}).refine(value => value.end_time > value.start_time, { message: "وقت نهاية الدوام يجب أن يكون بعد وقت البداية.", path: ["end_time"] });
export const blockedInput = z.object({ blocked_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ غير صحيح."), reason: z.string().trim().max(200).default("") });
