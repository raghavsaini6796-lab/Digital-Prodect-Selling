import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";

/**
 * Auth route group layout.
 * Shared by /login and /signup pages.
 * Centered card layout with logo header.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6">
      {/* Top bar */}
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      {/* Logo */}
      <div className="mb-8">
        <Logo />
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
