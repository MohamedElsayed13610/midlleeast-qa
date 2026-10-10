import { NextRequest } from "next/server";
import { adminJson, withAdmin } from "@/lib/cms-auth";
import { consultationError } from "@/lib/consultation-server";

/** Which team members have an internal WhatsApp number. Returns ids only, never the numbers. */
export async function GET(request: NextRequest) {
  return withAdmin(request, async ({ client }) => {
    const result = await client.from("cms_team_private").select("member_id");
    if (result.error) throw consultationError(result.error);
    return adminJson({ ids: (result.data ?? []).map(row => row.member_id) });
  });
}
