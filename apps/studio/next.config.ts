import type { NextConfig } from "next";

const RUNTIME_URL = process.env.NEXT_PUBLIC_RUNTIME_URL || "http://localhost:3002";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/runtime/:path*",
        destination: `${RUNTIME_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
