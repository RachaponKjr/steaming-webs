"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Radio,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useAuthLogin } from "@/hooks/useAuth";

const SigninPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState("");

  // ดึง state และฟังก์ชันจาก Hook useAuthLogin
  const {
    login,
    isLoading,
    errorMessage: apiError,
    resetError,
  } = useAuthLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
    if (clientError) setClientError("");
    if (apiError) resetError();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setClientError("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
      return;
    }

    setClientError("");
    // ส่งข้อมูลเข้า mutation ของ TanStack Query (จัดการ redirect และ save token ใน hook อัตโนมัติ)
    login(formData);
  };

  const activeError = clientError || apiError;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-zinc-950 overflow-hidden text-zinc-100">
      {/* Decorative Glows */}
      <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md bg-zinc-900/80 border-zinc-800 backdrop-blur-xl shadow-2xl rounded-2xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2 shadow-inner">
            <Radio className="size-6 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            เข้าสู่ระบบผู้ดูแลระบบ
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            จัดการห้อง Live Streaming และระบบแชตหลังบ้าน
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Error Message Box */}
            {activeError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-in fade-in duration-200">
                <ShieldAlert className="size-4 shrink-0" />
                <span>{activeError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs text-zinc-300 flex items-center gap-1.5"
              >
                <Mail className="size-3.5 text-zinc-400" /> อีเมล (Email)
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="h-11 rounded-xl bg-zinc-800/60 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-primary focus-visible:border-primary"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs text-zinc-300 flex items-center gap-1.5"
                >
                  <Lock className="size-3.5 text-zinc-400" /> รหัสผ่าน
                  (Password)
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-11 rounded-xl bg-zinc-800/60 border-zinc-700 text-white placeholder:text-zinc-500 pr-10 focus-visible:ring-primary focus-visible:border-primary"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              variant={"outline"}
              disabled={isLoading}
              className="w-full h-11 rounded-xl text-base font-medium shadow-md transition-all gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />{" "}
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  เข้าสู่ระบบ <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default SigninPage;
