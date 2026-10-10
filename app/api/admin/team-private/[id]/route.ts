import { NextRequest } from "next/server";
import { z } from "zod";
import { adminJson, CmsError, readJson, withAdmin } from "@/lib/cms-auth";
import { consultationId } from "@/lib/consultation-admin";
import { consultationError } from "@/lib/consultation-server";
import { normalizeWhatsAppPhone } from "@/lib/whatsapp";

type Params = { params: Promise<{ id: string }> };
const body = z.object({ phone: z.string().trim().max(30) });

/** Internal WhatsApp number of one team member. Admin-only; not part of cms_team and never sent to the public site. */
export async function GET(request: NextRequest, { params }: Params) {
  return withAdmin(request, async ({ client }) => {
    const id = consultationId.parse((await params).id);
    const result = await client.from("cms_team_private").select("internal_whatsapp_phone").eq("member_id", id).maybeSingle();
    if (result.error) throw consultationError(result.error);
    return adminJson({ phone: result.data?.internal_whatsapp_phone ?? null });
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  return withAdmin(request, async ({ client }) => {
    const id = consultationId.parse((await params).id);
    const { phone } = body.parse(await readJson(request));
    if (!phone) {
      const removed = await client.from("cms_team_private").delete().eq("member_id", id);
      if (removed.error) throw consultationError(removed.error);
      return adminJson({ phone: null });
    }
    const normalized = normalizeWhatsAppPhone(phone);
    if (!normalized) throw new CmsError(400, "اكتب رقم واتساب صحيحًا بالصيغة الدولية، مثال: +974 5555 1234");
    const saved = await client.from("cms_team_private").upsert({ member_id: id, internal_whatsapp_phone: normalized }, { onConflict: "member_id" }).select("internal_whatsapp_phone").single();
    if (saved.error) throw saved.error.code === "23503" ? new CmsError(404, "عضو الفريق غير موجود.") : consultationError(saved.error);
    return adminJson({ phone: saved.data.internal_whatsapp_phone });
  });
}
