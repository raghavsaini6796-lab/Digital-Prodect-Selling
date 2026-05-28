"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Sparkles,
  Share2,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { Logo } from "@/components/common/logo";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";

// ─── Nav Items Config ──────────────────────────────────────────────────────────

const navItems = [
  {
    label: "Dashboard",
    href: ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: ROUTES.products,
    icon: Package,
  },
  {
    label: "Orders",
    href: ROUTES.orders,
    icon: ShoppingCart,
  },
  {
    label: "AI Generator",
    href: ROUTES.aiGenerator,
    icon: Sparkles,
  },
  {
    label: "Instagram",
    href: ROUTES.instagram,
    icon: Share2,
  },
] as const;

const bottomNavItems = [
  {
    label: "Settings",
    href: ROUTES.settings,
    icon: Settings,
  },
] as const;

// ─── Nav Link ─────────────────────────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
  collapsed?: boolean;
}

function NavLink({ href, label, icon: Icon, collapsed }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-background transition-all duration-300",
          "md:relative md:z-auto",
          sidebarOpen ? "w-56" : "w-0 overflow-hidden md:w-14"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-3">
          {sidebarOpen && <Logo showText={sidebarOpen} />}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Main nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              collapsed={!sidebarOpen}
            />
          ))}
        </nav>

        <Separator />

        {/* Bottom nav */}
        <div className="p-2">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              collapsed={!sidebarOpen}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
