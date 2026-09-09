import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        // Vercel Blob serves each store from its own random subdomain
        // (e.g. abc123xyz.public.blob.vercel-storage.com) rather than a
        // single fixed host, so this needs a wildcard — this is the
        // pattern Vercel's own docs use for Blob + next/image.
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/projects",
        destination: "/work",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
