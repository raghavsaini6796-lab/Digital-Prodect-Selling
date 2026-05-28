"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Theme provider — enables system-preference-aware dark/light mode.
 * Uses next-themes with CSS class strategy for Tailwind dark mode.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
