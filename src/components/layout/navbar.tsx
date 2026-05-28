"use client";

import { useTransition } from "react";
import { Menu, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/hooks/use-sidebar";
import { signOut } from "@/app/actions/auth";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";

interface NavbarProps {
  /** Authenticated user's email — passed from server layout */
  userEmail?: string;
}

/**
 * Top navbar.
 *
 * Design decisions:
 * - Receives `userEmail` as prop from the server layout (no client-side auth fetch needed)
 * - Logout calls the `signOut` server action (no client supabase call needed)
 * - Uses @base-ui/react DropdownMenu — no `asChild` prop available, trigger renders as button
 * - Mobile: hamburger button toggles the sidebar drawer
 */
export function Navbar({ userEmail }: NavbarProps) {
  const { toggleSidebar } = useSidebar();
  const [isPending, startTransition] = useTransition();

  const initials = userEmail?.slice(0, 2).toUpperCase() ?? "U";

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background px-4 shrink-0">
      {/* Mobile: sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="h-8 w-8 md:hidden"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme toggle */}
      <ThemeToggle />

      <Separator orientation="vertical" className="h-5" />

      {/* User avatar menu — DropdownMenuTrigger renders as a native button */}
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="User menu"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background cursor-pointer select-none outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {initials}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-0.5">
              <p className="text-xs font-medium leading-none">My Account</p>
              {userEmail && (
                <p className="text-[11px] leading-none text-muted-foreground truncate mt-1">
                  {userEmail}
                </p>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <Link
              href={ROUTES.settings}
              className="flex items-center gap-2 w-full"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isPending}
            className="flex items-center gap-2 cursor-pointer text-destructive data-[variant=destructive]:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            {isPending ? "Signing out…" : "Sign out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
