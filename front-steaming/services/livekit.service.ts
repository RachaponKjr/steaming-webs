// services/livekit.service.ts
import { api } from "./api/client";

export interface LivekitTokenResponse {
  token: string;
  wsUrl: string;
}

/** แปลง URL ให้เป็น ws:// หรือ wss:// เสมอ และบังคับ wss เมื่อหน้าเว็บรันบน https (กัน mixed-content ถูกบล็อก) */
export function normalizeWsUrl(raw?: string | null): string {
  const fallback = process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://127.0.0.1:7880";

  let url = (raw || fallback).trim();
  url = url.replace(/^http:\/\//, "ws://").replace(/^https:\/\//, "wss://");

  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    url.startsWith("ws://")
  ) {
    url = url.replace(/^ws:\/\//, "wss://");
  }

  return url;
}

export const livekitService = {
  /** ผู้ชม: public ไม่ต้องล็อกอิน */
  getViewerToken: (room: string, username: string, isHost: boolean) =>
    api.get<LivekitTokenResponse>("/livekit/token", {
      query: { room, username, isHost },
      cache: "no-store",
    }),

  /** Host: ต้องมี admin_token (api client แนบ Authorization ให้อัตโนมัติ) */
  getHostToken: (
    room: string,
    username = "Host_Admin",
    isHost: boolean = true,
  ) =>
    api.get<LivekitTokenResponse>("/livekit/host-token", {
      query: { room, username, isHost },
      cache: "no-store",
    }),
};
