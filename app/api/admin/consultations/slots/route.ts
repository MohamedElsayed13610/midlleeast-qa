import { NextRequest } from "next/server";
import { adminJson, withAdmin } from "@/lib/cms-auth";
import { loadAvailability } from "@/lib/consultation-server";

/** Open slots for the admin reschedule picker (same rules the public booking uses). */
export async function GET(request: NextRequest) {
  return withAdmin(request, async ({ client }) => {
    const { searchParams } = new URL(request.url);
    return adminJson(await loadAvailability(client, searchParams.get("from"), searchParams.get("to")));
  });
}
