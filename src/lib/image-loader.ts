"use client";

import type { ImageLoaderProps } from "next/image";

/**
 * Each image host resizes on its own CDN, so we request the width Next.js
 * asks for instead of proxying originals through the Next.js optimiser.
 * - Unsplash: sample photography for the demo catalogue.
 * - Shopify: shop photos for online-shop products.
 * - Files in /public are served as they are (the width only varies the URL).
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  const q = String(quality ?? 75);
  if (src.startsWith("https://images.unsplash.com/")) {
    const params = new URLSearchParams({ auto: "format", fit: "crop", w: String(width), q });
    return `${src}?${params}`;
  }
  if (src.startsWith("https://cdn.shopify.com/")) {
    return `${src}${src.includes("?") ? "&" : "?"}width=${width}`;
  }
  if (src.startsWith("/")) return `${src}?w=${width}`;
  return src;
}
