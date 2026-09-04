import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messageService } from "@/services/message.service";
import { toast } from "@/components/ui/toast";

export interface MessageToAdmin {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  senderType: "MEMBER" | "ADMIN";
  readed: boolean;
  createdAt: string;
}

export interface LatestConversation extends MessageToAdmin {
  unreadCount: number;
}

export interface SendToAdminPayload {
  senderId: string;
  senderName: string;
  content: string;
  senderType: "MEMBER" | "ADMIN";
}

// 1. Hook ดึงข้อความทั้งหมด (สำหรับหน้า Admin Inbox)
export function useMessagesToAdmin() {
  return useQuery<MessageToAdmin[], Error>({
    queryKey: ["messages-to-admin"],
    queryFn: () => messageService.getAllMessageToAdmin(),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 10,
  });
}

// 2. Hook ดึงข้อความล่าสุด 1 ข้อความของแต่ละคน/ห้อง (Inbox Overview List)
export function useLatestConversations() {
  return useQuery<LatestConversation[], Error>({
    queryKey: ["messages-to-admin", "conversations", "latest"],
    queryFn: () => messageService.getLatestConversations(),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 10, // polling ทุก 10 วินาที
  });
}

// 3. Hook ดึงข้อความเฉพาะลูกค้าตาม senderId
export function useMessagesBySender(senderId?: string) {
  return useQuery<MessageToAdmin[], Error>({
    queryKey: ["messages-to-admin", "sender", senderId],
    queryFn: () => messageService.getMessageBySenderId({ senderId: senderId! }),
    enabled: !!senderId,
  });
}

// 4. Hook ส่งข้อความถึงแอดมิน (sendToAdmin)
export function useSendToAdmin() {
  const queryClient = useQueryClient();

  return useMutation<MessageToAdmin, Error, SendToAdminPayload>({
    mutationFn: (dto) => messageService.sendToAdmin(dto),
    onSuccess: (_, variables) => {
      // รีเฟรชทั้ง Inbox กลาง, รายการล่าสุด และแชตของลูกค้ารายนั้น
      queryClient.invalidateQueries({ queryKey: ["messages-to-admin"] });
      queryClient.invalidateQueries({
        queryKey: ["messages-to-admin", "conversations", "latest"],
      });
      queryClient.invalidateQueries({
        queryKey: ["messages-to-admin", "sender", variables.senderId],
      });
      toast.add({
        type: "success",
        title: "ส่งข้อความสำเร็จ",
        description: "ระบบได้ส่งข้อความของคุณถึงแอดมินเรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "ส่งข้อความไม่สำเร็จ",
        description: error.message || "เกิดข้อผิดพลาดในการส่งข้อความ",
      });
    },
  });
}

// 5. Hook มาร์กว่าอ่านแล้ว (readMessageToAdmin)
export function useReadMessageToAdmin() {
  const queryClient = useQueryClient();

  return useMutation<MessageToAdmin, Error, { senderId: string }>({
    mutationFn: ({ senderId }) =>
      messageService.readMessageToAdmin({ senderId }),
    onSuccess: (res) => {
      console.log(res, "RES");
      queryClient.invalidateQueries({ queryKey: ["messages-to-admin"] });
      queryClient.invalidateQueries({
        queryKey: ["messages-to-admin", "conversations", "latest"],
      });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัปเดตสถานะการอ่านได้",
      });
    },
  });
}

// 6. Hook ลบข้อความ (deleteMessageToAdmin)
export function useDeleteMessageToAdmin() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, { id: string }>({
    mutationFn: ({ id }) => messageService.deleteMessageToAdmin({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages-to-admin"] });
      queryClient.invalidateQueries({
        queryKey: ["messages-to-admin", "conversations", "latest"],
      });
      toast.add({
        type: "success",
        title: "ลบสำเร็จ",
        description: "ลบข้อความเรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "ลบไม่สำเร็จ",
        description: error.message || "ไม่สามารถลบข้อความได้",
      });
    },
  });
}
