// hooks/useLivekitToken.ts
import { useQuery } from "@tanstack/react-query";
import { livekitService, normalizeWsUrl } from "@/services/livekit.service";

export const livekitKeys = {
  viewer: (room: string, username: string) =>
    ["livekit", "viewer", room, username] as const,
  host: (room: string) => ["livekit", "host", room] as const,
};

/**
 * Token จะหมดอายุ (viewer 4h / host 12h) จึงตั้ง refetch ทุก ๆ 1 ชม.
 * และปิด refetchOnWindowFocus เพื่อไม่ให้ LiveKitRoom reconnect ทุกครั้งที่สลับแท็บ
 */
const sharedOptions = {
  staleTime: 60 * 60 * 1000,
  refetchInterval: 60 * 60 * 1000,
  refetchOnWindowFocus: false,
  retry: 2,
};

export function useViewerLivekitToken(
  liveId: string,
  username: string,
  isHost: boolean,
) {
  const query = useQuery({
    queryKey: livekitKeys.viewer(liveId, username),
    queryFn: () => livekitService.getViewerToken(liveId, username, isHost),
    enabled: Boolean(liveId) && Boolean(username?.trim()),
    ...sharedOptions,
  });

  return {
    ...query,
    token: query.data?.token ?? "",
    wsUrl: query.data ? normalizeWsUrl(query.data.wsUrl) : "",
  };
}

export function useHostLivekitToken(liveId: string, isHost: boolean) {
  const query = useQuery({
    queryKey: livekitKeys.host(liveId),
    queryFn: () => livekitService.getHostToken(liveId, "ADMIN_HOST", isHost),
    enabled: Boolean(liveId),
    ...sharedOptions,
  });

  return {
    ...query,
    token: query.data?.token ?? "",
    wsUrl: query.data ? normalizeWsUrl(query.data.wsUrl) : "",
  };
}
