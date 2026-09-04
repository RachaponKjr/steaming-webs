"use client";

import React, { useState, useMemo } from "react";
import {
  User,
  Loader2,
  MessageSquareOff,
  Search,
  ShoppingBag,
} from "lucide-react";
import {
  useLatestConversations,
  LatestConversation,
  useReadMessageToAdmin,
} from "@/hooks/useMessageToAdmin";
import { Input } from "@/components/ui/input";

const formatDisplayTime = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return new Intl.DateTimeFormat("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    }

    return new Intl.DateTimeFormat("th-TH", {
      day: "2-digit",
      month: "short",
    }).format(date);
  } catch {
    return "";
  }
};

interface LeftSideProps {
  selectedSenderId?: string;
  onSelectCustomer?: (customer: LatestConversation) => void;
}

export const LeftSide = ({
  selectedSenderId,
  onSelectCustomer,
}: LeftSideProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: conversations = [],
    isLoading,
    isError,
    error,
  } = useLatestConversations();
  const { mutateAsync: readMessage } = useReadMessageToAdmin();

  const filteredConversations = useMemo(() => {
    return conversations.filter(
      (c) =>
        c.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.senderId?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [conversations, searchTerm]);

  const onClickCustomerCard = (customer: LatestConversation) => {
    if (onSelectCustomer) {
      onSelectCustomer(customer);
      if (customer.unreadCount > 0) {
        readMessage({ senderId: customer.senderId });
      }
    }
  };

  return (
    <div className="w-80 sm:w-96 flex flex-col h-screen border-r bg-background shrink-0 select-none">
      {/* Header */}
      <div className="p-3.5 border-b space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight">
              กล่องข้อความลูกค้า
            </span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-semibold text-primary">
              {conversations.length}
            </span>
          </div>
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อ, รหัส, ข้อความ..."
            className="pl-8 h-9 text-xs bg-muted/40 border-border/60 focus:bg-background"
          />
        </div>
      </div>

      {/* Customer List Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground text-xs">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span>กำลังโหลดรายการข้อความ...</span>
          </div>
        ) : isError ? (
          <div className="p-4 text-center text-xs text-destructive">
            เกิดข้อผิดพลาด: {error?.message}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground text-center p-4">
            <MessageSquareOff className="size-8 stroke-1 text-muted-foreground/50" />
            <p className="text-xs">
              {searchTerm
                ? "ไม่พบผลลัพธ์การค้นหา"
                : "ยังไม่มีข้อความส่งถึงแอดมิน"}
            </p>
          </div>
        ) : (
          filteredConversations.map((item) => (
            <CustomerCard
              key={item.id}
              customer={item}
              isSelected={selectedSenderId === item.senderId}
              onSelect={() => onClickCustomerCard(item)}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface CustomerCardProps {
  customer: LatestConversation;
  isSelected?: boolean;
  onSelect?: () => void;
}

const CustomerCard = ({
  customer,
  isSelected,
  onSelect,
}: CustomerCardProps) => {
  const hasUnread = customer.unreadCount > 0;
  const isOrder =
    customer.content.includes("CF") ||
    customer.content.includes("รับ") ||
    customer.content.includes("🛍️");

  return (
    <div
      onClick={onSelect}
      className={`group relative p-2.5 rounded-xl cursor-pointer transition-all duration-150 border ${
        isSelected
          ? "bg-primary/5 border-primary/40 shadow-2xs"
          : "bg-card hover:bg-muted/40 border-transparent hover:border-border/60"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar พร้อม Unread Indicator */}
        <div className="relative shrink-0 mt-0.5">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted/80 text-foreground border font-semibold text-xs">
            {customer.senderName ? (
              customer.senderName.slice(0, 2).toUpperCase()
            ) : (
              <User className="size-4" />
            )}
          </div>
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex size-2.5 rounded-full bg-red-500"></span>
            </span>
          )}
        </div>

        {/* รายละเอียดข้อความ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <h6 className="text-xs sm:text-sm font-semibold truncate text-foreground">
              {customer.senderName || "ลูกค้าไม่ระบุชื่อ"}
            </h6>
            <span
              className={`text-[10px] shrink-0 font-medium ${
                hasUnread ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              {formatDisplayTime(customer.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isOrder && (
              <span className="inline-flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                <ShoppingBag className="size-3 mr-0.5" /> [CF]
              </span>
            )}
            <p
              className={`text-xs truncate ${
                hasUnread
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {customer.content}
            </p>
          </div>
        </div>

        {/* Unread Counter Badge */}
        {hasUnread && (
          <div className="shrink-0 self-center">
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground font-bold shadow-2xs">
              {customer.unreadCount > 99 ? "99+" : customer.unreadCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSide;
