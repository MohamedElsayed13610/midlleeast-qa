import { NextRequest } from "next/server";
import { adminJson, CmsError, readJson, withAdmin } from "@/lib/cms-auth";
import { assertTransition, consultationColumns, consultationId, consultationPatch } from "@/lib/consultation-admin";
import { consultationError, loadAvailability } from "@/lib/consultation-server";
import { localDateOf } from "@/lib/consultation";
import type { AdminConsultation, ConsultationStatus } from "@/lib/consultation";
import { clientMessage, lawyerMessage } from "@/lib/consultation-messages";
import { generateShareToken, hashShareToken } from "@/lib/consultation-share";
import { buildWhatsAppUrl, normalizeWhatsAppPhone } from "@/lib/whatsapp";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  return withAdmin(request, async ({ client }) => {
    const id = consultationId.parse((await params).id);
    const [main, documents, events] = await Promise.all([
      client.from("consultations").select(consultationColumns).eq("id", id).maybeSingle(),
      client.from("consultation_documents").select("id,original_name,mime_type,size_bytes,created_at").eq("consultation_id", id).order("created_at"),
      client.from("consultation_events").select("id,kind,from_value,to_value,note,actor_email,created_at").eq("consultation_id", id).order("created_at", { ascending: false }).limit(200),
    ]);
    for (const result of [main, documents, events]) if (result.error) throw consultationError(result.error);
    if (!main.data) throw new CmsError(404, "الطلب غير موجود.");
    return adminJson({ item: main.data, documents: documents.data, events: events.data });
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  return withAdmin(request, async ({ client }) => {
    const id = consultationId.parse((await params).id);
    const body = consultationPatch.parse(await readJson(request));
    const existing = await client.from("consultations").select("status,updated_at,client_phone").eq("id", id).maybeSingle();
    if (existing.error) throw consultationError(existing.error);
    if (!existing.data) throw new CmsError(404, "الطلب غير موجود.");
    const current = existing.data as { status: ConsultationStatus; client_phone: string };

    if (body.action === "add_note") {
      const note = await client.from("consultation_events").insert({ consultation_id: id, kind: "note", note: body.note });
      if (note.error) throw consultationError(note.error);
      return adminJson({ ok: true }, 201);
    }

    const origin = request.headers.get("origin") ?? new URL(request.url).origin; // validated against the allowed origins by withAdmin
    const fresh = async (change: Record<string, unknown>, expected: string) => {
      const updated = await client.from("consultations").update(change).eq("id", id).eq("updated_at", expected).select(consultationColumns).maybeSingle();
      if (updated.error) throw consultationError(updated.error);
      if (!updated.data) throw new CmsError(409, "تم تعديل هذا الطلب في جلسة أخرى. أعد فتح الطلب وحاول مرة أخرى.");
      return updated.data as unknown as AdminConsultation;
    };
    const mark = async (target: "lawyer" | "client") => { await client.rpc("log_consultation_whatsapp", { p_consultation: id, p_target: target }); };

    // Save first, then hand back a WhatsApp link built from the SAVED row. The browser opens it only after this succeeds.
    if (body.action === "assign_and_send") {
      if (!["new", "pending_confirmation"].includes(current.status)) throw new CmsError(409, "لا يمكن إرسال هذا الطلب للمحامي في حالته الحالية.");
      const [member, secret] = await Promise.all([
        client.from("cms_team").select("id,name").eq("id", body.member_id).eq("is_active", true).maybeSingle(),
        client.from("cms_team_private").select("internal_whatsapp_phone").eq("member_id", body.member_id).maybeSingle(),
      ]);
      if (member.error) throw consultationError(member.error);
      if (secret.error) throw consultationError(secret.error);
      if (!member.data) throw new CmsError(400, "اختر عضوًا نشطًا من فريق المكتب.");
      const phone = normalizeWhatsAppPhone(secret.data?.internal_whatsapp_phone);
      if (!phone) throw new CmsError(422, "لا يوجد رقم واتساب مسجل لهذا المحامي. أضف الرقم من إدارة الفريق أولًا.");
      const item = await fresh({ assigned_member_id: member.data.id, ...(current.status === "new" ? { status: "pending_confirmation" } : {}) }, body.expected_updated_at);
      const documents = await client.from("consultation_documents").select("id", { count: "exact", head: true }).eq("consultation_id", id);
      if (documents.error) throw consultationError(documents.error);
      let share: { count: number; link: string } | null = null;
      if (documents.count) {
        const token = generateShareToken();
        const issued = await client.rpc("issue_consultation_share", { p_consultation: id, p_token_hash: await hashShareToken(token), p_member: member.data.id });
        if (issued.error) throw new CmsError(503, "تم حفظ الإسناد لكن تعذّر إنشاء رابط المستندات المؤقت. اضغط «إعادة إرسال للمحامي» للمحاولة مرة أخرى.");
        share = { count: documents.count, link: `${origin}/consultation-files/${token}` };
      }
      await mark("lawyer");
      return adminJson({ item, whatsappUrl: buildWhatsAppUrl(phone, lawyerMessage({ lawyerName: member.data.name, consultation: item, documents: share })), documents: documents.count ?? 0 });
    }

    if (body.action === "confirm_and_send") {
      if (!["new", "pending_confirmation"].includes(current.status)) throw new CmsError(409, "لا يمكن تأكيد هذا الطلب في حالته الحالية.");
      // Validate the client's number BEFORE saving so a confirmation is never recorded without a way to tell the client.
      const phone = normalizeWhatsAppPhone(current.client_phone);
      if (!phone) throw new CmsError(422, "رقم هاتف العميل غير صالح لواتساب، لذلك لم يتم تأكيد الموعد. تواصل مع العميل بطريقة أخرى أو صحّح الرقم.");
      const item = await fresh({ status: "confirmed" }, body.expected_updated_at);
      await mark("client");
      return adminJson({ item, whatsappUrl: buildWhatsAppUrl(phone, clientMessage({ consultation: item })) });
    }

    if (body.action === "client_message") {
      if (current.status !== "confirmed") throw new CmsError(409, "تأكيد الموعد يُرسل للعميل بعد تأكيد الطلب فقط.");
      const phone = normalizeWhatsAppPhone(current.client_phone);
      if (!phone) throw new CmsError(422, "رقم هاتف العميل غير صالح لواتساب.");
      const main = await client.from("consultations").select(consultationColumns).eq("id", id).maybeSingle();
      if (main.error || !main.data) throw consultationError(main.error ?? { code: "unknown" });
      await mark("client");
      return adminJson({ whatsappUrl: buildWhatsAppUrl(phone, clientMessage({ consultation: main.data as unknown as AdminConsultation, updated: body.updated })) });
    }

    let change: Record<string, unknown>;
    if (body.action === "set_status") {
      assertTransition(current.status, body.status);
      change = { status: body.status };
    } else if (body.action === "reschedule") {
      if (["completed", "cancelled"].includes(current.status)) throw new CmsError(409, "لا يمكن تعديل موعد طلب مغلق.");
      const day = localDateOf(body.starts_at);
      const open = await loadAvailability(client, day, day);
      const slot = open.days[day]?.find(item => Date.parse(item.starts_at) === Date.parse(body.starts_at));
      if (!slot) throw new CmsError(409, "هذا الموعد غير متاح. اختر موعدًا آخر من المواعيد المتاحة.");
      change = { starts_at: slot.starts_at, duration_minutes: open.slotMinutes };
    } else {
      if (body.member_id) {
        const member = await client.from("cms_team").select("id").eq("id", body.member_id).eq("is_active", true).maybeSingle();
        if (member.error) throw consultationError(member.error);
        if (!member.data) throw new CmsError(400, "اختر عضوًا نشطًا من فريق المكتب.");
      }
      change = { assigned_member_id: body.member_id };
    }
    const updated = await client.from("consultations").update(change).eq("id", id).eq("updated_at", body.expected_updated_at).select(consultationColumns).maybeSingle();
    if (updated.error) throw consultationError(updated.error);
    if (!updated.data) throw new CmsError(409, "تم تعديل هذا الطلب في جلسة أخرى. أعد فتح الطلب وحاول مرة أخرى.");
    return adminJson({ item: updated.data });
  });
}
