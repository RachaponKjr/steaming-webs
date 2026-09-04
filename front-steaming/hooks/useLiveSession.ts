import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  liveSessionService,
  LiveSession,
  UpdateLiveSessionDto,
  LiveStatus,
} from "@/services/live-session.service";
import { roomService, CreateRoomDto } from "@/services/room.service";

export const sessionKeys = {
  all: ["live-sessions"] as const,
  detail: (id: string) => [...sessionKeys.all, id] as const,
  today: () => [...sessionKeys.all, "today"] as const,
};

export function useLiveSession(liveId: string) {
  return useQuery({
    queryKey: sessionKeys.detail(liveId),
    queryFn: () => liveSessionService.getSession(liveId),
    enabled: Boolean(liveId),
  });
}

export function useLiveAll() {
  return useQuery({
    queryKey: sessionKeys.all,
    queryFn: () => roomService.getAllRoom(),
  });
}

// ใหม่: ดึงไลฟ์ของวันนี้ (สำหรับ Dashboard)
export function useTodayLiveSession() {
  return useQuery({
    queryKey: sessionKeys.today(),
    queryFn: () => roomService.getTodayRoom(true),
    refetchInterval: 60_000, // เผื่อหน้าเปิดค้างข้ามเที่ยงคืน
  });
}

// ใหม่: สร้างไลฟ์ของวันนี้
export function useCreateTodayLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateRoomDto) => roomService.createRoom(dto),
    onSuccess: (created) => {
      queryClient.setQueryData(sessionKeys.today(), created);
      queryClient.setQueryData(sessionKeys.detail(created.id), created);
    },
  });
}

export function useUpdateLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      liveId,
      data,
    }: {
      liveId: string;
      data: UpdateLiveSessionDto;
    }) => liveSessionService.updateSession(liveId, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(sessionKeys.detail(updated.id), updated);
    },
  });
}

export function useUpdateLiveStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ liveId, status }: { liveId: string; status: LiveStatus }) =>
      liveSessionService.updateStatus(liveId, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(sessionKeys.detail(updated.id), updated);
    },
  });
}
