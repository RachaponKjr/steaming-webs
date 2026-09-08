/* eslint-disable react-hooks/set-state-in-effect */
// app/(dashboard)/dashboard/_components/dashboard-page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Radio,
  Users,
  MessageSquare,
  Settings,
  Send,
  Key,
  Copy,
  Check,
  Share2,
  StopCircle,
  PlayCircle,
  Clock,
  ShoppingBag,
  Globe,
  Tag,
  Loader2,
  Save,
} from "lucide-react";
import { useLiveMessageStream, useSendMessage } from "@/hooks/useLiveMessage";
import { useLiveChat } from "@/hooks/useLiveChat";

// LiveKit Integration
import {
  LiveKitRoom,
  VideoTrack,
  useLocalParticipant,
  useTracks,
  TrackToggle,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import {
  useLiveSession,
  useUpdateLiveSession,
  useUpdateLiveStatus,
  useTodayLiveSession,
  useCreateTodayLiveSession,
} from "@/hooks/useLiveSession";
import { useHostLivekitToken } from "@/hooks/useLivekitToken";
import { LiveStatus } from "@/services/live-session.service";
import ImageUpload from "@/components/image-upload";
import { ShareButton } from "@/components/layout/share-button";

interface DashboardProps {
  params?: { liveId?: string };
}

// ----------------------------------------------------------------------
// Sub-component: กล้อง Host (WebRTC)
// ----------------------------------------------------------------------
function HostCameraPreview() {
  const [isMirrored, setIsMirrored] = useState(false);
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera], {
    onlySubscribed: false,
  });

  const localCameraTrack = tracks.find(
    (t) => t.participant.identity === localParticipant.identity,
  );

  return (
    <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center">
      {localCameraTrack ? (
        <VideoTrack
          trackRef={localCameraTrack}
          className={`w-full h-full object-contain transition-transform duration-200 ${
            isMirrored ? "-scale-x-100" : "scale-x-100"
          }`}
        />
      ) : (
        <div className="text-center text-muted-foreground space-y-2 p-4">
          <Loader2 className="size-8 mx-auto animate-spin text-primary" />
          <p className="text-sm font-medium">กำลังเปิดกล้องและไมโครโฟน...</p>
        </div>
      )}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 bg-zinc-900/90 backdrop-blur px-2.5 sm:px-3 py-1.5 rounded-full border border-zinc-700 shadow-lg z-10">
        <TrackToggle
          source={Track.Source.Microphone}
          className="rounded-full p-2 hover:bg-zinc-800 text-white! transition-colors"
        />
        <TrackToggle
          source={Track.Source.Camera}
          className="rounded-full p-2 hover:bg-zinc-800 text-white! transition-colors"
        />
        <button
          type="button"
          onClick={() => setIsMirrored((prev) => !prev)}
          className="text-xs text-white px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-zinc-800 border border-zinc-700 transition-colors"
        >
          {isMirrored ? "โหมดกระจก" : "ภาพปกติ"}
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Dashboard Page
// ----------------------------------------------------------------------
export default function DashboardPage({ params }: DashboardProps) {
  const { data: todaySession, isLoading: isTodayLoading } =
    useTodayLiveSession();
  const createTodayMutation = useCreateTodayLiveSession();
  const [newTitle, setNewTitle] = useState("");

  const liveId = params?.liveId || todaySession?.id || "";

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [quickReply, setQuickReply] = useState("");
  const [tagInput, setTagInput] = useState("");

  const {
    token: livekitToken,
    wsUrl,
    isLoading: isTokenLoading,
    error: tokenErrorObj,
  } = useHostLivekitToken(liveId, true);
  const tokenError = (tokenErrorObj as Error | null)?.message ?? "";
  const [roomError, setRoomError] = useState<string>("");

  const { data: session } = useLiveSession(liveId);
  const updateSessionMutation = useUpdateLiveSession();
  const updateStatusMutation = useUpdateLiveStatus();

  const [formData, setFormData] = useState({
    title: "",
    status: "IDLE" as LiveStatus,
    ogTitle: "",
    ogDescription: "",
    ogThumbnail: "",
    ogImage: "",
    ogTags: [] as string[],
  });

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title || "",
        status: session.status || "IDLE",
        ogTitle: session.ogTitle || "",
        ogDescription: session.ogDescription || "",
        ogThumbnail: session.ogThumbnail || "",
        ogImage: session.ogImage || "",
        ogTags: session.ogTags || [],
      });
    }
  }, [session]);

  const isStreaming = session?.status === "STREAMING";

  const { data: rawMessages = [] } = useLiveMessageStream(liveId);
  const { viewerCount, isConnected } = useLiveChat(liveId, "Host_Admin");
  const sendMessageMutation = useSendMessage();

  const messages = Array.isArray(rawMessages) ? rawMessages : [];
  const streamKey = session?.streamKey || "loading...";
  const rtmpUrl =
    process.env.NEXT_PUBLIC_RTMP_URL || "rtmp://119.59.102.57:1935/app";

  const handleCopy = (text: string, type: "key" | "url") => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!formData.ogTags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          ogTags: [...formData.ogTags, tagInput.trim()],
        });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      ogTags: formData.ogTags.filter((t) => t !== tagToRemove),
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const { title, status, ...ogMeta } = formData;
    updateSessionMutation.mutate({
      liveId,
      data: ogMeta,
    });
  };

  const handleToggleStatus = (nextStatus: LiveStatus) => {
    updateStatusMutation.mutate({ liveId, status: nextStatus });
  };

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReply.trim()) return;

    sendMessageMutation.mutate({
      liveId,
      senderId: "admin_01",
      senderName: "[Admin] ร้านค้า",
      message: quickReply.trim(),
    });
    setQuickReply("");
  };

  if (!params?.liveId && !isTodayLoading && !todaySession) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>วันนี้ยังไม่มีห้องไลฟ์</CardTitle>
            <CardDescription>
              ระบบอนุญาตให้เปิดไลฟ์ได้ 1 ครั้งต่อ 1 วันเท่านั้น
              กรอกหัวข้อเพื่อเปิดห้องไลฟ์
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">ชื่อหัวข้อไลฟ์วันนี้</Label>
              <Input
                placeholder="เช่น มหกรรมลดราคาสินค้าประจำสัปดาห์"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            {createTodayMutation.isError && (
              <p className="text-xs text-destructive">
                {(createTodayMutation.error as Error)?.message ||
                  "ไม่สามารถสร้างไลฟ์ได้"}
              </p>
            )}
            <Button
              className="w-full gap-2"
              disabled={!newTitle.trim() || createTodayMutation.isPending}
              onClick={() =>
                createTodayMutation.mutate({ title: newTitle.trim() })
              }
            >
              {createTodayMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {createTodayMutation.isPending
                ? "กำลังสร้าง..."
                : "เปิดไลฟ์วันนี้"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!liveId || isTodayLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full overflow-x-hidden">
      {/* 1. Header Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate max-w-full">
              {session?.title || "Stream Control Center"}
            </h2>
            <Badge
              variant={
                session?.status === "STREAMING"
                  ? "destructive"
                  : session?.status === "ENDED"
                    ? "outline"
                    : "secondary"
              }
              className="gap-1.5 font-semibold px-2.5 py-0.5 shrink-0"
            >
              <Radio
                className={`size-3.5 ${
                  session?.status === "STREAMING" ? "animate-pulse" : ""
                }`}
              />
              {session?.status || "IDLE"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Session ID: <span className="font-mono text-xs">{liveId}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <ShareButton url="https://zimonds.com" title={session?.title} />

          {isStreaming ? (
            <Button
              size="default"
              variant="destructive"
              className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-initial"
              disabled={updateStatusMutation.isPending}
              onClick={() => handleToggleStatus("ENDED")}
            >
              <StopCircle className="size-4" /> จบการถ่ายทอดสด
            </Button>
          ) : (
            <Button
              size="default"
              className="gap-1.5 text-xs sm:text-sm flex-1 sm:flex-initial"
              disabled={updateStatusMutation.isPending}
              onClick={() => handleToggleStatus("STREAMING")}
            >
              <PlayCircle className="size-4" /> เริ่มถ่ายทอดสด
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              ผู้ชมปัจจุบัน
            </CardTitle>
            <Users className="size-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{viewerCount}</div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">
              {isConnected ? "🟢 เชื่อมต่อเสถียร" : "🔴 กำลังเชื่อมต่อ..."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              ข้อความทั้งหมด
            </CardTitle>
            <MessageSquare className="size-4 text-emerald-500 shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {messages.length}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
              อัปเดตเรียลไทม์
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              คำสั่งซื้อ / CF
            </CardTitle>
            <ShoppingBag className="size-4 text-amber-500 shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {messages.filter((m) => m.message?.startsWith("🛍️")).length}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
              แท็กสั่งซื้อสินค้า
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              สถานะไลฟ์
            </CardTitle>
            <Clock className="size-4 text-blue-500 shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold font-mono truncate">
              {session?.status || "IDLE"}
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">
              เริ่ม:{" "}
              {session?.startedAt
                ? new Date(session.startedAt).toLocaleTimeString("th-TH")
                : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-4 pb-2 border-b flex flex-row items-center justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="text-sm sm:text-base font-semibold truncate">
                  Live Monitor Preview
                </CardTitle>
                <CardDescription className="text-xs truncate">
                  {formData.title || "ไม่มีหัวข้อสตรีม"}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">
                {session?.status}
              </Badge>
            </CardHeader>

            {/* กล้อง LiveKit Preview */}
            <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
              {isTokenLoading ? (
                <div className="text-center text-muted-foreground space-y-2 p-4">
                  <Loader2 className="size-8 mx-auto animate-spin text-primary" />
                  <p className="text-sm font-medium">
                    กำลังเตรียมห้องถ่ายทอดสด...
                  </p>
                </div>
              ) : livekitToken && wsUrl ? (
                <LiveKitRoom
                  token={livekitToken}
                  serverUrl={wsUrl}
                  connect={true}
                  video={true}
                  audio={true}
                  className="w-full h-full"
                  onError={(err) => setRoomError(err.message)}
                  onConnected={() => setRoomError("")}
                >
                  <HostCameraPreview />
                  {roomError && (
                    <div className="absolute inset-x-0 bottom-0 bg-destructive/90 text-white text-[11px] px-3 py-2 text-center">
                      เชื่อมต่อ LiveKit ไม่สำเร็จ: {roomError}
                    </div>
                  )}
                </LiveKitRoom>
              ) : (
                <div className="text-center text-destructive space-y-2 p-4">
                  <Radio className="size-8 mx-auto opacity-50" />
                  <p className="text-sm font-medium">
                    {tokenError || "ไม่สามารถเชื่อมต่อไปยัง Media Server ได้"}
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    ตรวจสอบว่าล็อกอินแอดมินอยู่และเซิร์ฟเวอร์เปิดใช้งานอยู่
                  </p>
                </div>
              )}
            </div>

            {/* Stream Key Helper */}
            <CardContent className="p-3 sm:p-4 bg-muted/20 border-t space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Key className="size-3.5 shrink-0" /> ข้อมูลสตรีมภายนอก (OBS /
                vMix)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Server RTMP URL</Label>
                  <div className="flex gap-1.5">
                    <Input
                      readOnly
                      value={rtmpUrl}
                      className="h-8 text-xs font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 shrink-0"
                      onClick={() => handleCopy(rtmpUrl, "url")}
                    >
                      {copiedUrl ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Stream Key</Label>
                  <div className="flex gap-1.5">
                    <Input
                      readOnly
                      type="password"
                      value={streamKey}
                      className="h-8 text-xs font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8 shrink-0"
                      onClick={() => handleCopy(streamKey, "key")}
                    >
                      {copiedKey ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab แชท & ตั้งค่า */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger
                value="chat"
                className="gap-1.5 text-xs text-[#333333]!"
              >
                <MessageSquare className="size-3.5" /> แชทสด ({messages.length})
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="gap-1.5 text-xs text-[#333333]!"
              >
                <Settings className="size-3.5" /> ตั้งค่า & OG
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 mt-2">
              <Card className="h-[550px] lg:h-[620px] flex flex-col">
                <CardHeader className="p-3 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      กล่องข้อความสด
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-[10px] text-emerald-600 border-emerald-500/30"
                    >
                      Live Feed
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-[420px] lg:h-[480px] px-3 pb-10">
                    <div className="space-y-3 py-2">
                      {messages.length === 0 ? (
                        <div className="text-center text-xs text-muted-foreground py-10">
                          ยังไม่มีข้อความส่งเข้ามาในห้องไลฟ์
                        </div>
                      ) : (
                        messages.map((item) => {
                          const isOrder = item.message?.startsWith("🛍️");
                          return (
                            <div
                              key={item.id}
                              className={`p-2.5 rounded-lg border text-xs space-y-1 transition-colors ${
                                isOrder
                                  ? "bg-amber-500/10 border-amber-500/30"
                                  : "bg-muted/40"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-foreground truncate max-w-[70%]">
                                  {item.senderName}
                                </span>
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                  {item.createdAt
                                    ? new Date(
                                        item.createdAt,
                                      ).toLocaleTimeString("th-TH", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </span>
                              </div>
                              <p className="text-foreground/90 break-words">
                                {item.message}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>

                <div className="p-3 border-t bg-muted/20 mt-auto">
                  <form onSubmit={handleSendAdminReply} className="flex gap-2">
                    <Input
                      value={quickReply}
                      onChange={(e) => setQuickReply(e.target.value)}
                      placeholder="ตอบกลับในฐานะแอดมิน..."
                      className="h-9 text-xs"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={
                        !quickReply.trim() || sendMessageMutation.isPending
                      }
                      className="size-9 shrink-0"
                    >
                      <Send className="size-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 mt-2">
              <Card className="h-[550px] lg:h-[620px] flex flex-col">
                <CardHeader className="p-3 border-b">
                  <CardTitle className="text-sm font-semibold">
                    ตั้งค่าห้องไลฟ์ & Open Graph
                  </CardTitle>
                  <CardDescription className="text-xs">
                    ข้อมูลทั่วไปและ Metadata สำหรับแชร์ลง Social Media
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-3 sm:p-4 flex-1 overflow-y-auto">
                  <form
                    id="settings-form"
                    onSubmit={handleSaveSettings}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">
                        ชื่อหัวข้อไลฟ์ (Title)
                      </Label>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="h-8 text-xs"
                        placeholder="เช่น มหกรรมลดราคาสินค้าประจำสัปดาห์"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">
                        สถานะสตรีม (Status)
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(val) =>
                          setFormData({
                            ...formData,
                            status: (val as LiveStatus) ?? "IDLE",
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IDLE">
                            IDLE (เตรียมความพร้อม)
                          </SelectItem>
                          <SelectItem value="STREAMING">
                            STREAMING (กำลังถ่ายทอดสด)
                          </SelectItem>
                          <SelectItem value="ENDED">
                            ENDED (จบการไลฟ์)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Globe className="size-3.5" /> Social Media & SEO (Open
                      Graph)
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">OG Title</Label>
                      <Input
                        value={formData.ogTitle}
                        onChange={(e) =>
                          setFormData({ ...formData, ogTitle: e.target.value })
                        }
                        className="h-8 text-xs"
                        placeholder="หัวข้อสำหรับแสดงผลบน Facebook / Line"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">
                        OG Description
                      </Label>
                      <Textarea
                        value={formData.ogDescription}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ogDescription: e.target.value,
                          })
                        }
                        rows={2}
                        className="text-xs resize-none"
                        placeholder="คำอธิบายสั้นๆ สำหรับพรีวิวลิงก์"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <div className="space-y-1.5">
                        <ImageUpload
                          folder="thumbnails"
                          label="OG Thumbnail URL"
                          onUploadSuccess={(res) => {
                            setFormData({
                              ...formData,
                              ogThumbnail: res,
                            });
                          }}
                          defaultValue={formData.ogThumbnail}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <ImageUpload
                          folder="og"
                          label="OG Image URL"
                          onUploadSuccess={(res) => {
                            setFormData({
                              ...formData,
                              ogImage: res,
                            });
                          }}
                          defaultValue={formData.ogImage}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium flex items-center gap-1">
                        <Tag className="size-3" /> แท็กสตรีม (ogTags)
                      </Label>
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="พิมพ์แล้วกด Enter เพื่อเพิ่ม Tag..."
                        className="h-8 text-xs"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {formData.ogTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[11px] px-2 py-0.5 gap-1 cursor-pointer hover:bg-destructive/20"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            #{tag}
                            <span className="text-xs ml-0.5">×</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </form>
                </CardContent>

                <div className="p-3 border-t bg-muted/20 mt-auto">
                  <Button
                    type="submit"
                    form="settings-form"
                    disabled={updateSessionMutation.isPending}
                    className="w-full gap-2 text-xs h-9"
                  >
                    <Save className="size-3.5" />
                    {updateSessionMutation.isPending
                      ? "กำลังบันทึก..."
                      : "บันทึกการตั้งค่า"}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
