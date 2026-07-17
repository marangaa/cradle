import type { NextConfig } from "next";

const nextConfig: NextConfig = { output: "standalone", transpilePackages: ["@cradle/agent", "@cradle/core", "@cradle/db"] };
export default nextConfig;
