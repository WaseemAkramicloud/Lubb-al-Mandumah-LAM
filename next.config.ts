import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ykrjmctfmywhymgpkqlu.supabase.co",
      },
    ],
  },
  // Strict mode
  reactStrictMode: true,
};

export default nextConfig;
