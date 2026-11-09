import type { NextConfig } from "next";

const nextConfig: NextConfig = {  async headers() {
    return [{
      // Excludes Next.js internals: these headers break the dev server's WebSocket handshake.
      source: "/((?!_next/).*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      // Preserve native CSS Module exports and next/font stylesheets.
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
      },
    },
  },
};

export default nextConfig;
