// src/services/api/types.ts
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined | null>;
  params?: Record<string, string | number | boolean | undefined | null>;
  token?: string;
}
