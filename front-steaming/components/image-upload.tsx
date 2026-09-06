/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useUpload } from "@/hooks/useUpload";

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
  folder?: string;
  className?: string;
  defaultValue?: string;
}

type ResponseUpload = {
  data: {
    folder: string;
    fileName: string;
    url: string;
  };
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  label = "Upload Product Image",
  folder = "og",
  className,
  defaultValue,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // เรียกใช้ Hook สำหรับอัปโหลด
  const { upload, isUploading, remove, isDeleting } = useUpload();
  // ดักจับกรณี defaultValue เปลี่ยนแปลง (เช่น ตอนโหลดข้อมูลมาเพื่อ Edit)
  useEffect(() => {
    if (defaultValue) {
      setPreviewUrl(defaultValue);
    } else {
      setPreviewUrl(null);
    }
  }, [defaultValue]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (file) {
      // 1. ตรวจสอบประเภทไฟล์
      if (!file.type.startsWith("image/")) {
        setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }

      // 2. เรียกใช้ฟังก์ชันอัปโหลดไปยัง API
      try {
        const response = (await upload(
          file,
          folder,
        )) as unknown as ResponseUpload;
        if (response && response.data.url) {
          setPreviewUrl(response.data.url); // แสดงรูปพรีวิวจาก URL จริง
          onUploadSuccess(response.data.url); // ส่ง URL กลับไปอัปเดตค่าใน Form (setValue)
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || "อัปโหลดล้มเหลว กรุณาลองใหม่");
        }
      }
    }
  };

  const handleRemoveImage = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentImageUrl = previewUrl;

    if (
      currentImageUrl &&
      (currentImageUrl.includes("http") ||
        currentImageUrl.includes("/uploads/"))
    ) {
      await remove(currentImageUrl);
    }

    setPreviewUrl(null);
    setError(null);
    onUploadSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2 w-full", className)}>
      <label className="text-sm font-semibold text-slate-700 block">
        {label}
      </label>

      <div className="relative group">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          id={`image-upload-${label}`}
          disabled={isUploading}
        />

        <label
          htmlFor={`image-upload-${label}`}
          className={cn(
            "flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-2xl cursor-pointer transition-all relative overflow-hidden",
            "border-slate-200 bg-slate-50/50 hover:border-primary/50 hover:bg-primary/5",
            isUploading && "opacity-70 cursor-not-allowed",
            error && "border-red-300 bg-red-50",
          )}
        >
          {previewUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized // ป้องกันปัญหาเรื่อง domain image ถ้ามาจากที่อื่น
              />
              {!isUploading && (
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="size-8 text-primary animate-spin" />
                  <p className="text-xs font-medium text-slate-500">
                    กำลังอัปโหลด...
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="size-7 text-slate-400 group-hover:text-primary" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    คลิกเพื่ออัปโหลด
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                    PNG, JPG ไม่เกิน 2MB
                  </p>
                </>
              )}
            </div>
          )}
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <X className="size-3" /> {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
