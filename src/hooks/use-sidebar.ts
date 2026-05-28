"use client";

import { useUIStore } from "@/store/ui.store";

/**
 * Convenience hook for sidebar open/close state.
 */
export function useSidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  return { sidebarOpen, toggleSidebar, setSidebarOpen };
}
