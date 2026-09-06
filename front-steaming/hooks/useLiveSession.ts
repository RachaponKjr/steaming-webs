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
  today: (isCreator = true) =>
    [...sessionKeys.all, "today", isCreator] as const,
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

/**
 * ดึงไลฟ์ของวันนี้
 * @param isCreator true = ฝั่งแอดมิน (backend ส่ง streamKey/RTMP มาด้วย)
 *                  false = ฝั่งผู้ชม (ไม่ส่งข้อมูลลับ)
 */
export function useTodayLiveSession(isCreator = true) {
  return useQuery({
    queryKey: sessionKeys.today(isCreator),
    queryFn: () => roomService.getTodayRoom(isCreator),
    // ฝั่งผู้ชมต้องเด้งเข้าห้องเองทันทีที่ร้านกด GO LIVE จึงเช็คถี่กว่า
    refetchInterval: isCreator ? 60_000 : 10_000,
    refetchOnWindowFocus: true,
  });
}

// ใหม่: สร้างไลฟ์ของวันนี้
export function useCreateTodayLiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateRoomDto) => roomService.createRoom(dto),
    onSuccess: (created) => {
      queryClient.setQueryData(sessionKeys.today(true), created);
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
