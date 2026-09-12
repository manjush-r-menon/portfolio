import type { MetadataRoute } from "next";

const BASE_URL = "https://manjush.info";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/gallery",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
