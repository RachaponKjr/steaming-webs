import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. ดึง Token จาก Cookie
  const token = request.cookies.get("admin_token")?.value;
  const { pathname } = request.nextUrl;

  // 2. ถ้าเข้าหน้า /dashboard หรือหน้าย่อยของ /dashboard ทั้งหมดแล้วไม่มี Token
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/signin", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname); // จำหน้าที่ผู้ใช้ตั้งใจจะเข้า
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. ถ้าล็อกอินอยู่แล้ว (มี Token) แต่พยายามเข้าหน้า /signin -> ส่งตรงไป /dashboard
  if (pathname === "/signin" || pathname === "/login") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// กำหนด Matcher ให้ครอบคลุม /dashboard ทุกพาธย่อย
export const config = {
  matcher: [
    "/dashboard/:path*", // ครอบคลุม /dashboard และ /dashboard/xxx ทั้งหมด
    "/signin",
    "/login",
  ],
};
