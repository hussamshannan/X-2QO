import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // The Spline scene is a 36 MB immutable binary served from public/. Next only
        // long-caches /_next/static by default, so public/ assets need this explicitly.
        // If the scene is ever re-exported, change the filename to bust this cache.
        source: "/scene/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          // Next infers application/octet-stream for .splinecode, and the compression
          // middleware skips that type as non-compressible — which silently threw away a
          // 5.3x saving (36.2 MB -> 6.9 MB). application/json is what Spline's own host
          // serves it as, and it is on the compressible list. The runtime reads the body as
          // an ArrayBuffer, so the declared type does not affect parsing.
          { key: "Content-Type", value: "application/json" },
        ],
      },
    ];
  },
};

export default nextConfig;
