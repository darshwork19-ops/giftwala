/**
 * Sample photography is served from Unsplash (free licence). The custom
 * loader in `image-loader.ts` asks Unsplash for the exact width needed.
 */
export function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}`;
}
