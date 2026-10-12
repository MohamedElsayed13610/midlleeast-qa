import type { Metadata } from "next";
import { firmLegalName, firmDescription, isPreview, siteUrl } from "@/lib/seo";
import "./globals.css";
import "./practice.css";
import "./mobile-fixes.css";
import "./performance.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `مكتب محاماة في قطر | ${firmLegalName}`, template: `%s | ${firmLegalName}` },
  description: firmDescription,
  applicationName: firmLegalName,
  robots: { index: !isPreview, follow: true, googleBot: { index: !isPreview, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /></head>
      <body>{children}<noscript><style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style></noscript></body>
    </html>
  );
}
