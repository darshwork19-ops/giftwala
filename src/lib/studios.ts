import { instagramMakers, type InstagramMaker } from "@/data/instagram-makers";
import { makerProducts, SHOW_PENDING_PHOTOS, type MakerProduct } from "@/data/instagram-maker-products";

/** Real Mumbai makers who sell on Instagram ("studios"), with their products. */

export function getStudios(): InstagramMaker[] {
  return instagramMakers;
}

export function getStudio(handle: string): InstagramMaker | undefined {
  return instagramMakers.find((m) => m.handle === handle);
}

export function getStudioById(id: string): InstagramMaker {
  const maker = instagramMakers.find((m) => m.id === id);
  if (!maker) throw new Error(`Unknown Instagram maker id: ${id}`);
  return maker;
}

/** Whether a maker's product photos may be shown (see SHOW_PENDING_PHOTOS). */
export function photosVisible(maker: InstagramMaker): boolean {
  return maker.photoPermission === "granted" || SHOW_PENDING_PHOTOS;
}

/** A maker's products; photos are dropped when they may not be shown. */
export function getStudioProducts(makerId: string): (MakerProduct & { showPhoto: boolean })[] {
  const showPhoto = photosVisible(getStudioById(makerId));
  return makerProducts.filter((p) => p.makerId === makerId).map((p) => ({ ...p, showPhoto }));
}

/** One product per maker, in turn, for mixed showcases. */
export function studioShowcase(limit: number): (MakerProduct & { maker: InstagramMaker })[] {
  const lists = instagramMakers
    .filter(photosVisible)
    .map((m) => makerProducts.filter((p) => p.makerId === m.id).map((p) => ({ ...p, maker: m })));
  const out: (MakerProduct & { maker: InstagramMaker })[] = [];
  for (let i = 0; out.length < limit && lists.some((l) => l[i]); i++) {
    for (const list of lists) if (list[i] && out.length < limit) out.push(list[i]);
  }
  return out;
}
