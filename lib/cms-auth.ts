import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cmsClient, cmsConfigured } from "@/lib/cms-server";

export class CmsError extends Error { constructor(public status: number,message: string) { super(message); } }
const cookieName = "me_admin_session";
const sessionSchema = z.object({ access_token:z.string().min(20).max(3500), refresh_token:z.string().min(10).max(500), expires_at:z.number() });
export type AdminSession = z.infer<typeof sessionSchema>;
export type AdminContext = { client: ReturnType<typeof cmsClient>; user: { id:string; email?:string }; session:AdminSession };
export const adminJson = (data: unknown,status=200) => NextResponse.json(data,{status,headers:{"Cache-Control":"no-store, private","Vary":"Cookie","X-Robots-Tag":"noindex, nofollow"}});
export function setAdminSession(response: NextResponse,session: AdminSession | null) {
  response.cookies.set(cookieName,session ? JSON.stringify(session) : "",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/api/admin",maxAge:session ? 60*60*24*30 : 0});
  return response;
}
export function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowed = new Set([new URL(request.url).origin,...(process.env.ADMIN_ALLOWED_ORIGINS || "").split(",").map(value=>value.trim()).filter(Boolean)]);
  if (!origin || !allowed.has(origin)) throw new CmsError(403,"الطلب غير مسموح من هذا المصدر.");
}
export async function readJson(request: NextRequest) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new CmsError(415,"نوع الطلب غير صحيح.");
  const maximum=200000;
  if (Number(request.headers.get("content-length") || 0)>maximum) throw new CmsError(413,"المحتوى أكبر من الحجم المسموح.");
  const reader=request.body?.getReader(); if(!reader) throw new CmsError(400,"بيانات الطلب غير موجودة.");
  const decoder=new TextDecoder(); let text="",total=0;
  while(true) { const result=await reader.read(); if(result.done) break;total+=result.value.length;if(total>maximum) {await reader.cancel();throw new CmsError(413,"المحتوى أكبر من الحجم المسموح.");}text+=decoder.decode(result.value,{stream:true}); }
  text+=decoder.decode();
  try { return JSON.parse(text); } catch { throw new CmsError(400,"بيانات الطلب غير صحيحة."); }
}
export function cmsErrorResponse(error: unknown) {
  if (error instanceof CmsError) return adminJson({error:error.message},error.status);
  if (error instanceof z.ZodError) return adminJson({error:error.issues[0]?.message || "راجع البيانات المدخلة."},400);
  console.error("CMS operation failed",error instanceof Error ? error.name : "unknown");
  return adminJson({error:"تعذّر إتمام العملية. بياناتك محفوظة في النموذج، حاول مرة أخرى."},503);
}
export async function authenticateAdmin(request: NextRequest): Promise<AdminContext> {
  if (!cmsConfigured()) throw new CmsError(503,"لوحة التحكم في انتظار تفعيل الاتصال بقاعدة البيانات.");
  let session: AdminSession;
  try { session=sessionSchema.parse(JSON.parse(request.cookies.get(cookieName)?.value || "null")); } catch { throw new CmsError(401,"سجّل الدخول للمتابعة."); }
  if (session.expires_at<=Date.now()/1000+60) {
    const {data,error}=await cmsClient().auth.refreshSession({refresh_token:session.refresh_token});
    if (error || !data.session) throw new CmsError(401,"انتهت الجلسة. سجّل الدخول مرة أخرى.");
    session={access_token:data.session.access_token,refresh_token:data.session.refresh_token,expires_at:data.session.expires_at!};
  }
  const client=cmsClient(session.access_token);
  const {data,error}=await client.auth.getUser(session.access_token);
  if (error || !data.user) throw new CmsError(401,"انتهت الجلسة. سجّل الدخول مرة أخرى.");
  const membership=await client.from("cms_admins").select("user_id").eq("user_id",data.user.id).eq("enabled",true).maybeSingle();
  if (membership.error) throw new CmsError(503,"تعذّر التحقق من صلاحية الحساب الآن.");
  if (!membership.data) throw new CmsError(403,"هذا الحساب لا يملك صلاحية إدارة الموقع.");
  return {client,user:data.user,session};
}
export async function withAdmin(request: NextRequest,action: (context: AdminContext)=>Promise<NextResponse>) {
  let context: AdminContext | undefined;
  try {
    if (request.method!=="GET") requireSameOrigin(request);
    context=await authenticateAdmin(request);
    return setAdminSession(await action(context),context.session);
  } catch (error) {
    const response=cmsErrorResponse(error);
    return error instanceof CmsError && [401,403].includes(error.status) ? setAdminSession(response,null) : context ? setAdminSession(response,context.session) : response;
  }
}
