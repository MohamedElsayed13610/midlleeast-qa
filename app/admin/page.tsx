import Link from "next/link";
import AdminPageContent from "@/components/admin-page";

export const dynamic="force-dynamic";
export const metadata={title:"إدارة الموقع",robots:{index:false,follow:false}};

export default function AdminPage() {
  return <>
    <Link
      href="/admin/partners"
      aria-label="إدارة الشركاء الإقليميين والدوليين"
      style={{
        position:"fixed",
        left:24,
        bottom:24,
        zIndex:120,
        padding:"12px 18px",
        borderRadius:10,
        background:"#c2a066",
        color:"#03261e",
        fontWeight:700,
        boxShadow:"0 14px 34px rgba(0,0,0,.18)",
      }}
    >
      إدارة الشركاء
    </Link>
    <AdminPageContent/>
  </>;
}
