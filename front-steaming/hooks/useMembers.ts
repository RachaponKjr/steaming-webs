import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import {
  membersService,
  Member,
  CreateMemberPayload,
  UpdateMemberPayload,
} from "@/services/member.service";

// ========================================================
// 1. Hook ดึงรายการสมาชิกทั้งหมด
// ========================================================
export function useMembers() {
  return useQuery<Member[], Error>({
    queryKey: ["members"],
    queryFn: () => membersService.getMembers(),
    staleTime: 1000 * 60 * 2, // แคชไว้ 2 นาที
  });
}

// ========================================================
// 2. Hook ดึงข้อมูลสมาชิกรายคน (Detail)
// ========================================================
export function useMember(id: string) {
  return useQuery<Member, Error>({
    queryKey: ["members", id],
    queryFn: () => membersService.getMemberById(id),
    enabled: !!id,
  });
}

// ========================================================
// 3. Hook เพิ่มสมาชิกใหม่ (Create)
// ========================================================
export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation<Member, Error, CreateMemberPayload>({
    mutationFn: (payload) => membersService.createMember(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.add({
        type: "success",
        title: "สำเร็จ",
        description: "เพิ่มสมาชิกใหม่เรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "ไม่สำเร็จ",
        description: error.message || "ไม่สามารถเพิ่มสมาชิกได้",
      });
    },
  });
}

// ========================================================
// 4. Hook แก้ไขข้อมูลสมาชิก (Update)
// ========================================================
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation<Member, Error, { id: string; data: UpdateMemberPayload }>({
    mutationFn: ({ id, data }) => membersService.updateMember(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["members", variables.id] });
      toast.add({
        type: "success",
        title: "สำเร็จ",
        description: "อัปเดตข้อมูลสมาชิกเรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "ไม่สำเร็จ",
        description: error.message || "ไม่สามารถอัปเดตข้อมูลได้",
      });
    },
  });
}

// ========================================================
// 5. Hook ลบสมาชิก (Delete)
// ========================================================
export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id) => membersService.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.add({
        type: "success",
        title: "สำเร็จ",
        description: "ลบสมาชิกเรียบร้อยแล้ว",
      });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: "ไม่สำเร็จ",
        description: error.message || "ไม่สามารถลบสมาชิกได้",
      });
    },
  });
}
