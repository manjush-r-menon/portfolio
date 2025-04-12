import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en", "de"],
    defaultLocale: "en",
  },
};

export default nextConfig;
