import { Metadata } from "next";
import LiveViewerEntry from "./_components/LiveViewerEntry";
import { roomService } from "@/services/room.service";

const defaultTitle = "ประมูลลูกไก่ เริ่มต้น10บ. ซุ้ม นักรบหลังกำแพง";
const defaultDesc =
  "ร่วมประมูลลูกไก่สายพันธุ์ดีเริ่มต้นเพียง 10 บาท จากซุ้มนักรบหลังกำแพง อัปเดตราคาล่าสุดและร่วมสนุกประมูลลูกไก่ชนคุณภาพได้ที่นี่";
const defaultImage = "/images/saimon.png";
const siteUrl = "https://api.zimonds.com";

// 1. ทำให้ generateMetadata มีความปลอดภัยมากขึ้น ป้องกันหน้าพังถ้า API ล่ม
export async function generateMetadata(): Promise<Metadata> {
  try {
    // กำหนดเวลา Timeout หรือดึงข้อมูลแบบปลอดภัย
    const room = await roomService.getTodayRoom().catch(() => null);

    if (!room) {
      return getFallbackMetadata();
    }

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
        "ประมูลลูกไก่",
        "ลูกไก่ชน",
        "ซุ้มนักรบหลังกำแพง",
        "ประมูลไก่ชน",
        "ลูกไก่ราคาถูก",
        "ซุ้มไก่ชน",
      ],
      openGraph: {
        type: "website",
        locale: "th_TH",
        url: siteUrl,
        title,
        description,
        siteName: "ไซม่อนซีฟู้ด",
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
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
    return getFallbackMetadata();
  }
}

function getFallbackMetadata(): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title: defaultTitle,
    description: defaultDesc,
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      images: [defaultImage],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDesc,
      images: [defaultImage],
    },
  };
}

const Page = () => {
  return (
    <div className="custom-pattern">
      <LiveViewerEntry />
    </div>
  );
};

export default Page;
