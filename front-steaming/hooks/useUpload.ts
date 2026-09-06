import { toast } from "@/components/ui/toast";
// หรือถ้าโปรเจกต์นี้ใช้ sonner ให้เช็คการ import ด้วยครับ เช่น:
// import { toast } from "sonner";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api/client";

export type ResponseUpload = {
  folder: string;
  filename: string;
  url: string;
};

export function useUpload() {
  // --- 1. Mutation สำหรับอัปโหลดไฟล์ ---
  const uploadMutation = useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder: string }) => {
      const formData = new FormData();
      formData.append("file", file);

      // 💡 แก้จาก /upload เป็น /upload/image และส่ง query string ให้ถูกวิธี
      return await api.post<ResponseUpload>(
        `/upload/image?folder=${folder}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
    },
    onSuccess: () => {
      toast.add({ title: "อัปโหลดไฟล์สำเร็จ" });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.add({ title: error.message || "อัปโหลดล้มเหลว" });
    },
  });

  // --- 2. Mutation สำหรับลบไฟล์ ---
  const deleteMutation = useMutation({
    mutationFn: async ({
      folder,
      filename,
    }: {
      folder: string;
      filename: string;
    }) => {
      return await api.delete(`/upload/${folder}/${filename}`);
    },
    onSuccess: () => {
      toast.add({ title: "ลบรูปภาพสำเร็จ" });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.add({ title: error.message || "ลบรูปภาพล้มเหลว" });
    },
  });

  const handleUpload = async (
    file: File | null,
    folder: string = "products",
  ) => {
    if (!file) return null;

    if (file.size > 5 * 1024 * 1024) {
      toast.add({
        title: "ไฟล์ต้องมีขนาดไม่เกิน 5MB",
      });
      return null;
    }

    return await uploadMutation.mutateAsync({ file, folder });
  };

  const handleDelete = async (folderOrUrl: string, filename?: string) => {
    if (!folderOrUrl) return;

    let targetFolder = folderOrUrl;
    let targetFilename = filename;

    if (folderOrUrl.includes("http") || folderOrUrl.includes("/uploads/")) {
      try {
        const urlObj = new URL(folderOrUrl);
        const pathParts = urlObj.pathname.split("/");

        targetFilename = pathParts.pop();
        targetFolder = pathParts.pop() || "";
      } catch (error) {
        const parts = folderOrUrl.split("/");
        targetFilename = parts.pop();
        targetFolder = parts.pop() || "";
      }
    }

    if (!targetFolder || !targetFilename) {
      toast.add({
        title: "ข้อมูลไฟล์ไม่ถูกต้อง",
      });
      return;
    }

    return await deleteMutation.mutateAsync({
      folder: targetFolder,
      filename: targetFilename,
    });
  };

  return {
    upload: handleUpload,
    remove: handleDelete,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    error: uploadMutation.error || deleteMutation.error,
  };
}
