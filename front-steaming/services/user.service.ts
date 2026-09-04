// src/services/user.service.ts
import { api } from "./api/client";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

export const userService = {
  getUsers: (role?: string) => {
    return api.get<User[]>("/users", {
      params: { role },
      next: { revalidate: 60 },
    });
  },

  getUserById: (id: string) => {
    return api.get<User>(`/users/${id}`);
  },

  updateUser: (id: string, data: UpdateUserDto) => {
    return api.put<User>(`/users/${id}`, data);
  },

  deleteUser: (id: string) => {
    return api.delete<void>(`/users/${id}`);
  },
};
