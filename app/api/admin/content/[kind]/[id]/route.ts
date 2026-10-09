import { NextRequest } from "next/server";
import { adminJson, CmsError, readJson, withAdmin } from "@/lib/cms-auth";
import { contentInput, contentTable, databaseError, recordId, revision } from "@/lib/cms-content";
type Params={params:Promise<{kind:string;id:string}>};
export async function PATCH(request:NextRequest,{params}:Params) {
  return withAdmin(request,async ({client})=>{
    const {kind,id}=await params; recordId.parse(id);
    const body=await readJson(request); const {expected_updated_at}=revision.parse(body); const data=contentInput(kind,body);
    const table=contentTable(kind);
    const existing=await client.from(table).select("slug").eq("id",id).maybeSingle();
    if (existing.error) throw databaseError(existing.error.code);
    if (!existing.data) throw new CmsError(404,"المحتوى غير موجود.");
    if (existing.data.slug!==data.slug) throw new CmsError(400,"رابط المحتوى ثابت بعد إنشائه للحفاظ على الروابط المنشورة.");
    const result=await client.from(table).update(data).eq("id",id).eq("updated_at",expected_updated_at).select().maybeSingle();
    if (result.error) throw databaseError(result.error.code);
    if (!result.data) throw new CmsError(409,"تم تعديل المحتوى في جلسة أخرى. أغلق النموذج وأعد تحميل القائمة قبل التعديل.");
    return adminJson({item:result.data});
  });
}
export async function DELETE(request:NextRequest,{params}:Params) {
  return withAdmin(request,async ({client})=>{
    const {kind,id}=await params; recordId.parse(id); const {expected_updated_at}=revision.parse(await readJson(request));
    const result=await client.from(contentTable(kind)).delete().eq("id",id).eq("updated_at",expected_updated_at).select("id").maybeSingle();
    if (result.error) throw databaseError(result.error.code);
    if (!result.data) throw new CmsError(409,"المحتوى تغير أو تم حذفه. أعد تحميل القائمة.");
    return adminJson({ok:true});
  });
}
