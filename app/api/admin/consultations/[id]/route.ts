import { NextRequest } from "next/server";
import { adminJson, CmsError, readJson, withAdmin } from "@/lib/cms-auth";
import { assertTransition, consultationColumns, consultationId, consultationPatch } from "@/lib/consultation-admin";
import { consultationError, loadAvailability } from "@/lib/consultation-server";
import { localDateOf } from "@/lib/consultation";
import type { ConsultationStatus } from "@/lib/consultation";

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
    const existing = await client.from("consultations").select("status,updated_at").eq("id", id).maybeSingle();
    if (existing.error) throw consultationError(existing.error);
    if (!existing.data) throw new CmsError(404, "الطلب غير موجود.");
    const current = existing.data as { status: ConsultationStatus };

    if (body.action === "add_note") {
      const note = await client.from("consultation_events").insert({ consultation_id: id, kind: "note", note: body.note });
      if (note.error) throw consultationError(note.error);
      return adminJson({ ok: true }, 201);
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
