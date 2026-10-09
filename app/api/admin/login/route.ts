import { NextRequest } from "next/server";
import { z } from "zod";
import { adminJson, CmsError, cmsErrorResponse, readJson, requireSameOrigin, setAdminSession } from "@/lib/cms-auth";
import { cmsClient, cmsConfigured } from "@/lib/cms-server";

export async function POST(request:NextRequest) {
  try {
    requireSameOrigin(request);
    if (!cmsConfigured()) throw new CmsError(503,"لوحة التحكم في انتظار تفعيل الاتصال بقاعدة البيانات.");
    const {email,password}=z.object({email:z.string().trim().email().max(254),password:z.string().min(1).max(200)}).parse(await readJson(request));
    const client=cmsClient();
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if (error || !data.session || !data.user) throw new CmsError(error?.status===429 ? 429 : 401,error?.status===429 ? "محاولات كثيرة. انتظر قليلًا وحاول مرة أخرى." : "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    const membership=await client.from("cms_admins").select("user_id").eq("user_id",data.user.id).eq("enabled",true).maybeSingle();
    if (membership.error || !membership.data) {
      await client.auth.signOut({scope:"local"});
      throw new CmsError(membership.error ? 503 : 403,membership.error ? "تعذّر التحقق من صلاحية الحساب الآن." : "هذا الحساب لا يملك صلاحية إدارة الموقع.");
    }
    return setAdminSession(adminJson({email:data.user.email}),{access_token:data.session.access_token,refresh_token:data.session.refresh_token,expires_at:data.session.expires_at!});
  } catch(error) { return cmsErrorResponse(error); }
}
