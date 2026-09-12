import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

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

// Opt-in only — `ANALYZE=true next build` — never runs during a normal
// build or deploy, so it can't change production output.
const analyzeBundles = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default analyzeBundles(nextConfig);
