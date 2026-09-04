import { api } from "./api/client";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "MODERATOR";

export interface Member {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberPayload {
  email: string;
  password?: string;
  name: string;
  role?: AdminRole;
}

export interface UpdateMemberPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: AdminRole;
}

export const membersService = {
  getMembers: (): Promise<Member[]> => {
    return api.get("/auth");
  },

  getMemberById: (id: string): Promise<Member> => {
    return api.get(`/auth/${id}`);
  },

  createMember: (payload: CreateMemberPayload): Promise<Member> => {
    return api.post("/auth/register", payload);
  },

  updateMember: (id: string, payload: UpdateMemberPayload): Promise<Member> => {
    return api.patch(`/auth/${id}`, payload);
  },

  deleteMember: (id: string): Promise<{ success: boolean }> => {
    return api.delete(`/auth/${id}`);
  },
};
