import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { User, Session } from "@/types/auth";

interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  session: null,
  isLoading: true,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      ...initialState,
      setUser: (user) => set({ user }, false, "auth/setUser"),
      setSession: (session) => set({ session }, false, "auth/setSession"),
      setLoading: (isLoading) => set({ isLoading }, false, "auth/setLoading"),
      reset: () => set(initialState, false, "auth/reset"),
    }),
    { name: "AuthStore" }
  )
);
