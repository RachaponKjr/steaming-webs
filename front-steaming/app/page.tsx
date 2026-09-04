import { Metadata } from "next";
import LiveViewerEntry from "./_components/LiveViewerEntry";
import { roomService } from "@/services/room.service";

export async function generateMetadata(): Promise<Metadata> {
  const defaultTitle =
    "ไซม่อนซีฟู้ด | ถ่ายทอดสด อาหารทะเลสด-แช่แข็ง คุณภาพพรีเมียม";
  const defaultDesc =
    "ชมไลฟ์สดสั่งซื้ออาหารทะเลสด-แช่แข็ง วัตถุดิบชาบู สุกี้ หม่าล่า หมูกระทะ ส่งฟรีทั่วประเทศ เก็บเงินปลายทาง รับประกันทุกกรณี";
  const defaultImage = "/images/saimon.jpg";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const room = await roomService.getTodayRoom();

    const title = room?.ogTitle || room?.title || defaultTitle;
    const description = room?.ogDescription || defaultDesc;
    const ogImage = room?.ogImage || room?.ogThumbnail || defaultImage;
    const tags = room?.ogTags && room.ogTags.length > 0 ? room.ogTags : [];

    return {
      metadataBase: new URL(siteUrl),
      title,
      description,
      keywords: [
        ...tags,
        "ไซม่อนซีฟู้ด",
        "ไลฟ์สด",
        "อาหารทะเลสด",
        "อาหารทะเลแช่แข็ง",
        "ชาบู",
        "หมูกระทะ",
        "ส่งฟรีทั่วประเทศ",
      ],
      openGraph: {
        type: "website",
        locale: "th_TH",
        url: siteUrl,
        title,
        description,
        siteName: "ไซม่อนซีฟู้ด",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
      icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
      },
    };
  } catch (error) {
    return {
      metadataBase: new URL(siteUrl),
      title: defaultTitle,
      description: defaultDesc,
      openGraph: {
        images: [defaultImage],
      },
    };
  }
}

const page = () => {
  return <LiveViewerEntry />;
};

export default page;
