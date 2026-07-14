import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jsknvmfqmawamqtewcdl.supabase.co",
      },
    ],
  },
};

export default nextConfig;
