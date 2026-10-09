import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { defaultMembers, defaultNews } from "@/lib/cms-defaults";
import type { CmsNews, CmsTeam, PublicTeamMember } from "@/lib/cms-types";

export function cmsConfigured() { return process.env.LAWFIRM_CMS_ENABLED==="true" && Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY); }
export function cmsClient(accessToken?: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("CMS connection unavailable");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}, fetch: (input,init) => fetch(input,{ ...init, cache: "no-store" }) },
  });
}
export async function getPublicMembers(): Promise<PublicTeamMember[]> {
  if (!cmsConfigured()) return defaultMembers;
  const { data, error } = await cmsClient().from("cms_team").select("*").eq("is_active",true).order("sort_order").order("name");
  if (error) { console.error("CMS team read failed",error.code); throw new Error("تعذّر تحميل فريق المكتب الآن."); }
  return (data as CmsTeam[]).map(member => ({ slug: member.slug, name: member.name, role: member.role, office: member.office, category: member.category, practice: member.practice, bio: member.bio, image: member.image_url, width: member.image_width, height: member.image_height, featured: member.featured, sort_order: member.sort_order }));
}
export async function getPublicNews(limit?:number): Promise<CmsNews[]> {
  if (!cmsConfigured()) return limit ? defaultNews.slice(0,limit) : defaultNews;
  const query=cmsClient().from("cms_news").select("*").eq("status","published").order("published_at",{ ascending:false, nullsFirst:false }).order("created_at",{ascending:false});
  const { data, error } = await (limit ? query.limit(limit) : query);
  if (error) { console.error("CMS news read failed",error.code); throw new Error("تعذّر تحميل الأخبار الآن."); }
  return data as CmsNews[];
}
export const getPublicNewsItem=cache(async (slug: string): Promise<CmsNews | null> => {
  if (!cmsConfigured()) return defaultNews.find(item => item.slug===slug) ?? null;
  const { data,error } = await cmsClient().from("cms_news").select("*").eq("slug",slug).eq("status","published").maybeSingle();
  if (error) throw new Error("تعذّر تحميل الخبر الآن.");
  return data as CmsNews | null;
});
