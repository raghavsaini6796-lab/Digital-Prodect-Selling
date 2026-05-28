import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RootProviders } from "@/providers";
import { APP_NAME, APP_URL } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "AI-powered digital product generation and automated Instagram selling platform.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    siteName: APP_NAME,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
      >
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
