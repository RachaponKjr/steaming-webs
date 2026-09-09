/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Radio,
  SendHorizontal,
  Sparkles,
  Headphones,
  User,
  Users,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  RotateCw,
  Minimize2,
  Heart,
  Flame,
} from "lucide-react";
import { useLiveChat } from "@/hooks/useLiveChat";
import { useLiveMessageStream, useSendMessage } from "@/hooks/useLiveMessage";
import { useSendToAdmin, useMessagesBySender } from "@/hooks/useMessageToAdmin";
import { useViewerLivekitToken } from "@/hooks/useLivekitToken";

// LiveKit Integration
import {
  LiveKitRoom,
  VideoTrack,
  useTracks,
  AudioTrack,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import Image from "next/image";

const STORAGE_NAME_KEY = "guest_customer_name";

const formatTime = (dateStr?: string) => {
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

interface FloatingReaction {
  id: number;
  Icon: React.ElementType;
  color: string;
  left: number; // percentage
}

function LiveStreamPlayer() {
  const videoTracks = useTracks(
    [Track.Source.Camera, Track.Source.ScreenShare],
    {
      onlySubscribed: true,
    },
  );
  const audioTracks = useTracks([Track.Source.Microphone], {
    onlySubscribed: true,
  });

  const hostVideoTrack = videoTracks[0];
  const hostAudioTrack = audioTracks[0];

  if (!hostVideoTrack) {
    return (
      <div className="flex flex-col absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 text-zinc-400">
        <Loader2 className="size-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">รอสัญญาณถ่ายทอดสดจากทางร้าน...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
      <VideoTrack
        trackRef={hostVideoTrack}
        className="w-full h-full object-cover lg:object-contain max-h-screen -scale-x-100"
      />
      {hostAudioTrack && <AudioTrack trackRef={hostAudioTrack} />}
    </div>
  );
}

export default function HomePage({ liveId }: { liveId: string }) {
  const [userName, setUserName] = useState<string>("");
  const [inputName, setInputName] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [roomError, setRoomError] = useState<string>("");
  const [chatInput, setChatInput] = useState<string>("");
  const [floatingReactions, setFloatingReactions] = useState<
    FloatingReaction[]
  >([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mobileChatScrollRef = useRef<HTMLDivElement>(null);
  const adminMessagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dmInput, setDmInput] = useState<string>("");

  const {
    data: rawMessages,
    isLoading,
    isError,
  } = useLiveMessageStream(liveId);
  const sendMessageMutation = useSendMessage();
  const messages = Array.isArray(rawMessages) ? rawMessages : [];

  useEffect(() => {
    const savedName = localStorage.getItem(STORAGE_NAME_KEY);
    if (savedName && savedName.trim() !== "") {
      setUserName(savedName.trim());
      setIsDialogOpen(false);
    } else {
      setIsDialogOpen(true);
    }
    setIsLoaded(true);
  }, []);

  const {
    token: viewerToken,
    wsUrl,
    error: tokenError,
  } = useViewerLivekitToken(liveId, userName, false);

  const { viewerCount, isConnected, guestId } = useLiveChat(liveId, userName);

  const currentSenderId = guestId || `guest_${userName}`;
  const { data: adminHistory = [], isLoading: isLoadingAdminHistory } =
    useMessagesBySender(currentSenderId);
  const { mutate: sendToAdmin, isPending: isSendingToAdmin } = useSendToAdmin();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    mobileChatScrollRef.current?.scrollTo({
      top: mobileChatScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    adminMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [adminHistory]);

  const toggleOrientationAndFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
        const orientation = screen.orientation as ScreenOrientation & {
          lock?: (o: string) => Promise<void>;
        };
        await orientation?.lock?.("landscape").catch(() => {});
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        if (screen.orientation && "unlock" in screen.orientation) {
          screen.orientation.unlock();
        }
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    const cleanName = inputName.trim();
    localStorage.setItem(STORAGE_NAME_KEY, cleanName);
    setUserName(cleanName);
    setIsDialogOpen(false);
    setInputName("");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !isConnected) return;

    sendMessageMutation.mutate({
      liveId,
      senderId: currentSenderId,
      senderName: userName || "ผู้เข้าชม",
      message: chatInput.trim(),
    });
    setChatInput("");
  };

  const triggerFloatingReaction = (type: "heart" | "fire" | "sparkles") => {
    const icons = {
      heart: { Icon: Heart, color: "text-rose-500 fill-rose-500" },
      fire: { Icon: Flame, color: "text-amber-500 fill-amber-500" },
      sparkles: { Icon: Sparkles, color: "text-yellow-400 fill-yellow-400" },
    };

    const selected = icons[type];
    const newReaction: FloatingReaction = {
      id: Date.now() + Math.random(),
      Icon: selected.Icon,
      color: selected.color,
      left: Math.floor(Math.random() * 60) + 20, // สุ่มตำแหน่งแนวนอน 20% - 80%
    };

    setFloatingReactions((prev) => [...prev, newReaction]);

    // เอาออกหลังจาก animation เล่นจบ (ประมาณ 2 วินาที)
    setTimeout(() => {
      setFloatingReactions((prev) =>
        prev.filter((r) => r.id !== newReaction.id),
      );
    }, 2000);
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground animate-pulse">
          กำลังเตรียมห้องไลฟ์...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-dvh overflow-hidden bg-black flex"
    >
      {/* CSS สำหรับเอฟเฟกต์ลอยขึ้น (Floating Animation) */}
      <style jsx global>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0px) scale(0.6);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translateY(-40px) scale(1.2);
          }
          100% {
            transform: translateY(-280px) scale(1);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: floatUp 2s ease-out forwards;
        }
      `}</style>

      {/* 1. Modal บังคับระบุชื่อ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md [&>button]:hidden bg-card border shadow-2xl">
          <DialogHeader className="text-center space-y-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="size-6" />
            </div>
            <DialogTitle className="text-xl font-bold">
              ยินดีต้อนรับสู่ Live Stream
            </DialogTitle>
            <DialogDescription>
              กรุณาระบุชื่อของคุณเพื่อเริ่มชมไลฟ์และพูดคุยกับทางร้าน
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveName} className="space-y-4 pt-2">
            <Input
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="กรอกชื่อของคุณ (เช่น น้องมิลค์, ลูกค้า A)"
              className="h-11 text-center text-base"
              autoFocus
            />

            <Button
              type="submit"
              size="lg"
              disabled={!inputName.trim()}
              className="w-full h-11 rounded-xl gap-2 font-medium"
            >
              <Sparkles className="size-4" /> เริ่มต้นรับชม & แชต
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Main Live Video + TikTok Style Overlay (Mobile) */}
      <div className="relative flex-1 h-full bg-zinc-950 overflow-hidden flex items-center justify-center">
        <div className="absolute top-20 left-4 flex flex-col justify-center items-center gap-2 ">
          <Image
            src="/qrcode.jpg"
            alt="Live Background"
            width={250}
            height={250}
            className="z-20 hidden md:block"
          />
          <span className="z-20 hidden md:block text-[#333333]">
            ติดต่อสอบถาม
          </span>
        </div>
        <div className="flex flex-col justify-center items-center gap-2 absolute top-18 left-3 ">
          <Image
            src="/qrcode.jpg"
            alt="Live Background"
            width={120}
            height={120}
            className="z-20 md:hidden"
          />
          <span className="z-20 md:hidden text-[#333333]">ติดต่อสอบถาม</span>
        </div>
        {/* Header Overlay Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <Badge
              variant="destructive"
              className="gap-1.5 px-3 py-1 font-semibold animate-pulse"
            >
              <Radio className="size-3.5" /> LIVE
            </Badge>
            <Badge
              variant="secondary"
              className="gap-1.5 px-2.5 py-1 bg-black/60 text-white backdrop-blur-md border border-white/10"
            >
              <Users className="size-3.5" /> {viewerCount}
            </Badge>
            {userName && (
              <Badge
                variant="outline"
                className="bg-black/60 text-white backdrop-blur-md border-white/10 hidden sm:inline-flex"
              >
                คุณ: {userName}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <Button
              size="icon"
              variant="secondary"
              onClick={toggleOrientationAndFullscreen}
              className="size-12 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/10"
              title="หมุนจอแนวนอน"
            >
              {isFullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <RotateCw className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* 📱 TikTok Style Floating Chat & Input on Mobile */}
        <div className="lg:hidden absolute inset-x-0 bottom-0 z-30 flex flex-col justify-end p-3 pointer-events-none bg-gradient-to-t from-black/80 via-black/30 to-transparent pb-safe">
          {/* กล่องข้อความแชตลอยซ้ายล่าง */}
          <div
            ref={mobileChatScrollRef}
            className="w-full max-h-48 overflow-y-auto space-y-1.5 mb-2 pointer-events-auto pr-2 no-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="text-[11px] text-zinc-400 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-xl w-fit">
                ยินดีต้อนรับสู่ห้องไลฟ์สด ทักทายพูดคุยกันได้เลย 👋
              </div>
            ) : (
              messages.map((item) => {
                const isMe = item.senderName === userName;
                const isOrderMsg = item.message?.startsWith("🛍️");
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[10px] text-zinc-300 font-medium px-1 drop-shadow">
                      {item.senderName}
                    </span>
                    <div
                      className={`px-3 py-1.5 rounded-2xl text-xs max-w-full break-words backdrop-blur-md shadow-md ${
                        isMe
                          ? "bg-blue-600/90 text-white rounded-tr-xs"
                          : isOrderMsg
                            ? "bg-amber-600/90 text-white rounded-tl-xs"
                            : "bg-black/60 border border-white/10 text-zinc-100 rounded-tl-xs"
                      }`}
                    >
                      {item.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* แถบพิมพ์ข้อความสไตล์ TikTok ติดขอบจอล่าง */}
          <div className="flex gap-2 pointer-events-auto items-center">
            <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="แสดงความคิดเห็น..."
                disabled={!isConnected}
                className="flex-1 rounded-full h-10 text-xs bg-black/60 border-white/20 text-white placeholder:text-zinc-400 backdrop-blur-md focus-visible:ring-blue-500"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!chatInput.trim() || !isConnected}
                className="rounded-full size-10 bg-blue-600 hover:bg-blue-500 shrink-0 shadow-lg"
              >
                <SendHorizontal className="size-4 text-white" />
              </Button>
            </form>

            {/* ปุ่มกดส่งไอคอนลอยๆ ด้านขวาช่องพิมพ์ */}
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => triggerFloatingReaction("heart")}
              className="rounded-full size-10 bg-black/60 border border-white/20 hover:bg-rose-500/30 text-rose-500 backdrop-blur-md shrink-0 shadow-lg"
            >
              <Heart className="size-4 fill-rose-500" />
            </Button>
          </div>
        </div>

        {/* 🎈 ไอคอนลอยขึ้นจอ (Floating Reactions Container) */}
        <div className="absolute right-4 bottom-24 lg:bottom-12 z-40 w-24 h-72 pointer-events-none overflow-hidden">
          {floatingReactions.map((item) => {
            const { id, Icon, color } = item;
            return (
              <div
                key={id}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-float-up pointer-events-none"
              >
                <div
                  className={`p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-xl ${color}`}
                >
                  <Icon className="size-6" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Video Player */}
        {viewerToken && wsUrl ? (
          <LiveKitRoom
            token={viewerToken}
            serverUrl={wsUrl}
            connect={true}
            video={false}
            audio={true}
            data-lk-theme="default"
            className="w-full h-full"
            onError={(err) => setRoomError(err.message)}
            onConnected={() => setRoomError("")}
          >
            <LiveStreamPlayer />

            <RoomAudioRenderer />
            <StartAudio label="คลิกเพื่อเปิดเสียงไลฟ์สด" />
            {roomError && (
              <div className="absolute inset-x-0 bottom-0 z-20 bg-black/80 text-rose-300 text-[11px] px-3 py-2 text-center">
                เชื่อมต่อสัญญาณไม่สำเร็จ กำลังลองใหม่... ({roomError})
              </div>
            )}
          </LiveKitRoom>
        ) : tokenError ? (
          <div className="text-rose-400 text-xs text-center px-6 space-y-1">
            <p className="font-medium">ไม่สามารถขอสิทธิ์เข้าห้องไลฟ์ได้</p>
            <p className="text-zinc-500">{(tokenError as Error).message}</p>
          </div>
        ) : (
          <div className="text-zinc-500 text-xs flex items-center gap-2">
            <Loader2 className="size-5 animate-spin text-primary" />
            กำลังเชื่อมต่อห้องถ่ายทอดสด...
          </div>
        )}
      </div>

      {/* 3. Desktop Chat Sidebar (ฝั่งขวาถาวรบนจอคอม) */}
      <div className="hidden lg:flex w-md h-full flex-col bg-zinc-950 border-l border-zinc-800 text-zinc-100 shrink-0">
        <Tabs
          defaultValue="livechat"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsContent
            value="livechat"
            className="flex-1 flex flex-col overflow-hidden m-0"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="text-center text-xs text-zinc-500 py-10">
                  กำลังโหลดข้อความ...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-xs text-zinc-500 py-10">
                  ยังไม่มีข้อความ... เริ่มพิมพ์ทักทายได้เลย!
                </div>
              ) : (
                messages.map((item) => {
                  const isMe = item.senderName === userName;
                  const isOrderMsg = item.message?.startsWith("🛍️");

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[11px] text-zinc-400 font-medium px-1 mb-0.5">
                        {item.senderName}
                      </span>
                      <div
                        className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] break-words ${
                          isMe
                            ? "bg-blue-600 text-white rounded-tr-xs"
                            : isOrderMsg
                              ? "bg-amber-600 text-white rounded-tl-xs"
                              : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-xs"
                        }`}
                      >
                        {item.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* แถบส่งข้อความ + ปุ่มกดส่งไอคอนลอยฝั่ง Desktop */}
            <div className="p-3.5 border-t border-zinc-800 bg-zinc-900/50 flex flex-col gap-2">
              <div className="flex items-center justify-around px-2 py-1 bg-zinc-950 rounded-xl border border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => triggerFloatingReaction("heart")}
                  className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 gap-1.5 text-xs h-8"
                >
                  <Heart className="size-4 fill-rose-500" /> เลิฟๆ
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => triggerFloatingReaction("fire")}
                  className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 gap-1.5 text-xs h-8"
                >
                  <Flame className="size-4 fill-amber-500" /> ไฟลุก
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => triggerFloatingReaction("sparkles")}
                  className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 gap-1.5 text-xs h-8"
                >
                  <Sparkles className="size-4 fill-yellow-400" /> สวยงาม
                </Button>
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    isConnected ? "พิมพ์ข้อความในไลฟ์..." : "กำลังเชื่อมต่อ..."
                  }
                  disabled={!isConnected}
                  className="flex-1 rounded-xl h-10 text-xs bg-zinc-950 border-zinc-800 text-zinc-100"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!chatInput.trim() || !isConnected}
                  className="rounded-xl size-10 bg-blue-600 hover:bg-blue-500"
                >
                  <SendHorizontal className="size-4" />
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
