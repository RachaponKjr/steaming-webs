// src/services/live-session.service.ts
import { api } from "./api/client";

export type LiveStatus = "IDLE" | "STREAMING" | "ENDED";

export interface LiveSession {
  id: string;
  title: string;
  streamKey: string;
  status: LiveStatus;
  creatorId?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogThumbnail?: string | null;
  ogImage?: string | null;
  ogTags: string[];
}

export interface UpdateLiveSessionDto {
  title?: string;
  status?: LiveStatus;
  ogTitle?: string;
  ogDescription?: string;
  ogThumbnail?: string;
  ogImage?: string;
  ogTags?: string[];
}

export const liveSessionService = {
  getSession: (liveId: string) => {
    return api.get<LiveSession>(`/room/${liveId}`);
  },

  updateSession: (liveId: string, data: UpdateLiveSessionDto) => {
    return api.patch<LiveSession>(`/room/${liveId}`, data);
  },

  updateStatus: (liveId: string, status: LiveStatus) => {
    return api.patch<LiveSession>(`/room/${liveId}/status`, {
      status,
    });
  },
};
