import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Images ────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // Supabase storage
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // ─── Experimental ──────────────────────────────────────────────────────────
  experimental: {
    // Enables React Server Actions (stable in Next.js 14+)
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
