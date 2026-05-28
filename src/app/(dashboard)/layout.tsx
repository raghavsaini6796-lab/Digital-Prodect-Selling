import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { ROUTES } from "@/lib/constants";

/**
 * Dashboard route group layout.
 *
 * Defense-in-depth auth guard:
 * - middleware.ts is the PRIMARY guard (handles unauthenticated requests)
 * - This layout adds a SECONDARY server-side check as a safety net
 *   in case middleware is bypassed (e.g., direct route handler calls).
 *
 * Passes the authenticated user down to Navbar/Sidebar via props.
 */
export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Secondary auth guard — redirect if no valid session
  if (!user) {
    redirect(ROUTES.login);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navbar — passes user email for display */}
        <Navbar userEmail={user.email} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
