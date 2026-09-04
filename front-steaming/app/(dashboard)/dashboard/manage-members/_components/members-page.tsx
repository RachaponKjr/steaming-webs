"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  UserPlus,
  Search,
  Mail,
  Trash2,
  Lock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  useMembers,
  useCreateMember,
  useDeleteMember,
} from "@/hooks/useMembers";
import { AdminRole, CreateMemberPayload } from "@/services/member.service";

export default function AdminsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // 1. TanStack Query Hooks เชื่อมต่อ API หลังบ้าน
  const {
    data: members = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useMembers();
  const { mutate: createMember, isPending: isCreating } = useCreateMember();
  const { mutate: deleteMember, isPending: isDeleting } = useDeleteMember();

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateMemberPayload>({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
  });

  // Edit Modal State

  // Filter Logic
  const filteredAdmins = members.filter((admin) => {
    const matchesSearch =
      admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "ALL" || admin.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Handle Create Admin
  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !createFormData.name ||
      !createFormData.email ||
      !createFormData.password
    ) {
      return;
    }

    createMember(createFormData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setCreateFormData({
          name: "",
          email: "",
          password: "",
          role: "ADMIN",
        });
      },
    });
  };

  // Render Role Badge
  const renderRoleBadge = (role: AdminRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/30 gap-1 text-[11px]">
            <ShieldAlert className="size-3" /> SUPER ADMIN
          </Badge>
        );
      case "ADMIN":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/30 gap-1 text-[11px]">
            <ShieldCheck className="size-3" /> ADMIN
          </Badge>
        );
      case "MODERATOR":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/30 gap-1 text-[11px]">
            <Shield className="size-3" /> MODERATOR
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  // Metrics คำนวณจากข้อมูล Array จริง
  const totalSuperAdmins = members.filter(
    (a) => a.role === "SUPER_ADMIN",
  ).length;
  const totalAdmins = members.filter((a) => a.role === "ADMIN").length;
  const totalMods = members.filter((a) => a.role === "MODERATOR").length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-[1600px] mx-auto">
      {/* 1. Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            จัดการผู้ดูแลระบบ (Admins)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            กำหนดสิทธิ์และจัดการรายชื่อทีมงานผู้ดูแลระบบสตรีมมิง
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-1.5"
          >
            <RefreshCw
              className={`size-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            รีเฟรช
          </Button>
          <Button
            size="lg"
            className="gap-1.5 rounded-md"
            onClick={() => setIsCreateOpen(true)}
          >
            <UserPlus className="size-4" /> เพิ่มผู้ดูแลใหม่
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">แอดมินทั้งหมด</CardTitle>
            <Shield className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ผู้มีสิทธิ์เข้าถึงระบบ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Super Admin</CardTitle>
            <ShieldAlert className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuperAdmins}</div>
            <p className="text-xs text-muted-foreground mt-1">
              สิทธิ์สูงสุดในระบบ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admin</CardTitle>
            <ShieldCheck className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdmins}</div>
            <p className="text-xs text-muted-foreground mt-1">
              จัดการห้องสตรีม & สินค้า
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Moderator</CardTitle>
            <Shield className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMods}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ผู้ดูแลแชท & ความเรียบร้อย
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Table & Filters Area */}
      <Card>
        <CardHeader className="p-4 md:p-6 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base md:text-lg font-semibold">
                รายชื่อแอดมินทั้งหมด
              </CardTitle>
              <CardDescription className="text-xs">
                แสดงผลผู้ดูแลระบบ ({filteredAdmins.length} บัญชี)
              </CardDescription>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาชื่อ, อีเมล หรือ ID..."
                  className="pl-8 h-9 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select
                value={roleFilter}
                onValueChange={(val) => setRoleFilter(val as string)}
              >
                <SelectTrigger className="h-9 text-xs w-[140px]">
                  <SelectValue placeholder="ระดับสิทธิ์ (Role)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ทุกระดับสิทธิ์</SelectItem>
                  <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="MODERATOR">MODERATOR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="w-[300px]">
                    ผู้ดูแล (Name / ID)
                  </TableHead>
                  <TableHead>อีเมลติดต่อ</TableHead>
                  <TableHead>บทบาท (Role)</TableHead>
                  <TableHead>วันที่สร้างบัญชี</TableHead>
                  <TableHead>อัปเดตล่าสุด</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-xs text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="size-6 animate-spin text-primary" />
                        <span>กำลังโหลดรายชื่อแอดมิน...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-xs text-destructive"
                    >
                      เกิดข้อผิดพลาดในการโหลดข้อมูล: {error?.message}
                    </TableCell>
                  </TableRow>
                ) : filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-xs text-muted-foreground"
                    >
                      ไม่พบข้อมูลแอดมินตามเงื่อนไขที่ค้นหา
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin.id} className="text-xs">
                      {/* Name & Avatar */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarFallback className="font-semibold text-xs bg-primary/10 text-primary">
                              {admin.name
                                ? admin.name.substring(0, 2).toUpperCase()
                                : "AD"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">
                              {admin.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              ID: {admin.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Email */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="size-3" />
                          <span>{admin.email}</span>
                        </div>
                      </TableCell>

                      {/* Role Badge */}
                      <TableCell>{renderRoleBadge(admin.role)}</TableCell>

                      {/* Created At */}
                      <TableCell className="text-muted-foreground">
                        {new Date(admin.createdAt).toLocaleDateString("th-TH", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>

                      {/* Updated At */}
                      <TableCell className="text-muted-foreground">
                        {new Date(admin.updatedAt).toLocaleDateString("th-TH", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="flex justify-end text-muted-foreground ">
                        <Dialog>
                          <DialogTrigger>
                            <Button size={"icon-lg"} variant={"destructive"}>
                              <Trash2 />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="text-base font-semibold">
                                ลบบัญชีผู้ดูแลระบบใหม่
                              </DialogTitle>
                              <DialogDescription className="text-xs">
                                คุณต้องการลบบัญชีผู้ดูแลระบบนี้จริงหรือไม่?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose>
                                <Button variant={"outline"}>ยกเลิก</Button>
                              </DialogClose>
                              <Button
                                variant={"destructive"}
                                onClick={() => deleteMember(admin.id)}
                              >
                                ลบบัญชี
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 4. Create Admin Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              เพิ่มผู้ดูแลระบบใหม่
            </DialogTitle>
            <DialogDescription className="text-xs">
              สร้างบัญชี Admin สำหรับเข้าใช้งานระบบควบคุมห้องสตรีม
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAdmin} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">ชื่อ-นามสกุล</Label>
              <Input
                placeholder="เช่น สมชาย ใจดี"
                value={createFormData.name}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, name: e.target.value })
                }
                className="h-8 text-xs"
                required
                disabled={isCreating}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">อีเมล (Email)</Label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={createFormData.email}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    email: e.target.value,
                  })
                }
                className="h-8 text-xs"
                required
                disabled={isCreating}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">รหัสผ่าน (Password)</Label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="อย่างน้อย 6-8 ตัวอักษร"
                  value={createFormData.password}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      password: e.target.value,
                    })
                  }
                  className="h-8 text-xs pr-8"
                  required
                  disabled={isCreating}
                />
                <Lock className="absolute right-2.5 top-2.5 size-3.5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">ระดับสิทธิ์ (Role)</Label>
              <Select
                value={createFormData.role}
                onValueChange={(val) =>
                  setCreateFormData({
                    ...createFormData,
                    role: val as AdminRole,
                  })
                }
                disabled={isCreating}
              >
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MODERATOR">
                    MODERATOR (ดูแลแชท/ความเรียบร้อย)
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    ADMIN (จัดการสตรีมและสินค้า)
                  </SelectItem>
                  <SelectItem value="SUPER_ADMIN">
                    SUPER_ADMIN (สิทธิ์สูงสุด)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                disabled={isCreating}
                onClick={() => setIsCreateOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />{" "}
                    กำลังบันทึก...
                  </>
                ) : (
                  "สร้างบัญชี"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
