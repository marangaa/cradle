import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@cradle/core",
    "@cradle/crawler",
    "@cradle/db",
    "@maranga/cradle",
  ],
  async headers() {
    return [
      {
        // Served as a static file from public/ (see scripts/copy-widget.mjs) — embedded via
        // <script src> on arbitrary third-party sites, so CORS is wide open by design; there's
        // no installation-specific data in this response, unlike the per-site manifest route.
        source: "/widget.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};
export default nextConfig;
