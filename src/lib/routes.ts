import type { OccasionId } from "./types";

/** Central list of app paths so links stay consistent as pages are added. */
export const routes = {
  home: "/",
  gifts: "/gifts",
  giftsForOccasion: (occasion: OccasionId) => `/gifts?occasion=${occasion}`,
  personalisedGifts: "/gifts?personalised=1",
  search: (query: string) => `/gifts?q=${encodeURIComponent(query)}`,
  product: (slug: string) => `/gifts/${slug}`,
  makers: "/makers",
  maker: (slug: string) => `/makers/${slug}`,
  giftFinder: "/gift-finder",
  favourites: "/favourites",
  cart: "/cart",
  help: "/help",
  shipping: "/help/shipping",
  returns: "/help/returns",
  privacy: "/privacy",
  terms: "/terms",
  sell: "/sell",
} as const;
