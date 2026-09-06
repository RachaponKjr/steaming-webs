/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useLiveMessage.ts
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { messageService, Message } from "@/services/message.service";

// ต้องระบุ Namespace /chat ให้ตรงกับ Gateway
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SOCKET_URL = `${API_URL.replace(/\/$/, "")}/chat`;

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
};

export const messageKeys = {
  all: ["messages"] as const,
  history: (liveId: string) => [...messageKeys.all, "history", liveId] as const,
};

// 1. Hook ดึงประวัติแชตเริ่มต้น + ฟัง Real-time Messages
export function useLiveMessageStream(liveId: string) {
  const queryClient = useQueryClient();

  // ดึงประวัติข้อความรอบแรกผ่าน REST API
  const historyQuery = useQuery({
    queryKey: messageKeys.history(liveId),
    queryFn: async (): Promise<Message[]> => {
      const res: any = await messageService.getMessagesHistory(liveId);
      if (res && Array.isArray(res.messages)) {
        return res.messages.map((item: any) => ({
          ...item,
          message: item.message || item.content || "",
        }));
      }
      if (Array.isArray(res)) {
        return res.map((item: any) => ({
          ...item,
          message: item.message || item.content || "",
        }));
      }
      return [];
    },
    enabled: Boolean(liveId),
    staleTime: 1000 * 5,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (!liveId) return;

    const s = getSocket();

    if (!s.connected) {
      s.connect();
    }

    // เข้าร่วมห้องไลฟ์ (Event ตรงกับ @SubscribeMessage('joinLiveRoom'))
    s.emit("joinLiveRoom", { liveId });

    // ดักฟังข้อความใหม่ (Event ตรงกับ broadcastNewMessage -> 'newLiveMessage')
    const handleNewMessage = (newMessage: Message) => {
      queryClient.setQueryData<Message[]>(
        messageKeys.history(liveId),
        (old = []) => {
          const exists = old.some((m) => m.id === newMessage.id);
          if (exists) return old;
          return [...old, newMessage];
        },
      );
    };

    // ดักฟังกรณีข้อความโดนแบน/ซ่อน (Event ตรงกับ 'messageBlocked')
    const handleMessageBlocked = ({ messageId }: { messageId: string }) => {
      queryClient.setQueryData<Message[]>(
        messageKeys.history(liveId),
        (old = []) => old.filter((m) => m.id !== messageId),
      );
    };

    s.on("newLiveMessage", handleNewMessage);
    s.on("messageBlocked", handleMessageBlocked);

    return () => {
      s.emit("leaveLiveRoom", { liveId });
      s.off("newLiveMessage", handleNewMessage);
      s.off("messageBlocked", handleMessageBlocked);
    };
  }, [liveId, queryClient]);

  return historyQuery;
}

// 2. Hook สำหรับส่งข้อความผ่าน REST API (หรือจะยิงผ่าน Socket ก็ได้)
export interface SendMessagePayload {
  liveId: string;
  senderId: string;
  senderName: string;
  message: string;
}

export function useSendMessage() {
  return useMutation({
    mutationFn: ({
      liveId,
      senderId,
      senderName,
      message,
    }: SendMessagePayload) =>
      messageService.sendMessage(liveId, senderId, senderName, message),
  });
}
