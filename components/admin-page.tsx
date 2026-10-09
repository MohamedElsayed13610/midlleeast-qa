import AdminDashboard from "@/components/admin-dashboard";
import "@/app/admin/admin.css";
import { cmsConfigured } from "@/lib/cms-server";
import { defaultMembers, defaultNews } from "@/lib/cms-defaults";
import type { CmsTeam } from "@/lib/cms-types";

/** Shared by /admin and /admin/consultations so both routes render the same dashboard shell. */
export default function AdminPageContent({initialView="content"}:{initialView?:"content"|"consultations"}) {
  const configured=cmsConfigured();
  const previewTeam:CmsTeam[]=configured ? [] : defaultMembers.map(member=>({id:member.slug,slug:member.slug,name:member.name,role:member.role,office:member.office,category:member.category,practice:member.practice,bio:member.bio,image_url:member.image,image_width:member.width,image_height:member.height,featured:member.featured,sort_order:member.sort_order,is_active:true,updated_at:""}));
  return <AdminDashboard configured={configured} previewTeam={previewTeam} previewNews={configured ? [] : defaultNews} initialView={initialView}/>;
}
