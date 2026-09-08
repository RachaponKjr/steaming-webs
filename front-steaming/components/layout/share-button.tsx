"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2, Check, Copy, MessageCircle } from "lucide-react";

interface ShareButtonProps {
  title?: string;
  url?: string;
  className?: string;
}

export function ShareButton({
  title = "สตรีมสด",
  url,
  className,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // ถ้าไม่ได้ส่ง url มา จะใช้ URL ปัจจุบันของหน้าเว็บ
  const currentUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: currentUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      setOpen(true);
    }
  };

  // ลิงก์สำหรับแชร์ไปยัง Social Media ต่างๆ
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      currentUrl,
    )}`,
    line: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
      currentUrl,
    )}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      currentUrl,
    )}&text=${encodeURIComponent(title)}`,
  };

  return (
    <>
      {/* ปุ่มกดแชร์ (รองรับ Native Share บนมือถือ ถ้ามี ถ้าไม่มีจะเปิด Dialog) */}
      <Button
        variant="outline"
        size="default"
        className={className || "gap-1.5 text-xs sm:text-sm flex-1"}
        onClick={() => {
          if (typeof navigator !== "undefined" && navigator.share) {
            handleNativeShare();
          } else {
            setOpen(true);
          }
        }}
      >
        <Share2 className="size-4" />
        แชร์ลิงก์
      </Button>

      {/* Dialog เลือกช่องทางการแชร์ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[400px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              แชร์ห้องไลฟ์นี้
            </DialogTitle>
            <DialogDescription className="text-xs">
              เลือกช่องทางที่คุณต้องการแชร์ลิงก์สตรีมนี้
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* ปุ่มแชร์ด่วนไปยัง Platform ต่างๆ */}
            <div className="grid grid-cols-3 gap-2">
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card hover:bg-muted transition-colors text-xs font-medium gap-1.5"
              >
                <div className="size-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  f
                </div>
                Facebook
              </a>

              <a
                href={shareLinks.line}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card hover:bg-muted transition-colors text-xs font-medium gap-1.5"
              >
                <div className="size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <MessageCircle className="size-4" />
                </div>
                LINE
              </a>

              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-lg border bg-card hover:bg-muted transition-colors text-xs font-medium gap-1.5"
              >
                <div className="size-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold">
                  𝕏
                </div>
                Twitter / X
              </a>
            </div>

            {/* ช่องคัดลอกลิงก์ */}
            <div className="space-y-1.5 pt-2 border-t">
              <label className="text-xs font-medium text-muted-foreground">
                หรือคัดลอกลิงก์ URL
              </label>
              <div className="flex gap-1.5">
                <Input
                  readOnly
                  value={currentUrl}
                  className="h-9 text-xs font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
