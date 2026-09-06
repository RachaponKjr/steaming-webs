// src/services/api/client.ts
import { RequestOptions } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // ฟังก์ชันช่วยดึง Token จาก LocalStorage หรือ Cookie ฝั่งเบราว์เซอร์
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;

    // 1. อ่านจาก localStorage ก่อน
    const localToken = localStorage.getItem("admin_token");
    if (localToken) return localToken;

    // 2. Fallback อ่านจาก Cookie
    const match = document.cookie.match(new RegExp("(^| )admin_token=([^;]+)"));
    return match ? match[2] : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { query, params, token, headers, ...customConfig } = options;

    // รวม query params
    const mergedParams = {
      ...(params || {}),
      ...(query || {}),
    };

    const url = new URL(`${this.baseUrl}${endpoint}`);

    Object.entries(mergedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });

    // ดึง Token: ใช้ token จาก options ถ้ามี หรือดึงอัตโนมัติ
    const activeToken = token || this.getAuthToken();

    // Setup Default Headers
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      ...(headers as Record<string, string>),
    };

    // Execute Fetch
    const response = await fetch(url.toString(), {
      headers: requestHeaders,
      ...customConfig,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `HTTP Error: ${response.status} ${response.statusText}`,
      );
    }

    if (response.status === 204) return {} as T;

    return response.json();
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient(BASE_URL);
