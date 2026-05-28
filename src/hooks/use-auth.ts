"use client";

import { useAuthStore } from "@/store/auth.store";

/**
 * Convenience hook for accessing auth state.
 * Components should use this instead of directly accessing the store.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  return {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
  };
}
