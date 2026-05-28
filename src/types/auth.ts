import type { User as SupabaseUser, Session as SupabaseSession } from "@supabase/supabase-js";

export type User = SupabaseUser;
export type Session = SupabaseSession;

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}
