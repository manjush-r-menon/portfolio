import type { MetadataRoute } from "next";

const BASE_URL = "https://manjush.info";

// The real, indexable routes only — /gallery is deliberately excluded (see
// its own noindex/nofollow metadata in app/gallery/page.tsx).
const ROUTES = ["/", "/about", "/work", "/contact", "/certifications", "/blogs"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
