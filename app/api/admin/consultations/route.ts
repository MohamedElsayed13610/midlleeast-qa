import { NextRequest } from "next/server";
import { adminJson, withAdmin } from "@/lib/cms-auth";
import { consultationColumns } from "@/lib/consultation-admin";
import { consultationError } from "@/lib/consultation-server";

export async function GET(request: NextRequest) {
  return withAdmin(request, async ({ client }) => {
    const result = await client.from("consultations").select(consultationColumns).order("created_at", { ascending: false }).limit(500);
    if (result.error) throw consultationError(result.error);
    return adminJson({ items: result.data });
  });
}
