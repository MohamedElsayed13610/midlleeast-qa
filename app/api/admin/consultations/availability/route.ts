import { NextRequest } from "next/server";
import { adminJson, CmsError, readJson, withAdmin } from "@/lib/cms-auth";
import { settingsInput } from "@/lib/consultation-admin";
import { consultationError } from "@/lib/consultation-server";

const columns = "working_days,start_time,end_time,slot_minutes,min_notice_hours,max_advance_days,updated_at";

export async function GET(request: NextRequest) {
  return withAdmin(request, async ({ client }) => {
    const [settings, blocked] = await Promise.all([
      client.from("consultation_settings").select(columns).maybeSingle(),
      client.from("consultation_blocked_dates").select("id,blocked_on,reason").order("blocked_on").limit(400),
    ]);
    if (settings.error) throw consultationError(settings.error);
    if (blocked.error) throw consultationError(blocked.error);
    if (!settings.data) throw new CmsError(503, "إعدادات المواعيد غير مهيأة. طبّق ملف الترحيل أولًا.");
    return adminJson({ settings: settings.data, blocked: blocked.data });
  });
}

export async function PUT(request: NextRequest) {
  return withAdmin(request, async ({ client }) => {
    const { expected_updated_at, ...values } = settingsInput.parse(await readJson(request));
    const result = await client.from("consultation_settings").update(values).eq("id", true).eq("updated_at", expected_updated_at).select(columns).maybeSingle();
    if (result.error) throw consultationError(result.error);
    if (!result.data) throw new CmsError(409, "تم تعديل الإعدادات في جلسة أخرى. حدّث الصفحة وحاول مرة أخرى.");
    return adminJson({ settings: result.data });
  });
}
