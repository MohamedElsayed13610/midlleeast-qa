import { NextRequest, NextResponse } from "next/server";
import { CmsError } from "@/lib/cms-auth";
import { cmsClient, cmsConfigured } from "@/lib/cms-server";
import { isoDate } from "@/lib/consultation";
import type { AvailabilityResponse } from "@/lib/consultation";

type Client = ReturnType<typeof cmsClient>;
type PgError = { code?: string; message?: string } | null;

export const publicJson = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store, private", "X-Robots-Tag": "noindex, nofollow" } });

/** Translate the database's business errors (see db/migrations/001_online_consultations.sql) into user-facing responses. */
export function consultationError(error: NonNullable<PgError>, fallback = "تعذّر إتمام العملية الآن. حاول مرة أخرى.") {
  const code = error.code ?? "";
  if (code === "CS409" || code === "23P01") return new CmsError(409, "هذا الموعد لم يعد متاحًا. اختر موعدًا آخر.");
  if (code === "CS429") return new CmsError(429, "تم استلام عدد كبير من الطلبات. حاول لاحقًا أو تواصل معنا مباشرة.");
  if (code === "CS422" || code === "23514") return new CmsError(400, "راجع البيانات المدخلة وحاول مرة أخرى.");
  if (["42501", "PGRST301"].includes(code)) return new CmsError(403, "ليس لديك صلاحية تنفيذ هذا الإجراء.");
  return new CmsError(503, fallback);
}

export function requireConfigured() {
  if (!cmsConfigured()) throw new CmsError(503, "الحجز الإلكتروني غير متاح حاليًا. تواصل معنا عبر الهاتف أو واتساب.");
}

/** Abuse limiting key: salted hash of the caller's network address. The raw address is never stored. */
export async function clientFingerprint(request: NextRequest) {
  const forwarded = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!forwarded) return null;
  const salt = process.env.CONSULTATION_HASH_SALT || process.env.SUPABASE_URL || "me-consultations";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}|${forwarded}`));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

const addDays = (date: string, days: number) => { const next = new Date(`${date}T12:00:00Z`); next.setUTCDate(next.getUTCDate() + days); return next.toISOString().slice(0, 10); };

type SlotRow = { slot_start: string; slot_date: string; slot_time: string };
/** Open slots grouped by office-local date. Used by both the public API and the admin reschedule picker. */
export async function loadAvailability(client: Client, from?: string | null, to?: string | null): Promise<AvailabilityResponse> {
  const settings = await client.rpc("consultation_public_settings");
  if (settings.error) throw consultationError(settings.error, "تعذّر تحميل المواعيد الآن.");
  const info = (settings.data as { slot_minutes: number; max_advance_days: number; today: string }[] | null)?.[0];
  if (!info) return { configured: false, today: "", maxDate: "", slotMinutes: 60, days: {} };
  const maxDate = addDays(info.today, info.max_advance_days);
  const start = from && isoDate.test(from) && from > info.today ? from : info.today;
  const end = to && isoDate.test(to) && to < maxDate ? to : maxDate;
  const slots = await client.rpc("consultation_open_slots", { p_from: start, p_to: end });
  if (slots.error) throw consultationError(slots.error, "تعذّر تحميل المواعيد الآن.");
  const days: AvailabilityResponse["days"] = {};
  for (const row of (slots.data ?? []) as SlotRow[]) (days[row.slot_date] ??= []).push({ time: row.slot_time, starts_at: row.slot_start });
  return { configured: true, today: info.today, maxDate, slotMinutes: info.slot_minutes, days };
}
