import { z } from "zod";
import { compactOnlySlugs } from "@/lib/cms-types";

export const newsInput = z.object({
  slug: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{1,99}$/,"رابط الخبر يحتاج حروفًا إنجليزية وأرقامًا وشرطات."),
  title: z.string().trim().min(5,"اكتب عنوانًا واضحًا للخبر.").max(200),
  excerpt: z.string().trim().min(15,"اكتب ملخصًا للخبر.").max(500),
  content: z.string().trim().min(30,"أضف محتوى الخبر.").max(50000),
  category: z.string().trim().min(2).max(80), author: z.string().trim().max(150),
  image_url: z.string().max(1500), image_alt: z.string().trim().max(200),
  published_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(), status: z.enum(["draft","published"]),
}).superRefine((value,ctx) => {
  if (value.image_url && !value.image_alt) ctx.addIssue({code:"custom",path:["image_alt"],message:"اكتب وصفًا للصورة."});
  if (value.published_at) {
    const date = new Date(value.published_at);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10)!==value.published_at) ctx.addIssue({code:"custom",path:["published_at"],message:"تاريخ الخبر غير صحيح."});
  }
});
export const teamInput = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{1,99}$/), name: z.string().trim().min(3,"اكتب اسم العضو.").max(150),
  role: z.string().trim().min(2).max(200), office: z.enum(["قطر","الإمارات","لبنان","مصر","إقليمي"]),
  category: z.string().trim().min(2).max(150), practice: z.string().trim().max(250),
  bio: z.string().trim().min(15,"اكتب نبذة وخبرات العضو.").max(6000), image_url: z.string().min(1,"ارفع صورة العضو.").max(1500),
  image_width: z.number().int().min(1).max(8000), image_height: z.number().int().min(1).max(8000),
  featured: z.boolean(), is_active: z.boolean(), sort_order: z.number().int().min(0).max(10000),
}).superRefine((value,ctx) => {
  if (value.featured && compactOnlySlugs.includes(value.slug)) ctx.addIssue({code:"custom",path:["featured"],message:"هذا العضو يظهر ضمن الكروت الصغيرة حسب ترتيب الفريق المتفق عليه."});
  if(value.featured && value.office!=="قطر") ctx.addIssue({code:"custom",path:["featured"],message:"كروت الإدارة لفريق قطر."});
});
export function validCmsImage(value: string) {
  if (!value) return true;
  if (/^\/assets\/[a-zA-Z0-9/_-]+(?:\.480)?\.(?:webp|png|jpe?g)$/.test(value)) return true;
  try {
    const url = new URL(value); const base = new URL(process.env.SUPABASE_URL || "https://unconfigured.invalid");
    return url.protocol==="https:" && url.origin===base.origin && /^\/storage\/v1\/object\/public\/law-cms\/[a-f0-9-]+\/[a-f0-9-]+\.(png|jpg|webp)$/.test(url.pathname) && !url.search && !url.hash;
  } catch { return false; }
}
export function imageKind(bytes: Uint8Array): "png" | "jpg" | "webp" | null {
  if (bytes.length>=8 && [137,80,78,71,13,10,26,10].every((value,index)=>bytes[index]===value)) return "png";
  if (bytes.length>=3 && bytes[0]===255 && bytes[1]===216 && bytes[2]===255) return "jpg";
  const text = new TextDecoder();
  if (bytes.length>=12 && text.decode(bytes.slice(0,4))==="RIFF" && text.decode(bytes.slice(8,12))==="WEBP") return "webp";
  return null;
}
