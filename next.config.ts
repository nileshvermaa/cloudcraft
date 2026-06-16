import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ── Performance ────────────────────────────────────────────────────── */
  reactStrictMode: true,
  poweredByHeader: false,

  /* ── Images ─────────────────────────────────────────────────────────── */
  images: {
    formats: ["image/avif", "image/webp"],
  },

  /* ── Experimental ───────────────────────────────────────────────────── */
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
