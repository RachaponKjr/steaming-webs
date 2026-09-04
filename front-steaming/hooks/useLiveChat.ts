/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useLiveChat.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export interface ChatMessage {
  id: string;
  liveId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3000";

export function useLiveChat(liveId: string, guestName: string) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [guestId, setGuestId] = useState<string>("");

  useEffect(() => {
    let storedId = localStorage.getItem("guest_chat_id");
    if (!storedId) {
      storedId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem("guest_chat_id", storedId);
    }
    setGuestId(storedId);
  }, []);

  useEffect(() => {
    if (!liveId || !guestName.trim()) return;

    const socket = io(`${BACKEND_URL}/chat`, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);

      socket.emit(
        "joinLiveRoom",
        { liveId, guestName, guestId },
        (response: any) => {
          if (response?.status === "success") {
            if (response.history) setMessages(response.history);
            if (response.viewerCount !== undefined) {
              setViewerCount(response.viewerCount);
            }
          }
        },
      );
    });

    socket.on("newLiveMessage", (newMsg: ChatMessage) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    socket.on(
      "viewerCountUpdated",
      (data: { liveId: string; viewerCount: number }) => {
        if (data.liveId === liveId) {
          setViewerCount(data.viewerCount);
        }
      },
    );

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.emit("leaveLiveRoom", { liveId });
      socket.disconnect();
    };
  }, [liveId, guestName, guestId]);

  const sendMessage = useCallback(
    (messageContent: string) => {
      if (!socketRef.current || !messageContent.trim()) return;

      socketRef.current.emit("sendLiveMessage", {
        liveId,
        senderId: guestId,
        senderName: guestName.trim(),
        message: messageContent,
      });
    },
    [liveId, guestName, guestId],
  );

  return {
    messages,
    viewerCount,
    isConnected,
    sendMessage,
    guestId,
  };
}
