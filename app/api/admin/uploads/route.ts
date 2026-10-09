import { NextRequest } from "next/server";
import { adminJson, CmsError, withAdmin } from "@/lib/cms-auth";
import { imageInfo } from "@/lib/cms-images";

export async function POST(request:NextRequest) {
  return withAdmin(request,async ({client,user})=>{
    const maximum=3*1024*1024;
    if(!request.headers.get("content-type")?.startsWith("multipart/form-data")) throw new CmsError(415,"ارفع ملف صورة.");
    if(Number(request.headers.get("content-length")||0)>maximum+65536) throw new CmsError(413,"حجم الصورة يجب أن يكون أقل من 3 ميجابايت.");
    // Bound streamed requests too, before the multipart parser allocates their body.
    const reader=request.body?.getReader(); if(!reader) throw new CmsError(400,"ملف الصورة غير موجود.");
    const chunks:Uint8Array[]=[]; let total=0;
    while(true) { const result=await reader.read(); if(result.done) break; total+=result.value.length; if(total>maximum+65536) { await reader.cancel(); throw new CmsError(413,"حجم الصورة يجب أن يكون أقل من 3 ميجابايت."); } chunks.push(result.value); }
    const bytes=new Uint8Array(total); let offset=0; for(const chunk of chunks) {bytes.set(chunk,offset);offset+=chunk.length;}
    const form=await new Response(bytes,{headers:{"content-type":request.headers.get("content-type")!}}).formData();
    const file=form.get("file"); if(!(file instanceof File) || !file.size || file.size>maximum) throw new CmsError(400,"اختر صورة صالحة أقل من 3 ميجابايت.");
    const image=new Uint8Array(await file.arrayBuffer()); const info=imageInfo(image);
    const mime=info?.kind==="jpg" ? "image/jpeg" : `image/${info?.kind}`;
    if(!info || file.type!==mime) throw new CmsError(400,"الصورة غير صالحة. الصيغ المسموحة: PNG أو JPG أو WebP، حتى 24 مليون بكسل.");
    const path=`${user.id}/${crypto.randomUUID()}.${info.kind}`;
    const result=await client.storage.from("law-cms").upload(path,image,{contentType:mime,upsert:false,cacheControl:"31536000"});
    if(result.error) throw new CmsError(503,"تعذّر رفع الصورة. حاول مرة أخرى.");
    return adminJson({url:client.storage.from("law-cms").getPublicUrl(path).data.publicUrl,width:info.width,height:info.height},201);
  });
}
