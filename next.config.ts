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
  async redirects() {
    return [
      {
        source: '/staff-login/dashboard',
        destination: '/control-panel/dashboard',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
