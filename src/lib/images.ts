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

/** Shown in its place until `public/images/giftwala-bag.jpg` has been added. */
export const parcelPhoto = {
  src: unsplash("photo-1788713756143-fcfc915940f0"),
  alt: "A hand holding a small brown-paper parcel tied with twine and a red seal",
};
