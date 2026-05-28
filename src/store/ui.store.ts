import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UIStore {
  sidebarOpen: boolean;
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        toggleSidebar: () =>
          set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, "ui/toggleSidebar"),
        setSidebarOpen: (open) =>
          set({ sidebarOpen: open }, false, "ui/setSidebarOpen"),
      }),
      { name: "ui-store" }
    ),
    { name: "UIStore" }
  )
);
