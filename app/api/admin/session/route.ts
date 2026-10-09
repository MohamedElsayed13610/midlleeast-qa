import { NextRequest } from "next/server";
import { adminJson, withAdmin } from "@/lib/cms-auth";
export async function GET(request:NextRequest) { return withAdmin(request,async ({user})=>adminJson({email:user.email})); }
