"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth.store";

/**
 * Auth provider — runs once at app root.
 * Syncs Supabase session changes into the Zustand auth store.
 * Must be rendered inside a Client Component.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setLoading, reset } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) reset();
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setLoading, reset]);

  return <>{children}</>;
}
