import { LiveRoomItem } from "@/app/(dashboard)/dashboard/live-data/_components/live-page";
import { api } from "./api/client";

export interface Room {
  id: string;
  title: string;
  streamKey: string;
  status: string;
  creatorId: string;
  liveDate: string; // วันที่ของไลฟ์ (YYYY-MM-DD)
  startedAt: string;
  endedAt: string;
  // Open Graph & SEO Fields
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogThumbnail?: string | null;
  ogImage?: string | null;
  ogTags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Creator {
  id: string;
  name: string;
}

interface Playback {
  hlsUrl: string;
  webrtcUrl: string;
}

interface Streaming {
  rtmpServerUrl: string;
  streamKey: string;
  obsServer: string;
  whipUrl: string;
}

export interface FullRoom {
  id: string;
  title: string;
  streamKey: string;
  status: string;
  creatorId: string;
  liveDate: string;
  startedAt: string;
  endedAt: string;
  // Open Graph & SEO Fields
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogThumbnail?: string | null;
  ogImage?: string | null;
  ogTags?: string[];
  createdAt: string;
  updatedAt: string;
  creator: Creator;
  playback: Playback;
  streaming?: Streaming;
}

export interface CreateRoomDto {
  title: string;
  creatorId?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogThumbnail?: string;
  ogImage?: string;
  ogTags?: string[];
}

export const roomService = {
  getRoomsActive: () => {
    return api.get<FullRoom[]>(`/room`, {
      query: {
        status: "STREAMING",
      },
      next: { revalidate: 60 },
    });
  },

  getAllRoom: () => {
    return api.get<LiveRoomItem[]>(`/room`);
  },

  getRoomById: (id: string) => {
    return api.get<Room>(`/room/${id}`);
  },

  getTodayRoom: (isCreator = true) => {
    return api.get<FullRoom | null>(`/room/today`, {
      query: {
        isCreator: String(isCreator),
      },
      cache: "no-store",
    });
  },

  createRoom: (dto: CreateRoomDto) => {
    return api.post<[FullRoom, CreateRoomDto]>(`/room`, dto);
  },
};
