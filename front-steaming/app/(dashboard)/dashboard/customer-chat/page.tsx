/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import LeftSide from "./_components/left-side";
import ChatSide from "./_components/chat-side";
import {
  LatestConversation,
  useLatestConversations,
} from "@/hooks/useMessageToAdmin";

export default function AdminInboxPage() {
  const [selectedCustomer, setSelectedCustomer] =
    useState<LatestConversation | null>(null);

  // ดึงรายการข้อความทั้งหมดเพื่อตั้งค่าเลือกคนแรกอัตโนมัติ (Default Active)
  const { data: conversations = [] } = useLatestConversations();
  console.log(conversations, "CONVERSATIONS");
  useEffect(() => {
    if (!selectedCustomer && conversations.length > 0) {
      setSelectedCustomer(conversations[0]);
    }
  }, [conversations, selectedCustomer]);

  return (
    <div className="flex flex-1 h-screen max-h-screen overflow-hidden bg-background">
      {/* ฝั่งซ้าย: รายการ Inbox */}
      <LeftSide
        selectedSenderId={selectedCustomer?.senderId}
        onSelectCustomer={(customer) => setSelectedCustomer(customer)}
      />

      {/* ฝั่งขวา: ห้องสนทนาและข้อมูลจัดส่ง */}
      <ChatSide selectedCustomer={selectedCustomer} currentAdminName="Admin" />
    </div>
  );
}
