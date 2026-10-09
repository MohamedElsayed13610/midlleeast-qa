import { NextRequest } from "next/server";
import { adminJson, authenticateAdmin, cmsErrorResponse, requireSameOrigin, setAdminSession } from "@/lib/cms-auth";

export async function POST(request:NextRequest) {
  try {
    requireSameOrigin(request);
    try {
      const context=await authenticateAdmin(request);
      await context.client.auth.setSession(context.session);
      await context.client.auth.signOut({scope:"local"});
    } catch { /* Clear an expired session too. */ }
    return setAdminSession(adminJson({ok:true}),null);
  } catch(error) { return cmsErrorResponse(error); }
}
