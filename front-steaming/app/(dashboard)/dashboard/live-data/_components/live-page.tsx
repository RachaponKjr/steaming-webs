"use client";

import React, { useState } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  MessageSquare,
  ShoppingBag,
  Phone,
  MapPin,
  User,
  AlertCircle,
  RotateCw,
} from "lucide-react";
import { useLiveAll } from "@/hooks/useLiveSession";

export type LiveStatus = "IDLE" | "STREAMING" | "ENDED";

export interface LiveMessageItem {
  id: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  userId: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  capturedMessage?: string | null;
  messageToAdmin?: {
    content: string;
    senderName: string;
  } | null;
  createdAt: string;
}

export interface LiveRoomItem {
  id: string;
  title: string;
  streamKey: string;
  status: LiveStatus;
  creatorId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  liveDate: string;
  createdAt: string;
  updatedAt: string;
  creator: { id: string; name: string } | null;
  _count: {
    orders: number;
    messages: number;
  };
  messages: LiveMessageItem[];
  orders?: OrderItem[];
}

export default function LiveDataPage() {
  const [selectedRoom, setSelectedRoom] = useState<LiveRoomItem | null>(null);
  const [activeModal, setActiveModal] = useState<"chat" | "orders" | null>(
    null,
  );

  const { data: rooms, isLoading, isError, error, refetch } = useLiveAll();

  const formatDateTime = (isoDate: string | null) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStatusBadge = (status: LiveStatus) => {
    switch (status) {
      case "STREAMING":
        return (
          <Badge
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-700 animate-pulse"
          >
            กำลังไลฟ์
          </Badge>
        );
      case "ENDED":
        return <Badge variant="secondary">สิ้นสุดแล้ว</Badge>;
      case "IDLE":
      default:
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-300">
            เตรียมพร้อม
          </Badge>
        );
    }
  };

  // State: Error
  if (isError) {
    return (
      <div className="container mx-auto p-4 max-w-2xl py-16">
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-900 font-semibold">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </AlertTitle>
          <AlertDescription className="text-red-700 mt-2 text-sm">
            {error?.message ||
              "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง"}
          </AlertDescription>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2 border-red-300 bg-white hover:bg-red-100 text-red-800"
            >
              <RotateCw className="w-4 h-4" />
              ลองใหม่อีกครั้ง
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>รายการห้องไลฟ์สดประจำวัน</CardTitle>
          <CardDescription>
            ตารางแสดงสถิติ ข้อความแชท และรายการคำสั่งซื้อจัดส่งแยกตามแต่ละวัน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">วันที่ไลฟ์</TableHead>
                  <TableHead>ชื่อห้อง / ข้อมูล</TableHead>
                  <TableHead className="text-center">สถานะ</TableHead>
                  <TableHead className="text-center">ช่วงเวลาไลฟ์</TableHead>
                  <TableHead className="text-center">ข้อความแชท</TableHead>
                  <TableHead className="text-center">ยอดคำสั่งซื้อ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* State: Loading Skeleton */}
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <Skeleton className="h-5 w-36" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-5 w-28 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-8 w-20 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-6 w-16 mx-auto rounded-full" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : rooms && rooms.length > 0 ? (
                  rooms.map((room) => (
                    <TableRow key={room.id}>
                      {/* วันที่ไลฟ์ */}
                      <TableCell className="font-semibold text-zinc-900 whitespace-nowrap">
                        {formatDateOnly(room.liveDate)}
                      </TableCell>

                      {/* หัวข้อและ Stream Key */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900">
                            {room.title}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                            Key: {room.streamKey}
                          </span>
                        </div>
                      </TableCell>

                      {/* สถานะ */}
                      <TableCell className="text-center">
                        {renderStatusBadge(room.status)}
                      </TableCell>

                      {/* เวลาเริ่ม - จบ */}
                      <TableCell className="text-center text-sm text-zinc-600 whitespace-nowrap">
                        {formatDateTime(room.startedAt)} -{" "}
                        {formatDateTime(room.endedAt)}
                      </TableCell>

                      {/* จำนวนแชท */}
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-zinc-600 hover:text-zinc-900"
                          onClick={() => {
                            setSelectedRoom(room);
                            setActiveModal("chat");
                          }}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          {room._count.messages} ข้อความ
                        </Button>
                      </TableCell>

                      {/* จำนวนคำสั่งซื้อ */}
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className="font-medium bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          {room._count.orders} รายการ
                        </Badge>
                      </TableCell>

                      {/* ปุ่มดูคำสั่งซื้อ */}
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedRoom(room);
                            setActiveModal("orders");
                          }}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          ดูคำสั่งซื้อ
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center text-zinc-500"
                    >
                      ไม่พบข้อมูลห้องไลฟ์สด
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: ดูข้อความแชท */}
      <Dialog
        open={activeModal === "chat"}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>ข้อความแชท: {selectedRoom?.title}</DialogTitle>
            <DialogDescription>
              วันที่ {selectedRoom && formatDateOnly(selectedRoom.liveDate)}{" "}
              (ทั้งหมด {selectedRoom?._count.messages} ข้อความ)
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-80 w-full rounded-md border p-3">
            {selectedRoom?.messages?.length ? (
              <div className="space-y-3">
                {selectedRoom.messages.map((msg) => {
                  const isAdmin = msg.senderName.includes("[Admin]");
                  return (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-lg border text-sm ${
                        isAdmin
                          ? "bg-amber-50 border-amber-200"
                          : "bg-muted/50 border-border"
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                        <span
                          className={`font-semibold ${
                            isAdmin ? "text-amber-800" : "text-zinc-700"
                          }`}
                        >
                          {msg.senderName}
                        </span>
                        <span>{formatDateTime(msg.createdAt)}</span>
                      </div>
                      <p className="text-zinc-800">{msg.content}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                ไม่มีข้อความในไลฟ์นี้
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal: รายการคำสั่งซื้อ */}
      <Dialog
        open={activeModal === "orders"}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              คำสั่งซื้อ: {selectedRoom?.title}
            </DialogTitle>
            <DialogDescription>
              วันที่ {selectedRoom && formatDateOnly(selectedRoom.liveDate)} (พบ{" "}
              {selectedRoom?.orders?.length ?? selectedRoom?._count.orders ?? 0}{" "}
              รายการ)
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] w-full rounded-md border p-4">
            {selectedRoom?.orders?.length ? (
              <div className="space-y-4">
                {selectedRoom.orders.map((ord, idx) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm space-y-3"
                  >
                    <div className="flex justify-between items-start border-b pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {ord.customerName}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatDateTime(ord.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-700">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span>{ord.phoneNumber || "-"}</span>
                      </div>
                      <div className="flex items-start gap-2 col-span-full">
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-xs leading-relaxed text-zinc-600">
                          {ord.address || "ไม่ได้ระบุที่อยู่"}
                        </span>
                      </div>
                    </div>

                    {(ord.capturedMessage || ord.messageToAdmin?.content) && (
                      <div className="bg-blue-50/70 border border-blue-100 rounded p-2.5 text-xs text-blue-900">
                        <span className="font-semibold block mb-0.5">
                          ข้อความที่พิมพ์:
                        </span>
                        <p className="italic">
                          &quot;
                          {ord.capturedMessage || ord.messageToAdmin?.content}
                          &quot;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                ยังไม่มีคำสั่งซื้อสำหรับไลฟ์นี้
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
