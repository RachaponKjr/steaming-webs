// src/services/message.service.ts
import { api } from "./api/client";

export interface Message {
  id: string;
  liveId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface MessageFull {
  session: {
    id: string;
    title: string;
    status: string;
  };
  messages: Message[];
}

export interface MessageToAdmin {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  senderType: "MEMBER" | "ADMIN";
  readed: boolean;
  createdAt: string;
}

export interface SendToAdminPayload {
  senderId: string;
  senderName: string;
  content: string;
  senderType: "MEMBER" | "ADMIN";
}

export interface LatestConversation extends MessageToAdmin {
  unreadCount: number;
}

export const messageService = {
  getMessagesHistory: (liveId: string, limit: number = 50) => {
    return api.get<MessageFull>(`/chat/history/${liveId}`, {
      query: { limit },
    });
  },

  sendMessage: (
    liveId: string,
    senderId: string,
    senderName: string,
    message: string,
  ) => {
    return api.post<Message>(`/chat/send`, {
      liveId,
      senderId,
      senderName,
      message,
    });
  },

  // ใส่ Generic ให้ตรงตาม Response
  sendToAdmin: (dto: SendToAdminPayload) => {
    return api.post<MessageToAdmin>(`/messages-to-admin`, dto);
  },

  getAllMessageToAdmin: () => {
    return api.get<MessageToAdmin[]>(`/messages-to-admin`);
  },

  getMessageBySenderId: ({ senderId }: { senderId: string }) => {
    return api.get<MessageToAdmin[]>(`/messages-to-admin/sender/${senderId}`);
  },

  readMessageToAdmin: ({ senderId }: { senderId: string }) => {
    return api.patch<MessageToAdmin>(
      `/messages-to-admin/sender/${senderId}/read`,
    );
  },

  deleteMessageToAdmin: ({ id }: { id: string }) => {
    return api.delete<{ success: boolean }>(`/messages-to-admin/${id}`);
  },

  getLatestConversations: () => {
    return api.get<LatestConversation[]>(
      "/messages-to-admin/conversations/latest",
    );
  },
};
