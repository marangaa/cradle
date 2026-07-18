import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@cradle/agent",
    "@cradle/core",
    "@cradle/crawler",
    "@cradle/db",
    "@cradle/jobs",
    "@cradle/media",
    "@cradle/widget",
  ],
};
export default nextConfig;
