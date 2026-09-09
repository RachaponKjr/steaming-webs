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
  name: "ประมูลลูกไก่ เริ่มต้น10บ.",
  shortName: "ซุ้ม นักรบหลังกำแพง",
  description: "ประมูลลูกไก่ เริ่มต้น10บ.",
  url: "https://zimonds.com",
  ogImage: "https://zimonds.com/images/saimon.png",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.shortName} | ซุ้ม นักรบหลังกำแพง`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  keywords: [
    "ประมูลลูกไก่",
    "ลูกไก่ชน",
    "ซุ้มนักรบหลังกำแพง",
    "ประมูลไก่ชน",
    "ลูกไก่ราคาถูก",
    "ซุ้มไก่ชน",
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
        alt: "ร่วมประมูลลูกไก่สายพันธุ์ดีเริ่มต้นเพียง 10 บาท จากซุ้มนักรบหลังกำแพง อัปเดตราคาล่าสุดและร่วมสนุกประมูลลูกไก่ชนคุณภาพได้ที่นี่",
      },
    ],
  },

  // พรีวิวบน X (Twitter)
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.shortName} | ประมูลลูกไก่ เริ่มต้น10บ.`,
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
