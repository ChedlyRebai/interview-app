import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ["http://localhost:3000", "http://127.0.0.1:3000","http://192.168.1.229:3000"],
};

export default nextConfig;
