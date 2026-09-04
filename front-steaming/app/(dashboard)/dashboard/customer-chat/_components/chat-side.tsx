/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ImagePlus,
  SendHorizontal,
  X,
  MapPin,
  Phone,
  User,
  Save,
  Loader2,
  CheckCheck,
  ShoppingBag,
  MessageSquare,
  Quote,
  Copy,
} from "lucide-react";
import Image from "next/image";
import {
  useMessagesBySender,
  useSendToAdmin,
  useReadMessageToAdmin,
  LatestConversation,
} from "@/hooks/useMessageToAdmin";

interface AttachedImage {
  file: File;
  previewUrl: string;
}

interface OrderFormData {
  customerName: string;
  phoneNumber: string;
  address: string;
  liveId: string;
  capturedMessage: string;
  messageToAdminId?: string;
}

interface ChatSideProps {
  selectedCustomer: LatestConversation | null;
  currentAdminName?: string;
  currentLiveId?: string;
}

const formatDisplayTime = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return "";
  }
};

export const ChatSide = ({
  selectedCustomer,
  currentAdminName = "Admin",
  currentLiveId = "",
}: ChatSideProps) => {
  const [text, setText] = useState("");
  const [images, setImages] = useState<AttachedImage[]>([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const senderId = selectedCustomer?.senderId;

  const {
    data: chatMessages = [],
    isLoading,
    isError,
  } = useMessagesBySender(senderId);
  const { mutate: sendMessage, isPending: isSending } = useSendToAdmin();
  const { mutate: markRead } = useReadMessageToAdmin();

  useEffect(() => {
    if (selectedCustomer?.senderId && !selectedCustomer.readed) {
      markRead({ senderId: selectedCustomer.senderId });
    }
  }, [selectedCustomer, markRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const [orderForm, setOrderForm] = useState<OrderFormData>({
    customerName: selectedCustomer?.senderName || "",
    phoneNumber: "",
    address: "",
    liveId: currentLiveId,
    capturedMessage: "",
    messageToAdminId: undefined,
  });

  useEffect(() => {
    if (selectedCustomer) {
      setOrderForm((prev) => ({
        ...prev,
        customerName: selectedCustomer.senderName || "",
        capturedMessage: "",
        messageToAdminId: undefined,
        liveId: currentLiveId,
      }));
    }
  }, [selectedCustomer, currentLiveId]);

  const handleSelectMessageForOrder = (msgId: string, content: string) => {
    setOrderForm((prev) => ({
      ...prev,
      messageToAdminId: msgId,
      capturedMessage: content,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: AttachedImage[] = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[indexToRemove].previewUrl);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  const handleSend = () => {
    if (!text.trim() && images.length === 0) return;
    if (!senderId) return;

    sendMessage(
      {
        senderId,
        senderName: currentAdminName,
        content: text.trim(),
        senderType: "ADMIN",
      },
      {
        onSuccess: () => {
          setText("");
          images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
          setImages([]);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.customerName || !orderForm.phoneNumber) {
      alert("กรุณากรอกชื่อและเบอร์โทรศัพท์ลูกค้า");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const payload = {
        userId: senderId,
        liveId: orderForm.liveId || "default-live-id",
        customerName: orderForm.customerName,
        phoneNumber: orderForm.phoneNumber,
        address: orderForm.address,
        capturedMessage: orderForm.capturedMessage,
        messageToAdminId: orderForm.messageToAdminId,
      };

      console.log("บันทึกคำสั่งซื้อ:", payload);
      alert("บันทึกคำสั่งซื้อเรียบร้อยแล้ว");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (!selectedCustomer) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center h-full text-muted-foreground gap-3 bg-muted/10">
        <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center">
          <MessageSquare className="size-8 stroke-1 text-muted-foreground/60" />
        </div>
        <div className="text-center space-y-1">
          <h4 className="text-sm font-semibold text-foreground">
            ยังไม่ได้เลือกการสนทนา
          </h4>
          <p className="text-xs text-muted-foreground">
            เลือกลูกค้าจากรายการทางด้านซ้ายเพื่อเปิดห้องสนทนา
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row flex-1 h-screen overflow-hidden bg-background">
      {/* 1. Chat Area */}
      <div className="flex flex-1 flex-col h-full border-r min-w-0 bg-zinc-50/60 dark:bg-zinc-950/40">
        {/* Header แชท */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b bg-background shadow-xs">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border shadow-xs">
              <AvatarFallback className="font-semibold text-xs bg-primary/10 text-primary">
                {selectedCustomer.senderName?.slice(0, 2).toUpperCase() || "CU"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-semibold leading-none">
                  {selectedCustomer.senderName || "ลูกค้าไม่ระบุชื่อ"}
                </h5>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4.5 px-1.5 font-normal"
                >
                  ลูกค้า
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono mt-1 block">
                ID: {selectedCustomer.senderId}
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className="gap-1.5 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 text-xs px-2.5 py-0.5"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            กำลังสนทนา
          </Badge>
        </div>

        {/* Message Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>กำลังโหลดข้อความ...</span>
            </div>
          ) : isError ? (
            <div className="flex h-full items-center justify-center text-xs text-destructive">
              ไม่สามารถโหลดข้อความได้
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              ยังไม่มีข้อความในการสนทนานี้
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isAdmin = msg.senderType !== "MEMBER";

              return (
                <div
                  key={msg.id}
                  className={`w-full flex ${isAdmin ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[70%] ${
                      isAdmin ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar ฝั่งลูกค้า */}
                    {!isAdmin && (
                      <Avatar className="size-8 shrink-0 mt-0.5 border shadow-xs">
                        <AvatarFallback className="text-[11px] font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {msg.senderName?.slice(0, 2).toUpperCase() || "CU"}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* กล่องข้อความและเวลา */}
                    <div
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      {/* ชื่อผู้ส่งของลูกค้า */}
                      {!isAdmin && (
                        <span className="text-[11px] font-medium text-zinc-500 mb-1 px-1">
                          {msg.senderName}
                        </span>
                      )}

                      {/* Bubble ข้อความ */}
                      <div
                        className={`relative px-4 py-2.5 text-xs sm:text-sm shadow-xs leading-relaxed transition-all break-words ${
                          isAdmin
                            ? "bg-blue-600! text-white rounded-2xl rounded-tr-xs"
                            : "bg-white dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>

                        {/* ปุ่มดึงข้อความไปเปิดออเดอร์ (เฉพาะฝั่งลูกค้า) */}
                        {!isAdmin && (
                          <div className="mt-2 pt-2 border-t border-zinc-200/70 dark:border-zinc-700 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectMessageForOrder(msg.id, msg.content)
                              }
                              className="inline-flex items-center gap-1.5 text-[11px] font-medium py-1 px-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                            >
                              <Copy className="size-3" />
                              ใช้เปิดออเดอร์นี้
                            </button>
                          </div>
                        )}
                      </div>

                      {/* เวลาและสถานะการส่ง */}
                      <div
                        className={`flex items-center gap-1 mt-1 px-1 text-[10px] text-zinc-400 font-mono ${
                          isAdmin ? "justify-end" : "justify-start"
                        }`}
                      >
                        <span>{formatDisplayTime(msg.createdAt)}</span>
                        {isAdmin && (
                          <CheckCheck className="size-3.5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* แถบพิมพ์ข้อความ */}
        <div className="p-3.5 border-t bg-background">
          <div className="flex flex-col rounded-2xl border bg-card p-1.5 shadow-xs focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 border-b mb-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group size-14 rounded-lg overflow-hidden border bg-muted"
                  >
                    <Image
                      src={img.previewUrl}
                      alt="preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-0.5 right-0.5 size-4 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-black"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="size-8 text-muted-foreground hover:text-foreground shrink-0 rounded-full"
                title="แนบรูปภาพ"
              >
                <ImagePlus className="size-4.5" />
              </Button>

              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="พิมพ์ข้อความตอบกลับในฐานะแอดมิน..."
                disabled={isSending}
                className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm outline-none placeholder:text-muted-foreground"
              />

              <Button
                type="button"
                size="icon"
                onClick={handleSend}
                disabled={(!text.trim() && images.length === 0) || isSending}
                className="size-8 shrink-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <SendHorizontal className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right Sidebar: ฟอร์มจัดการ Order */}
      <div className="w-80 xl:w-96 flex flex-col h-full bg-background border-l shrink-0">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950/50">
              <ShoppingBag className="size-4" />
            </div>
            <div>
              <h4 className="font-semibold text-sm leading-tight">
                บันทึกคำสั่งซื้อ
              </h4>
              <p className="text-[11px] text-muted-foreground">
                ผูกแชทและสร้าง Order
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[11px] font-normal">
            New Order
          </Badge>
        </div>

        <form
          onSubmit={handleSaveOrder}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {/* ข้อความสั่งซื้อที่ Capture มา */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Quote className="size-3.5" /> ข้อความที่สั่งซื้อ (Captured)
              </span>
              {orderForm.messageToAdminId && (
                <span className="text-[10px] text-primary font-medium">
                  ผูกข้อความแล้ว
                </span>
              )}
            </Label>
            <Textarea
              rows={2}
              value={orderForm.capturedMessage}
              onChange={(e) =>
                setOrderForm({ ...orderForm, capturedMessage: e.target.value })
              }
              placeholder="คลิก 'ใช้เปิดออเดอร์นี้' จากแชท หรือพิมพ์ข้อความที่นี่..."
              className="resize-none text-xs bg-muted/30 focus:bg-background"
            />
          </div>

          <Separator />

          {/* ข้อมูลลูกค้า */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="customerName"
                className="text-xs flex items-center gap-1.5 text-foreground font-medium"
              >
                <User className="size-3.5 text-muted-foreground" /> ชื่อผู้รับ
              </Label>
              <Input
                id="customerName"
                value={orderForm.customerName}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, customerName: e.target.value })
                }
                placeholder="ชื่อ-นามสกุลลูกค้า"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="phoneNumber"
                className="text-xs flex items-center gap-1.5 text-foreground font-medium"
              >
                <Phone className="size-3.5 text-muted-foreground" />{" "}
                เบอร์โทรศัพท์
              </Label>
              <Input
                id="phoneNumber"
                value={orderForm.phoneNumber}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, phoneNumber: e.target.value })
                }
                placeholder="08X-XXX-XXXX"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="address"
                className="text-xs flex items-center gap-1.5 text-foreground font-medium"
              >
                <MapPin className="size-3.5 text-muted-foreground" />{" "}
                ที่อยู่จัดส่ง
              </Label>
              <Textarea
                id="address"
                rows={4}
                value={orderForm.address}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, address: e.target.value })
                }
                placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
                className="resize-none text-xs leading-relaxed"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmittingOrder}
              className="w-full h-10 rounded-xl gap-2 font-medium text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              {isSubmittingOrder ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              บันทึกคำสั่งซื้อ (Create Order)
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatSide;
