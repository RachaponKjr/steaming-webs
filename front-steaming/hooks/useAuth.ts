import { toast } from "@/components/ui/toast";
import { authService } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: "SUPER_ADMIN" | "ADMIN" | "MODERATOR";
  };
}

export interface ApiErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

// ฟังก์ชันยิง API ผ่าน authService
const loginApi = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await authService.login(payload.email, payload.password);
  return response;
};

export function useAuthLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ดึงค่า callbackUrl จาก query params (ถ้าไม่มีให้ fallback เป็น /dashboard)
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // กำหนด Type ของ useMutation: <TData, TError, TVariables>
  const mutation = useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: loginApi,
    onSuccess: (data) => {
      // 1. บันทึก Token ลง Cookie (สำหรับ Middleware) และ LocalStorage (สำหรับ Client)
      if (data.accessToken) {
        document.cookie = `admin_token=${data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax;`;
        localStorage.setItem("admin_token", data.accessToken);
      }
      if (data.admin) {
        localStorage.setItem("admin_profile", JSON.stringify(data.admin));
      }

      toast.add({
        type: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับสู่ระบบจัดการ Live Streaming",
      });

      // 2. นำทางไปยัง callbackUrl ที่อ่านได้จาก URL
      router.push(callbackUrl);
    },
    onError: (error) => {
      console.error("Login failed:", error.message);
      toast.add({
        type: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      });
    },
  });

  // แปลง error message ให้ออกมาเป็น string เสมอ
  const getErrorMessage = (): string | null => {
    if (!mutation.error) return null;
    return mutation.error.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  };

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    errorMessage: getErrorMessage(),
    resetError: mutation.reset,
  };
}
