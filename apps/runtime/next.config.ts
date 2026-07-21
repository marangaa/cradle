import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@cradle/core",
    "@cradle/crawler",
    "@cradle/db",
    "@cradle/media",
    "@maranga/cradle",
  ],
};
export default nextConfig;
