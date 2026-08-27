import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js (both Turbopack + webpack) to skip bundling pdfjs-dist entirely
  // and let Node.js require() it at runtime. This avoids the missing 'canvas'
  // error since pdfjs's NodeCanvasFactory is never processed by the bundler.
  serverExternalPackages: ["pdfjs-dist", "sharp"],
};

export default nextConfig;