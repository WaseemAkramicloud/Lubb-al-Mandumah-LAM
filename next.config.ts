import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
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
      {
        source: '/control-panel/modules/ecosystem',
        destination: '/control-panel/clients',
        permanent: false,
      },
      {
        source: '/control-panel/modules/ecosystem/companies',
        destination: '/control-panel/clients',
        permanent: false,
      },
      {
        source: '/control-panel/modules/ecosystem/companies/new',
        destination: '/control-panel/clients/new',
        permanent: false,
      },
      {
        source: '/control-panel/modules/ecosystem/companies/:id',
        destination: '/control-panel/clients/:id',
        permanent: false,
      },
      {
        source: '/control-panel/modules/ecosystem/identities',
        destination: '/control-panel/clients/users',
        permanent: false,
      },
      {
        source: '/control-panel/modules/ecosystem/entitlements',
        destination: '/control-panel/subscriptions',
        permanent: false,
      },
      {
        source: '/control-panel/modules/leads-clients',
        destination: '/control-panel/clients/requests',
        permanent: false,
      },
      {
        source: '/control-panel/access',
        destination: '/control-panel/users',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
