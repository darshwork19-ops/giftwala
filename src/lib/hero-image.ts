import { existsSync } from "node:fs";
import { join } from "node:path";
import { giftwalaBag, parcelPhoto } from "./images";

/** The GIFTWALA bag image once its file is in /public, otherwise the parcel photo. */
export function heroImage() {
  return existsSync(join(process.cwd(), "public", giftwalaBag.src)) ? giftwalaBag : parcelPhoto;
}
