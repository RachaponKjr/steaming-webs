// app/page.tsx
"use client";

import { useTodayLiveSession } from "@/hooks/useLiveSession";
import {
  CheckingLiveScreen,
  LiveEndedScreen,
  NoLiveTodayScreen,
  WaitingLiveScreen,
} from "./live-status-screens";
import HomePage from "./home-page";

export default function LiveViewerEntry() {
  // ฝั่งผู้ชม -> isCreator = false เพื่อไม่ให้ backend ส่ง streamKey/RTMP มาด้วย
  const { data: todaySession, isLoading } = useTodayLiveSession(false);
  // 1. กำลังเช็คสถานะ
  if (isLoading) {
    return <CheckingLiveScreen />;
  }

  // 2. วันนี้ยังไม่มีไลฟ์เลย
  if (!todaySession) {
    return <NoLiveTodayScreen />;
  }

  // 3. มีห้องแล้วแต่ยังไม่เริ่ม (แอดมินยังไม่กด GO LIVE)
  if (todaySession.status === "IDLE") {
    return <WaitingLiveScreen title={todaySession.title} />;
  }

  // 4. ไลฟ์จบไปแล้ว
  if (todaySession.status === "ENDED") {
    return <LiveEndedScreen title={todaySession.title} />;
  }

  // 5. กำลังไลฟ์สด -> เข้าหน้า HomePage ปกติ
  return <HomePage liveId={todaySession.id} />;
}
