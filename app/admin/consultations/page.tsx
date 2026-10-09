import AdminPageContent from "@/components/admin-page";
export const dynamic="force-dynamic";
export const metadata={title:"إدارة الاستشارات",robots:{index:false,follow:false}};
export default function AdminConsultationsPage() { return <AdminPageContent initialView="consultations"/>; }
