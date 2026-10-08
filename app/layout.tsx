import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "الشرق الأوسط وشركاؤه | للمحاماة والاستشارات القانونية",
  description: "حلول قانونية متخصصة في قطر والمنطقة، تجمع بين المعرفة العميقة والرؤية العملية.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
