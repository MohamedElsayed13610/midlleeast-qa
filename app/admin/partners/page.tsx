import AdminPartners from "@/components/admin-partners";
import "@/app/admin/admin.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة الشركاء", robots: { index: false, follow: false } };

export default function AdminPartnersPage() {
  return <AdminPartners />;
}
