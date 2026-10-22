/**
 * Sample photography is served from Unsplash (free licence). The custom
 * loader in `image-loader.ts` asks Unsplash for the exact width needed.
 */
export function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}`;
}

/** GIFTWALA's own campaign image, generated for the site with Canva AI. */
export const giftwalaBag = {
  src: "/images/giftwala-bag.jpg",
  alt: "A hand reaching through red velvet curtains holding a burgundy GIFTWALA gift bag",
};
