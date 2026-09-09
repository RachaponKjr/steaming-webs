// components/live/live-status-screens.tsx
"use client";

import {
  Radio,
  Clock,
  CalendarX,
  Phone,
  ExternalLink,
  Truck,
  PackageCheck,
  ShieldCheck,
  Loader2,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ----------------------------------------------------------------------
// 1. วันนี้ยังไม่มีไลฟ์ถูกเปิดขึ้นมาเลย
// ----------------------------------------------------------------------
export function NoLiveTodayScreen() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 text-center gap-4 text-zinc-900">
      {/* Icon Ring แทนรูปภาพ */}
      <div className="relative flex size-24 sm:size-28 items-center justify-center">
        <div className="relative size-20 sm:size-24 flex items-center justify-center rounded-full bg-zinc-100 border-2 border-zinc-200 shadow-md text-zinc-700">
          <Trophy className="size-10 sm:size-12" />
        </div>
        <div className="absolute bottom-1 right-1 flex size-6 sm:size-7 items-center justify-center rounded-full bg-zinc-100 border border-zinc-300 text-zinc-600 shadow-xs">
          <CalendarX className="size-3.5 sm:size-4" />
        </div>
      </div>

      {/* Main Announcement */}
      <div className="space-y-2 max-w-sm w-full">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
          <span className="size-2 rounded-full bg-zinc-400" />
          ยังไม่มีการถ่ายทอดสด
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
          วันนี้ยังไม่มีรอบไลฟ์สดประมูลลูกไก่
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed px-2">
          ทางซุ้มยังไม่ได้เปิดห้องไลฟ์สำหรับวันนี้
          สามารถติดตามตารางประมูลและสอบถามข้อมูลสายพันธุ์ลูกไก่ล่วงหน้าผ่านช่องทางด้านล่างได้เลย
        </p>
      </div>

      {/* Store Highlights / Value Props */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm py-1">
        <div className="flex flex-col items-center p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
          <Truck className="size-4 text-blue-600 mb-1" />
          <span className="text-[11px] font-semibold text-zinc-800">
            จัดส่ง
          </span>
          <span className="text-[10px] text-zinc-400">ทั่วประเทศ</span>
        </div>
        <div className="flex flex-col items-center p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
          <PackageCheck className="size-4 text-emerald-600 mb-1" />
          <span className="text-[11px] font-semibold text-zinc-800">
            ปลอดภัย
          </span>
          <span className="text-[10px] text-zinc-400">ส่งถึงมืออย่างดี</span>
        </div>
        <div className="flex flex-col items-center p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-center">
          <ShieldCheck className="size-4 text-amber-600 mb-1" />
          <span className="text-[11px] font-semibold text-zinc-800">
            สายพันธุ์แท้
          </span>
          <span className="text-[10px] text-zinc-400">การันตีคุณภาพ</span>
        </div>
      </div>

      {/* Contact Channels */}
      <div className="w-full max-w-sm sm:max-w-md grid grid-cols-1 gap-2.5 px-2 sm:px-0">
        {/* Facebook Fanpage */}
        <Button
          render={
            <Link
              href="https://web.facebook.com/profile.php?id=61594011634851"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center justify-center w-full"
            >
              <svg
                className="absolute left-4 size-4.5 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook Fanpage</span>
              <ExternalLink className="absolute right-4 size-3.5 opacity-70" />
            </Link>
          }
          size={"xl"}
          className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium rounded-md shadow-2xs transition-transform active:scale-[0.98]"
        />

        {/* Phone Contact */}
        <Button
          render={
            <Link
              href="tel:0943158238"
              className="relative flex items-center justify-center w-full"
            >
              <Phone className="absolute left-4 size-4 text-zinc-500" />
              <span>094-315-8238</span>
            </Link>
          }
          variant="outline"
          size={"xl"}
          className="w-full border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium rounded-md shadow-2xs transition-transform active:scale-[0.98]"
        />
      </div>

      {/* Auto-check Footer Badge */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-1 text-center px-4">
        <Clock className="size-3.5 text-zinc-400 shrink-0" />
        <span>
          ระบบจะคอยตรวจสอบและรีเฟรชเข้าห้องไลฟ์ให้อัตโนมัติเมื่อซุ้มเริ่มเปิดไลฟ์ประมูล
        </span>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. มีห้องไลฟ์ของวันนี้แล้ว แต่แอดมินยังไม่กด GO LIVE (status = IDLE)
// ----------------------------------------------------------------------
export function WaitingLiveScreen({ title }: { title?: string }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-10 text-center gap-5 text-zinc-900">
      {/* Icon & Ping Animation */}
      <div className="relative flex size-36 sm:size-44 items-center justify-center">
        <span className="absolute inline-flex rounded-full bg-blue-500/10 animate-ping size-24 sm:size-30" />
        <div className="relative size-32 sm:size-40 flex items-center justify-center rounded-full bg-zinc-100 border-2 border-zinc-200 shadow-md text-zinc-700">
          <Trophy className="size-16 sm:size-20" />
        </div>
      </div>

      {/* Texts */}
      <div className="space-y-1.5 max-w-sm w-full">
        <h1 className="text-lg sm:text-xl font-bold text-zinc-900">
          {title || "ไลฟ์ประมูลลูกไก่กำลังจะเริ่มเร็วๆ นี้"}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed px-2">
          ห้องไลฟ์เปิดพร้อมแล้ว รอทางซุ้มกดเริ่มถ่ายทอดสดสักครู่
          เตรียมตัวร่วมประมูลลูกไก่เริ่มต้น 10 บาทกันได้เลย
        </p>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 bg-zinc-50 border border-zinc-200/80 px-3.5 py-1.5 rounded-full shadow-2xs">
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
        กำลังรอสัญญาณจากซุ้ม...
      </div>

      {/* Divider */}
      <div className="w-full max-w-xs flex items-center gap-3 pt-2">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-[11px] font-medium text-zinc-400">
          ช่องทางติดต่อและติดตาม
        </span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      {/* Contact Channels */}
      <div className="w-full max-w-sm sm:max-w-md grid grid-cols-1 gap-2.5 px-2 sm:px-0">
        {/* Facebook */}
        <Button
          render={
            <Link
              href="https://web.facebook.com/profile.php?id=61594011634851"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center justify-center w-full"
            >
              <svg
                className="absolute left-4 size-4.5 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook Fanpage</span>
              <ExternalLink className="absolute right-4 size-3.5 opacity-70" />
            </Link>
          }
          size={"xl"}
          className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium rounded-md shadow-2xs transition-transform active:scale-[0.98]"
        />

        {/* Phone Contact */}
        <Button
          render={
            <Link
              href="tel:0943158238"
              className="relative flex items-center justify-center w-full"
            >
              <Phone className="absolute left-4 size-4 text-zinc-500" />
              <span>094-315-8238</span>
            </Link>
          }
          size={"xl"}
          variant="outline"
          className="w-full border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-sm sm:text-base rounded-md shadow-2xs transition-transform active:scale-[0.98]"
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. ไลฟ์ของวันนี้จบไปแล้ว (status = ENDED)
// ----------------------------------------------------------------------
export function LiveEndedScreen({ title }: { title?: string }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-10 text-center gap-5 text-zinc-900">
      {/* Icon */}
      <div className="relative flex size-36 sm:size-44 items-center justify-center">
        <div className="relative size-32 sm:size-40 flex items-center justify-center rounded-full bg-zinc-100 border-2 border-zinc-200 shadow-md text-zinc-400 grayscale">
          <Trophy className="size-16 sm:size-20" />
        </div>
      </div>

      {/* Texts */}
      <div className="space-y-1.5 max-w-sm w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">
          {title ? `ไลฟ์ "${title}" จบลงแล้ว` : "รอบไลฟ์ประมูลวันนี้จบลงแล้ว"}
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 leading-relaxed px-2">
          ขอบคุณพี่ๆ ทุกท่านที่มาร่วมประมูลลูกไก่ด้วยกันนะครับ/คะ
          พบกันใหม่รอบไลฟ์หน้า ติดตามหน้าเพจไว้ได้เลย
        </p>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-600 bg-zinc-50 border border-zinc-200/80 px-3.5 py-1.5 rounded-full shadow-2xs">
        <span className="size-3 rounded-full bg-zinc-400" />
        ไลฟ์จบแล้ว
      </div>

      {/* Divider */}
      <div className="w-full max-w-xs flex items-center gap-3 pt-2">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-[11px] font-medium text-zinc-400">
          ช่องทางติดต่อและติดตาม
        </span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      {/* Contact Channels */}
      <div className="w-full max-w-sm sm:max-w-md grid grid-cols-1 gap-2.5 px-2 sm:px-0">
        {/* Facebook */}
        <Button
          render={
            <Link
              href="https://web.facebook.com/profile.php?id=61594011634851"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center justify-center w-full"
            >
              <svg
                className="absolute left-4 size-4.5 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook Fanpage</span>
              <ExternalLink className="absolute right-4 size-3.5 opacity-70" />
            </Link>
          }
          size={"xl"}
          className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium rounded-md shadow-2xs transition-transform active:scale-[0.98]"
        />

        {/* Phone Contact */}
        <Button
          render={
            <Link
              href="tel:0943158238"
              className="relative flex items-center justify-center w-full"
            >
              <Phone className="absolute left-4 size-4 text-zinc-500" />
              <span>094-315-8238</span>
            </Link>
          }
          size={"xl"}
          variant="outline"
          className="w-full border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium text-sm sm:text-base rounded-md shadow-2xs transition-transform active:scale-[0.98]"
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. กำลังเช็คสถานะไลฟ์ของวันนี้
// ----------------------------------------------------------------------
export function CheckingLiveScreen() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-6 text-center gap-4 text-zinc-900">
      {/* Icon with Soft Glow */}
      <div className="relative flex size-36 sm:size-44 items-center justify-center">
        <span className="absolute inline-flex rounded-full bg-blue-500/10 animate-ping size-24 sm:size-30" />
        <div className="relative size-32 sm:size-40 flex items-center justify-center rounded-full bg-zinc-100 border-2 border-zinc-200 shadow-md text-zinc-700">
          <Trophy className="size-16 sm:size-20" />
        </div>
      </div>

      {/* Loading Status Indicator */}
      <div className="space-y-2 max-w-xs w-full">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-zinc-50 border border-zinc-200/80 text-zinc-700 shadow-2xs">
          <Loader2 className="size-3.5 animate-spin text-blue-600" />
          <span>กำลังตรวจสอบสัญญาณไลฟ์ประมูล...</span>
        </div>
        <p className="text-xs text-zinc-400">
          กรุณารอสักครู่ ระบบกำลังค้นหาห้องไลฟ์ประจำวัน
        </p>
      </div>

      {/* Micro Bottom Tag */}
      <div className="flex items-center gap-1 text-[11px] text-zinc-300 font-mono">
        <Radio className="size-3 text-zinc-300" />
        <span>LiveKit WebRTC System</span>
      </div>
    </div>
  );
}
