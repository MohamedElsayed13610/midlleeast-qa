import { NextRequest, NextResponse } from "next/server";
import { CmsError, withAdmin } from "@/lib/cms-auth";
import { sniffDocument } from "@/lib/consultation";
import { consultationId } from "@/lib/consultation-admin";
import { consultationError } from "@/lib/consultation-server";

type Params = { params: Promise<{ id: string; docId: string }> };

/** Private documents are only ever served here, to an authenticated active admin, as a download. */
export async function GET(request: NextRequest, { params }: Params) {
  return withAdmin(request, async ({ client }) => {
    const { id, docId } = await params;
    const doc = await client.from("consultation_documents").select("storage_path,original_name,mime_type").eq("consultation_id", consultationId.parse(id)).eq("id", consultationId.parse(docId)).maybeSingle();
    if (doc.error) throw consultationError(doc.error);
    if (!doc.data) throw new CmsError(404, "المستند غير موجود.");
    const file = await client.storage.from("consultation-documents").download(doc.data.storage_path);
    if (file.error || !file.data) throw new CmsError(404, "لم يكتمل رفع هذا المستند من العميل.");
    const bytes = new Uint8Array(await file.data.arrayBuffer());
    if (sniffDocument(bytes) !== doc.data.mime_type) throw new CmsError(422, "محتوى الملف لا يطابق صيغته المعلنة، لذلك تم حجبه.");
    const safeName = doc.data.original_name.replace(/[\r\n"]/g, "_");
    return new NextResponse(bytes, { headers: {
      "Content-Type": doc.data.mime_type, "Content-Length": String(bytes.length), "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(safeName)}`, "Cache-Control": "no-store, private", "X-Robots-Tag": "noindex, nofollow",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    } });
  });
}
