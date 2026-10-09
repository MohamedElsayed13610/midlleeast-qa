import { NextRequest } from "next/server";
import { cmsErrorResponse } from "@/lib/cms-auth";
import { cmsClient } from "@/lib/cms-server";
import { loadAvailability, publicJson, requireConfigured } from "@/lib/consultation-server";

export async function GET(request: NextRequest) {
  try {
    requireConfigured();
    const { searchParams } = new URL(request.url);
    return publicJson(await loadAvailability(cmsClient(), searchParams.get("from"), searchParams.get("to")));
  } catch (error) { return cmsErrorResponse(error); }
}
