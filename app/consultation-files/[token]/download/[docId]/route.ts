import { NextRequest, NextResponse } from "next/server";
import { cmsClient } from "@/lib/cms-server";
import { sniffDocument } from "@/lib/consultation";
import { resolveShare } from "@/lib/consultation-share";

type Params = { params: Promise<{ token: string; docId: string }> };
const neutral = () => new NextResponse("هذا الرابط غير صالح أو انتهت صلاحيته.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });

/**
 * Streams one file of one consultation to whoever holds a valid temporary link.
 * The database re-validates the link (hash, expiry, revocation, file ownership) inside the storage policy itself,
 * so no service-role key is involved and the bucket stays private.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const { token, docId } = await params;
  const share = await resolveShare(token);
  const doc = share?.documents.find(item => item.id === docId);
  if (!share || !doc) return neutral();
  const file = await cmsClient(undefined, { "x-share-hash": share.hash }).storage.from("consultation-documents").download(doc.path);
  if (file.error || !file.data) return neutral();
  const bytes = new Uint8Array(await file.data.arrayBuffer());
  if (sniffDocument(bytes) !== doc.type) return neutral();
  return new NextResponse(bytes, { headers: {
    "Content-Type": doc.type, "Content-Length": String(bytes.length), "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(doc.name.replace(/[\r\n"]/g, "_"))}`,
    "Cache-Control": "no-store, private", "X-Robots-Tag": "noindex, nofollow", "Content-Security-Policy": "default-src 'none'; sandbox",
  } });
}
