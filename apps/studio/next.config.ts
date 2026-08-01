import type { NextConfig } from "next";

const RUNTIME_URL = process.env.NEXT_PUBLIC_RUNTIME_URL;

if (!RUNTIME_URL) {
  throw new Error("NEXT_PUBLIC_RUNTIME_URL is required in environment variables.");
}

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
