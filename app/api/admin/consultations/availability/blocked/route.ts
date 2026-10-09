import { NextRequest } from "next/server";
import { z } from "zod";
import { adminJson, CmsError, readJson, withAdmin } from "@/lib/cms-auth";
import { blockedInput, consultationId } from "@/lib/consultation-admin";
import { consultationError } from "@/lib/consultation-server";

export async function POST(request: NextRequest) {
  return withAdmin(request, async ({ client }) => {
    const value = blockedInput.parse(await readJson(request));
    const result = await client.from("consultation_blocked_dates").insert(value).select("id,blocked_on,reason").single();
    if (result.error) throw result.error.code === "23505" ? new CmsError(409, "هذا التاريخ محجوب بالفعل.") : consultationError(result.error);
    return adminJson({ item: result.data }, 201);
  });
}

export async function DELETE(request: NextRequest) {
  return withAdmin(request, async ({ client }) => {
    const { id } = z.object({ id: consultationId }).parse(await readJson(request));
    const result = await client.from("consultation_blocked_dates").delete().eq("id", id).select("id").maybeSingle();
    if (result.error) throw consultationError(result.error);
    if (!result.data) throw new CmsError(404, "التاريخ غير موجود.");
    return adminJson({ ok: true });
  });
}
