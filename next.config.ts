import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All product imagery is served from /public/images (local files),
    // so no remote patterns are required.
    formats: ["image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [64, 96, 128, 200, 256, 320, 420, 512],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
