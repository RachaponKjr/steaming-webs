import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteConfig = {
  name: "ไซม่อนซีฟู้ด - อาหารทะเลสด แช่แข็ง วัตถุดิบชาบู หมูกระทะ",
  shortName: "ไซม่อนซีฟู้ด",
  description:
    "อาหารทะเลสด-แช่แข็ง วัตถุดิบ ชาบู สุกี้ หม่าล่า หมูกระทะ คุณภาพพรีเมียม ส่งฟรีทั่วประเทศ มีบริการเก็บเงินปลายทาง พร้อมรับประกันสินค้าเคลมได้ทุกกรณี",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com",
  ogImage: "/images/saimon.jpg",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.shortName} | อาหารทะเลสด แช่แข็ง ชาบู หมูกระทะ ส่งฟรีทั่วประเทศ`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  keywords: [
    "ไซม่อนซีฟู้ด",
    "อาหารทะเลสด",
    "อาหารทะเลแช่แข็ง",
    "วัตถุดิบชาบู",
    "วัตถุดิบหมูกระทะ",
    "สุกี้",
    "หม่าล่า",
    "ซีฟู้ดเดลิเวอรี่",
    "เก็บเงินปลายทาง",
    "ส่งฟรีทั่วประเทศ",
    "CF อาหารทะเล",
    "ไลฟ์สดอาหารทะเล",
  ],
  authors: [{ name: siteConfig.shortName }],
  creator: siteConfig.shortName,
  publisher: siteConfig.shortName,

  // Canonical URL
  alternates: {
    canonical: "/",
  },

  // พรีวิวบน Facebook, LINE, Discord
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: siteConfig.url,
    title: `${siteConfig.shortName} | อาหารทะเลสด-แช่แข็ง วัตถุดิบชาบู หมูกระทะ`,
    description: siteConfig.description,
    siteName: siteConfig.shortName,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "ไซม่อนซีฟู้ด อาหารทะเลสด แช่แข็ง คุณภาพพรีเมียม",
      },
    ],
  },

  // พรีวิวบน X (Twitter)
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.shortName} | อาหารทะเลสด-แช่แข็ง วัตถุดิบชาบู หมูกระทะ`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },

  // ตั้งค่า Search Engine Bot
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Favicon & Icon
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
