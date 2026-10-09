import { NextRequest } from "next/server";
import { cmsErrorResponse, readJson, requireSameOrigin } from "@/lib/cms-auth";
import { cmsClient } from "@/lib/cms-server";
import { bookingRequestSchema, cleanText, documentRules } from "@/lib/consultation";
import type { BookingResponse, DocumentUpload } from "@/lib/consultation";
import { clientFingerprint, consultationError, publicJson, requireConfigured } from "@/lib/consultation-server";

const bucket = "consultation-documents";

/** Public booking endpoint. Creates the request atomically in the database; the database re-checks the slot, limits and shapes. */
export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    requireConfigured();
    const raw = await readJson(request);
    if (raw && typeof raw === "object" && typeof (raw as { website?: unknown }).website === "string" && (raw as { website: string }).website.trim()) {
      return publicJson({ error: "تعذّر إرسال الطلب." }, 400); // honeypot: real visitors never fill this field
    }
    const input = bookingRequestSchema.parse(raw && typeof raw === "object" ? Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, typeof value === "string" ? cleanText(value) : value])) : raw);
    if (Date.parse(input.starts_at) <= Date.now()) return publicJson({ error: "لا يمكن حجز موعد في الماضي." }, 400);

    const client = cmsClient();
    const created = await client.rpc("create_consultation", {
      p_service_slug: input.service_slug, p_method: input.consultation_method, p_name: input.client_name, p_phone: input.client_phone, p_email: input.client_email,
      p_company: input.client_company || null, p_language: input.preferred_language, p_subject: input.subject, p_description: input.description,
      p_starts_at: input.starts_at, p_ip_hash: await clientFingerprint(request),
    });
    if (created.error) throw consultationError(created.error, "تعذّر إرسال الطلب. بياناتك محفوظة في النموذج، حاول مرة أخرى.");
    const row = (created.data as { out_id: string; out_reference: string; out_starts_at: string; out_ends_at: string }[] | null)?.[0];
    if (!row) throw consultationError({ code: "unknown" });

    // Files are uploaded by the browser straight to private storage (Vercel limits request bodies to ~4.5 MB).
    // Each upload slot is registered here, bound to this request id, so nothing can be attached to other requests.
    const uploads: DocumentUpload[] = [];
    let documentsRejected = 0;
    for (const [index, document] of input.documents.slice(0, documentRules.maxFiles).entries()) {
      const path = `${row.out_id}/${crypto.randomUUID()}.${documentRules.types[document.type]}`;
      const attached = await client.rpc("attach_consultation_document", { p_consultation: row.out_id, p_path: path, p_name: document.name.slice(0, 200), p_mime: document.type, p_size: document.size });
      const signed = attached.error ? null : await client.storage.from(bucket).createSignedUploadUrl(path);
      if (!signed?.data) { documentsRejected += 1; continue; }
      uploads.push({ index, name: document.name, path, signedUrl: signed.data.signedUrl, type: document.type });
    }
    const body: BookingResponse = { reference: row.out_reference, starts_at: row.out_starts_at, ends_at: row.out_ends_at, method: input.consultation_method, uploads, documentsRejected };
    return publicJson(body, 201);
  } catch (error) { return cmsErrorResponse(error); }
}
