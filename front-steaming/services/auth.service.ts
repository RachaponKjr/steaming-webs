import { LoginResponse } from "@/hooks/useAuth";
import { api } from "./api/client";

export const authService = {
  login: (email: string, password: string) => {
    return api.post<LoginResponse>(`/auth/login`, {
      email,
      password,
    });
  },
};
