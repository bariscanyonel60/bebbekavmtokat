import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Ana dizindeki (/Users/mac) package-lock.json yüzünden yanlış kök seçilmesin.
  turbopack: { root: __dirname },
  outputFileTracingIncludes: { "/**": ["./prisma/demo/demo.db"] },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [32, 64, 96, 128, 256, 384],
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
