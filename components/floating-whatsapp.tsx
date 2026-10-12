"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "97455600352";

export default function FloatingWhatsApp() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <a
      className="floating-whatsapp"
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      title="WhatsApp"
    >
      <MessageCircle size={27} strokeWidth={2.1} aria-hidden="true" />
      <span>WhatsApp</span>
    </a>
  );
}
