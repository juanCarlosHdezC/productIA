import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: undefined,
      allowedOrigins: undefined,
    },
  },
};

export default nextConfig;
