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
  giftFinderFor: (brief: string, view?: "buy" | "ideas") =>
    `/gift-finder?brief=${encodeURIComponent(brief)}${view ? `&view=${view}` : ""}`,
  giftBox: "/gift-box",
  requestGift: (slug: string) => `/request/${slug}`,
  requests: "/requests",
  requestStatus: (ref: string) => `/requests?ref=${encodeURIComponent(ref)}`,
  login: "/login",
  loginThen: (next: string) => `/login?next=${encodeURIComponent(next)}`,
} as const;
