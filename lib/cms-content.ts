import { z } from "zod";
import { CmsError } from "@/lib/cms-auth";
import { newsInput, teamInput, validCmsImage } from "@/lib/cms-validation";

export function contentTable(kind:string) {
  if (kind!=="news" && kind!=="team") throw new CmsError(404,"القسم غير موجود.");
  return kind==="news" ? "cms_news" : "cms_team";
}
export function contentInput(kind:string,value:unknown):Record<string,string|number|boolean|null> {
  contentTable(kind);
  const data=kind==="news" ? newsInput.parse(value) : teamInput.parse(value);
  if (!validCmsImage(data.image_url)) throw new CmsError(400,"ارفع الصورة من لوحة التحكم.");
  return data;
}
export const recordId=z.string().uuid("معرّف المحتوى غير صحيح.");
export const revision=z.object({expected_updated_at:z.string().datetime({offset:true})});
export function databaseError(code:string) {
  if (code==="23505") return new CmsError(409,"الرابط مستخدم بالفعل. اختر رابطًا آخر.");
  if (["42501","PGRST301"].includes(code)) return new CmsError(403,"ليس لديك صلاحية تنفيذ هذا التعديل.");
  return new CmsError(503,"تعذّر حفظ المحتوى الآن. حاول مرة أخرى.");
}
