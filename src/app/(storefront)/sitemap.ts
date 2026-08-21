import type { MetadataRoute } from "next";

import { fetchCategorySlugsForParams, fetchProductSlugsForParams } from "@/lib/data";
import { collections } from "@/lib/taxonomy";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes = [
    "",
    "/shop",
    "/new-arrivals",
    "/deals",
    "/about",
    "/contact",
    "/faq",
    "/shipping-returns",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const [categorySlugs, productSlugs] = await Promise.all([
    fetchCategorySlugsForParams(),
    fetchProductSlugsForParams(),
  ]);

  return [
    ...staticRoutes,
    ...collections.map((collection) => ({
      url: `${site.url}/collections/${collection.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...categorySlugs.map((slug) => ({
      url: `${site.url}/category/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...productSlugs.map((slug) => ({
      url: `${site.url}/product/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
