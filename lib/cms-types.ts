export type CmsTeam = {
  id: string; slug: string; name: string; role: string; office: string; category: string;
  practice: string; bio: string; image_url: string; image_width: number; image_height: number;
  featured: boolean; is_active: boolean; sort_order: number; updated_at: string;
};
export type CmsNews = {
  id: string; slug: string; title: string; excerpt: string; content: string; category: string;
  author: string; image_url: string; image_alt: string; published_at: string | null;
  status: "draft" | "published"; updated_at: string;
};
export type PublicTeamMember = {
  slug: string; name: string; role: string; office: string; category: string; practice: string;
  bio: string; image: string; width: number; height: number; featured: boolean; sort_order: number;
};
export const compactOnlySlugs = ["mohammed-essam-qabawa", "omar-saqr"];
export function groupTeam(members: PublicTeamMember[]) {
  const qatar = members.filter(member => member.office === "قطر").sort((a,b) => Number(b.slug === compactOnlySlugs[0])-Number(a.slug === compactOnlySlugs[0]) || a.sort_order-b.sort_order);
  const featured = qatar.filter(member => member.featured && !compactOnlySlugs.includes(member.slug));
  return { qatar, featured, compact: qatar.filter(member => !featured.some(item => item.slug === member.slug)), regional: members.filter(member => member.office !== "قطر").sort((a,b) => a.sort_order-b.sort_order) };
}
export function teamImageSources(member: PublicTeamMember) {
  return member.image.startsWith("/assets/team/") && member.image.endsWith(".webp")
    ? `${member.image.replace('.webp', '.480.webp')} 480w, ${member.image} ${member.width}w` : undefined;
}
