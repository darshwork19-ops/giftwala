"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * next/image with a graceful fallback: if the photo cannot load, a quiet
 * linen panel with the alt text is shown instead of a broken image icon.
 * Always used with `fill`, so the parent must be positioned and sized.
 */
export function GiftImage({ alt, className = "", ...props }: Omit<ImageProps, "fill">) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 flex items-center justify-center bg-linen p-4 text-center text-xs text-muted"
      >
        <span aria-hidden="true">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      fill
      className={`${className.includes("object-contain") ? "" : "object-cover"} ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
