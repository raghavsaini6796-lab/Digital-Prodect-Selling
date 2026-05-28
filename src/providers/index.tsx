import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";

/**
 * Root providers — composes all providers in the correct order.
 * Import this single component in the root layout.
 *
 * Order matters:
 * 1. ThemeProvider  — outermost, no dependencies
 * 2. QueryProvider  — depends on nothing
 * 3. AuthProvider   — depends on QueryProvider (for future auth queries)
 */
export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
