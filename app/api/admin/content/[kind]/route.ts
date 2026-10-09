import { NextRequest } from "next/server";
import { adminJson, withAdmin } from "@/lib/cms-auth";
import { readJson } from "@/lib/cms-auth";
import { contentInput, contentTable, databaseError } from "@/lib/cms-content";
type Params={params:Promise<{kind:string}>};
export async function GET(request:NextRequest,{params}:Params) {
  return withAdmin(request,async ({client})=>{
    const {kind}=await params;
    const result=await client.from(contentTable(kind)).select("*").order(kind==="team" ? "sort_order" : "created_at",{ascending:kind==="team"}).limit(500);
    if (result.error) throw databaseError(result.error.code);
    return adminJson({items:result.data});
  });
}
export async function POST(request:NextRequest,{params}:Params) {
  return withAdmin(request,async ({client})=>{
    const {kind}=await params; const data=contentInput(kind,await readJson(request));
    const result=await client.from(contentTable(kind)).insert(data).select().single();
    if (result.error) throw databaseError(result.error.code);
    return adminJson({item:result.data},201);
  });
}
