"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  User,
  BarChart,
  LogOut,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
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

/** Small wordmark used in both the desktop rail and the mobile sheet. */
function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 truncate",
        collapsed && "mx-auto",
      )}
    >
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-foreground">
            Management
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            Live Control
          </span>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ items = sidebarItems, className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "admin_token=; path=/; max-age=0;";
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_profile");
    router.push("/signin");
  };

  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname?.startsWith(item.href + "/");
        const Icon = item.icon;
        const showLabel = !collapsed || isMobile;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => isMobile && setMobileOpen(false)}
            title={!showLabel ? item.label : undefined}
            className={cn(
              "group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none transition-colors duration-150",
              "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "bg-[#0b0b0b] text-white "
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              !showLabel && "justify-center px-0",
            )}
          >
            {/* active indicator */}
            <span
              className={cn(
                "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#0b0b0b] transition-all duration-150",
                isActive ? "opacity-100" : "opacity-0",
              )}
            />
            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-transform duration-150",
                isActive
                  ? "text-white"
                  : "text-dark:text-indigo-300 group-hover:text-foreground",
              )}
            />
            {showLabel && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          "sticky top-0 left-0 z-40 hidden h-screen flex-col border-r border-border/60 bg-background/95 backdrop-blur transition-[width] duration-300 ease-out supports-[backdrop-filter]:bg-background/70 lg:flex",
          collapsed ? "w-[76px]" : "w-64",
          className,
        )}
      >
        <div className="relative flex h-16 shrink-0 items-center border-b border-border/60 px-4">
          <Brand collapsed={collapsed} />

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "ขยาย sidebar" : "ย่อ sidebar"}
            className="absolute -right-3.5 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border-border bg-background shadow-sm hover:bg-muted"
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <NavLinks isMobile={false} />
        </div>

        <div className="border-t border-border/60 p-3">
          <Button
            variant="ghost"
            onClick={handleLogout}
            title={collapsed ? "ออกจากระบบ" : undefined}
            className={cn(
              "w-full gap-2.5 rounded-lg text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400",
              collapsed
                ? "h-10 w-10 justify-center p-0 mx-auto"
                : "h-10 justify-start px-3",
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">ออกจากระบบ</span>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile trigger + sheet */}
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger>
            <Button
              size="icon-2xl"
              aria-label="เปิดเมนู"
              className="rounded-full  text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex w-64 max-w-2xs! flex-col p-0"
          >
            <div className="flex h-16 shrink-0 items-center border-b border-border/60 px-5">
              <Brand collapsed={false} />
            </div>

            <div className="flex-1 overflow-y-auto">
              <NavLinks isMobile={true} />
            </div>

            <div className="border-t border-border/60 p-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="h-10 w-full justify-center gap-2.5 rounded-lg px-3 text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">ออกจากระบบ</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
