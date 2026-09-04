"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  User,
  BarChart,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** ใช้ exact match แทน prefix match */
  exact?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Stream Control Center",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "แชทลูกค้า",
    href: "/dashboard/customer-chat",
    icon: MessageSquare,
  },
  {
    label: "ข้อมูลการ Live",
    href: "/dashboard/live-data",
    icon: BarChart,
  },
  {
    label: "จัดการสมาชิก",
    href: "/dashboard/manage-members",
    icon: User,
  },
];

interface SidebarProps {
  items?: SidebarItem[];
  className?: string;
}

export function Sidebar({ items = sidebarItems, className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // 1. ลบ Cookie
    document.cookie = "admin_token=; path=/; max-age=0;";

    // 2. ลบ LocalStorage
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_profile");

    // 3. กลับไปหน้า Sign In
    router.push("/signin");
  };

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300 select-none",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-3">
        {!collapsed && (
          <span className="truncate text-base font-bold tracking-tight text-foreground pl-1">
            Management
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((prev) => !prev)}
          className={cn("h-8 w-8 text-muted-foreground ml-auto")}
          aria-label={collapsed ? "ขยาย sidebar" : "ย่อ sidebar"}
          title={collapsed ? "ขยาย sidebar" : "ย่อ sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Nav items & Logout */}
      <div className="flex flex-1 flex-col justify-between overflow-y-auto p-2">
        {/* เมนูหลัก */}
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Button
                key={item.href}
                render={
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                }
                variant="ghost"
                className={cn(
                  "h-11 w-full justify-start gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sky-100 text-sky-800 hover:bg-sky-100/90 dark:bg-sky-950 dark:text-sky-300"
                    : "text-muted-foreground hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800",
                  collapsed && "justify-center px-0",
                )}
              />
            );
          })}
        </nav>

        {/* ส่วนปุ่มออกจากระบบ */}
        <div className="border-t pt-2 mt-2">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className={cn(
              "w-full gap-2 transition-all",
              collapsed
                ? "h-11 px-0 justify-center"
                : "h-10 justify-start px-3",
            )}
            title={collapsed ? "ออกจากระบบ" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate text-sm">ออกจากระบบ</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
