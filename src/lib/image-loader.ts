"use client";

import type { ImageLoaderProps } from "next/image";

/**
 * Unsplash resizes on its own CDN, so we request the width Next.js asks for
 * instead of proxying the original through the Next.js optimiser.
 * Local images (from /public) are returned unchanged.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const params = new URLSearchParams({
      auto: "format",
      fit: "crop",
      w: String(width),
      q: String(quality ?? 75),
    });
    return `${src}?${params}`;
  }
  return src;
}
