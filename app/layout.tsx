import type { Metadata } from "next";
import { brandName, firmDescription, isPreview, siteUrl } from "@/lib/seo";
import FloatingWhatsApp from "@/components/floating-whatsapp";
import "./globals.css";
import "./practice.css";
import "./home-sections.css";
import "./news-image-fix.css";
import "./mobile-fixes.css";
import "./partners-responsive.css";
import "./performance.css";
import "./english-hero-fix.css";
import "./hero-brandline.css";
import "./whatsapp.css";
import "./remove-legacy-monogram.css";

const officeFavicon = "/favicon-green.svg?v=green-logo-20261029";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${brandName} | مكتب محاماة في قطر`, template: `%s | ${brandName}` },
  description: firmDescription,
  applicationName: brandName,
  creator: brandName,
  publisher: brandName,
  robots: { index: !isPreview, follow: true, googleBot: { index: !isPreview, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  icons: {
    icon: [{ url: officeFavicon, type: "image/svg+xml", sizes: "any" }],
    shortcut: officeFavicon,
    apple: officeFavicon,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href={officeFavicon} type="image/svg+xml" sizes="any" />
        <link rel="shortcut icon" href={officeFavicon} type="image/svg+xml" />
        <link rel="apple-touch-icon" href={officeFavicon} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}<FloatingWhatsApp /><noscript><style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style></noscript></body>
    </html>
  );
}
