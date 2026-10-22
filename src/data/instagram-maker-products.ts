/**
 * PRODUCTS FROM MUMBAI INSTAGRAM MAKERS — what each maker in
 * `instagram-makers.ts` shows on its public Instagram account.
 *
 * Collected on 22 Oct 2026 from each maker's recent posts (Apify Instagram
 * post scraper + the public post embed). Names and descriptions are
 * GIFTWALA's own short summaries of what each post shows or its caption says;
 * nothing is invented beyond that. These makers sell by DM, so there are no
 * prices, stock or delivery promises: the UI always says "price on request".
 *
 * PHOTOS belong to the makers. They're shown with a credit and a link to the
 * original post. Each maker's `photoPermission` in `instagram-makers.ts`
 * records whether they've agreed; set SHOW_PENDING_PHOTOS to false to hide
 * every photo that isn't confirmed yet.
 */
import type { InterestId, OccasionId } from "@/lib/types";

export const SHOW_PENDING_PHOTOS = true;

export interface MakerProduct {
  id: string;
  /** `InstagramMaker.id` */
  makerId: string;
  name: string;
  summary: string;
  category: string;
  /** The Instagram post the product is from. */
  postCode: string;
  image: { src: string; alt: string };
  tags: string[];
  interests: InterestId[];
  occasions: OccasionId[];
}

type Entry = [postCode: string, name: string, summary: string, category: string, tags: string[], occasions?: OccasionId[]];

function maker(
  makerId: string,
  handle: string,
  interests: InterestId[],
  occasions: OccasionId[],
  entries: Entry[],
): MakerProduct[] {
  const folder = handle.replace(/\./g, "-");
  return entries.map(([postCode, name, summary, category, tags, occ]) => ({
    id: `${makerId}-${postCode}`.toLowerCase(),
    makerId,
    name,
    summary,
    category,
    postCode,
    image: { src: `/images/makers/${folder}/${postCode}.jpg`, alt: `${name}, from @${handle} on Instagram` },
    tags,
    interests,
    occasions: occ ?? occasions,
  }));
}

export const makerProducts: MakerProduct[] = [
  ...maker("ig-giftbyjiggiart", "giftbyjiggiart_official", ["personalised", "art-handmade", "keepsakes"], ["birthday", "anniversary", "just-because"], [
    ["DehZ2KYD0Io", "Personalised photo frame", "Your favourite photos printed and framed as a keepsake for family, friends or a couple.", "Photo frames", ["photo frame", "frame", "photos", "memories", "couple", "family"], ["birthday", "anniversary", "festivals"]],
    ["DeKN3drjfOM", "Line-art wall frame", "A minimal line-art print in a premium frame with acrylic protection. A4.", "Wall art", ["art", "artwork", "wall art", "frame", "decor", "minimal"]],
    ["DeR8TviDZrc", "Polaroid-style photo collage frame", "A vintage-inspired collage of your photos as polaroids, made for birthdays and best friends.", "Photo frames", ["polaroid", "collage", "photo frame", "photos", "best friend", "memories"], ["birthday", "just-because"]],
    ["DeMyq82gTmK", "Birthday photo frame", "A personalised birthday frame with their photo and a message. A4, with acrylic protection.", "Photo frames", ["birthday", "photo frame", "frame", "photos", "personalised"], ["birthday"]],
    ["Dd4WhhhgNu_", "Ganpati devotional wall frame", "A sketched Ganpati portrait in a premium wall frame for the home mandir or living room.", "Wall art", ["ganpati", "ganesh", "devotional", "spiritual", "sketch", "frame", "decor"], ["festivals", "just-because"]],
  ]),
  ...maker("ig-junior-crew", "junior_crew11", ["keepsakes", "art-handmade", "personalised"], ["birthday", "just-because", "thank-you"], [
    ["DdT04vTgLaV", "Sea shell incense holder", "A handmade incense holder decorated with sea shells, for a pooja corner with a coastal touch.", "Home & pooja", ["shell", "incense", "pooja", "handmade", "home", "decor"], ["festivals", "just-because"]],
    ["DeHw1QHgWFB", "Shell festive jewellery", "Handmade jewellery strung with cowrie shells, made for Navratri and festive outfits.", "Jewellery", ["jewellery", "shell", "navratri", "festive", "handmade", "accessories"], ["festivals", "birthday"]],
    ["DevxHiuiHGY", "Handmade shell wall art", "A white panel arranged with shells in a traditional pattern, framed for the wall.", "Wall art", ["shell", "wall art", "handmade", "traditional", "decor"], ["festivals", "just-because"]],
    ["DdlJkmTDbGE", "Birthday hamper with shell photo frame", "A customised birthday hamper built around a shell-decorated photo frame.", "Hampers", ["hamper", "birthday", "shell", "photo frame", "customised"], ["birthday"]],
    ["Ddq8-QmMUxd", "Shell memory keepsake", "A painted sea shell keepsake, personalised with a heart or a small message.", "Keepsakes", ["shell", "keepsake", "memories", "personalised", "beach"]],
  ]),
  ...maker("ig-crumbles-by-anokhi", "crumblesbyanokhi", ["food-coffee"], ["birthday", "thank-you", "festivals"], [
    ["Deg7MxoAH5h", "Festive bundt cake hamper", "An eggless bundt cake with festive bakes, packed as a Diwali hamper.", "Bakes & hampers", ["cake", "bundt", "eggless", "bakes", "hamper", "diwali"], ["festivals"]],
    ["DeLuhOxgpMJ", "Diwali Edit treat box", "Tea cakes, cookies, brittles and mithai-inspired financiers from the Crumbles Diwali Edit.", "Bakes & hampers", ["cookies", "tea cake", "brittle", "financier", "mithai", "diwali", "eggless"], ["festivals", "thank-you"]],
    ["DevwqwYgDPP", "Festive bake hamper boxes", "Eggless bakes and treats packed in festive hamper boxes, ready to gift.", "Bakes & hampers", ["hamper", "bakes", "cookies", "eggless", "treats", "festive"], ["festivals", "thank-you"]],
  ]),
  ...maker("ig-sugarsins", "sugarsins.cakes", ["food-coffee"], ["birthday", "anniversary", "just-because"], [
    ["DemKrnijSja", "Diwali treat hamper", "A festive hamper of homemade treats from a mother-daughter home bakery.", "Bakes & hampers", ["hamper", "treats", "diwali", "homemade", "sweet"], ["festivals"]],
    ["DetaHYhjFr_", "Treat hamper box", "A gift box of assorted bakes and sweet treats.", "Bakes & hampers", ["hamper", "treats", "bakes", "sweet", "box"], ["festivals", "thank-you"]],
    ["Defni2lPpbL", "Mithai-inspired dessert squares", "Dessert squares with pistachio and rose flavours, made for festive gifting.", "Desserts", ["dessert", "pistachio", "rose", "mithai", "sweet"], ["festivals", "thank-you"]],
    ["DesY6grtCJ9", "Chocolate and cookie hamper", "A dark tray of chocolates, cookies and bakes, gift-wrapped.", "Bakes & hampers", ["chocolate", "cookies", "hamper", "bakes"], ["festivals", "birthday"]],
    ["DdA2ApNNrPc", "Floral cupcakes", "Cupcakes piped with buttercream flowers, made to order.", "Cakes", ["cupcakes", "cake", "floral", "buttercream", "baking"]],
    ["DeStqrqt79g", "Dessert platter", "An assorted dessert platter of tarts and small bakes for hosting at home.", "Desserts", ["dessert", "platter", "tarts", "host", "party"]],
    ["Dd8Qhs3t2Dt", "Themed celebration cake", "A customised theme cake, like this fairy-garden design, with matching treats.", "Cakes", ["cake", "birthday cake", "theme cake", "kids", "party", "customised"], ["birthday"]],
  ]),
  ...maker("ig-scribble-along", "scribblealong", ["personalised"], ["wedding", "festivals", "birthday"], [
    ["DeI_2V1iLy3", "Floral gift crate", "Lilies and roses arranged in a wooden crate with a hand-lettered tag.", "Flowers", ["flowers", "floral", "lilies", "roses", "bouquet"], ["birthday", "anniversary", "just-because"]],
    ["DeZy6UAiLAK", "Bridesmaid proposal hamper", "A customised hamper to ask your girls to be bridesmaids.", "Hampers", ["bridesmaid", "wedding", "bride", "hamper", "customised"], ["wedding"]],
    ["DeMnIK6IQ-h", "Love & Light Diwali box", "A gold-finish festive box of treats and keepsakes for Diwali.", "Hampers", ["diwali", "hamper", "festive", "gift box", "luxury"], ["festivals"]],
    ["DdohSAaIJp4", "Fresh-flower aarti thali", "An aarti thali decorated with fresh roses and greens for Ganpati and festive pujas.", "Pooja", ["aarti", "thali", "pooja", "flowers", "ganpati", "festive"], ["festivals"]],
    ["DdnhrUiIYOp", "Gerbera aarti thali", "A festive aarti thali dressed in red gerberas and marigold.", "Pooja", ["aarti", "thali", "pooja", "flowers", "festive"], ["festivals"]],
  ]),
  ...maker("ig-sweet-surprise", "sweetsurprise.sr", ["food-coffee"], ["birthday", "festivals", "thank-you"], [
    ["DeivbNfjKYL", "Customised Diwali hamper", "Choose the treats and the decor; they build the hamper around your budget.", "Hampers", ["hamper", "diwali", "customised", "chocolate", "treats"], ["festivals"]],
    ["DeQt3W_jNab", "Luxury festive hamper", "Baklava, bon bons, rochers, flavoured nuts and festive diyas in one box.", "Hampers", ["hamper", "baklava", "chocolate", "nuts", "diya", "diwali", "luxury"], ["festivals"]],
    ["DeYc6fADNII", "Chocolate and diya platter", "A round festive platter of artisanal chocolates set around a diya.", "Chocolates", ["chocolate", "chocolates", "diya", "platter", "festive"], ["festivals", "thank-you"]],
    ["Dedl5F7jL6f", "Premium festive treat box", "A large box of assorted sweets, chocolates and nuts for the people you love.", "Hampers", ["hamper", "sweets", "chocolate", "nuts", "premium"], ["festivals"]],
  ]),
  ...maker("ig-twinkling-crafts", "twinkling_crafts", ["personalised", "art-handmade"], ["wedding", "festivals", "birthday"], [
    ["DeZYDB_C_zP", "Candle and diya festive set", "Gold candle votives and diyas on a marble tray, wrapped for Diwali.", "Festive sets", ["candle", "diya", "festive", "diwali", "decor"], ["festivals"]],
    ["DeQzx_vsJrT", "Ornate silver-finish frame", "A decorative silver-finish frame on a green panel, a festive keepsake.", "Keepsakes", ["frame", "silver", "keepsake", "festive", "decor"], ["festivals", "wedding"]],
    ["DeeqXvRCjx-", "Festive gift platter", "A red boat-shaped platter filled with festive treats.", "Festive sets", ["platter", "festive", "treats", "dry fruits", "diwali"], ["festivals"]],
    ["DeLuuQzgqtq", "Mauli-wrapped Diwali hamper", "A Diwali hamper finished with traditional mauli thread wrapping.", "Hampers", ["hamper", "diwali", "mauli", "traditional", "festive"], ["festivals"]],
  ]),
  ...maker("ig-decor-designs-by-tash", "decordesignsbytash", ["plants-nature"], ["birthday", "anniversary", "festivals"], [
    ["DcyjADADW0B", "Balloon hamper with a plush toy", "A clear balloon over a hamper of treats and a soft toy.", "Balloon hampers", ["balloon", "balloons", "hamper", "plush", "teddy", "kids"], ["birthday"]],
    ["Dc3-BkKjf0l", "Red rose and treats hamper", "Red roses arranged with chocolates in a gift box.", "Floral hampers", ["roses", "flowers", "chocolate", "hamper", "romantic"], ["anniversary", "birthday"]],
    ["DeO1O9cjQJY", "Gold Diwali hamper boxes", "Bespoke festive hampers in gold boxes, made to order.", "Hampers", ["hamper", "diwali", "festive", "gold", "bespoke"], ["festivals"]],
    ["DcYqx2RDT1I", "Pink gift box set", "A set of pink gift boxes with ribbons and treats.", "Hampers", ["gift box", "pink", "hamper", "treats"], ["birthday", "just-because"]],
    ["DcOqNssjQqr", "Baby-announcement hamper", "A \"baby loading\" hamper with a cake, a teddy and treats to share the news.", "Hampers", ["baby", "baby announcement", "new baby", "pregnancy", "hamper", "teddy"], ["just-because"]],
    ["DdEzcPiDRy0", "Birthday balloon and flower bouquet", "White flowers and a \"Happy Birthday\" balloon in one arrangement.", "Balloon bouquets", ["balloon", "bouquet", "flowers", "birthday"], ["birthday"]],
    ["DcEMAiWDY3U", "Number balloon flower bouquet", "Flowers arranged with a number balloon for a milestone birthday.", "Balloon bouquets", ["balloon", "number balloon", "bouquet", "flowers", "milestone"], ["birthday"]],
  ]),
  ...maker("ig-tck", "tck_thechocolatekitchen", ["food-coffee"], ["festivals", "birthday", "thank-you"], [
    ["DdoswU-jy4f", "Tan brown chocolate hamper box", "Artisanal chocolates in TCK's tan brown hamper box.", "Chocolates", ["chocolate", "chocolates", "artisanal", "hamper", "box"]],
    ["DeRx8VQjTSi", "Magnet dates box of 12", "Twelve filled dates in a magnetic-close gift box.", "Chocolates", ["dates", "chocolate", "box", "festive"], ["festivals", "thank-you"]],
    ["DeoV34jGbx8", "Brown and ivory chocolate box", "An assortment of chocolates in a brown and ivory striped box.", "Chocolates", ["chocolate", "chocolates", "assortment", "box"]],
    ["Dd1ilqcDWcE", "Festive hamper basket", "TCK's bestselling festive basket with a bow, filled with chocolates.", "Hampers", ["hamper", "basket", "chocolate", "festive", "diwali"], ["festivals"]],
    ["DejQrQFDHtL", "Crimson burgundy hamper box", "Chocolates in a crimson box with gold foil detail, in several sizes.", "Chocolates", ["chocolate", "chocolates", "hamper", "box", "luxury"], ["festivals", "wedding"]],
    ["DecEeVzjWzu", "Sunset cream chocolate box", "A cream and tan box of chocolate-coated treats.", "Chocolates", ["chocolate", "chocolates", "box", "treats"]],
  ]),
  ...maker("ig-craft-auras", "craftauras", ["personalised"], ["birthday", "just-because"], [
    ["DdN1TvAsrDQ", "Pink personalised hamper", "A pink hamper with a plush bunny, treats and a personalised note.", "Hampers", ["hamper", "pink", "plush", "personalised", "treats"]],
    ["DdDjV2wMvvk", "Pipe-cleaner character bouquet", "A handmade bouquet of pipe-cleaner flowers with a favourite character, made to order.", "Handmade bouquets", ["bouquet", "pipe cleaner", "handmade", "flowers", "cartoon", "kids"]],
    ["DeYwU5kMHLC", "Purple surprise hamper", "A purple hamper box with a plush toy and goodies.", "Hampers", ["hamper", "purple", "plush", "surprise", "kids"]],
    ["DdN1sInDEU4", "Journal and keepsake hamper", "A pink journal with small keepsakes, packed as a gift set.", "Hampers", ["journal", "stationery", "hamper", "keepsake", "pink"]],
    ["DcvEkFJjO6Z", "Snack and drinks hamper", "A hamper of snacks, drinks and treats, packed to his taste.", "Hampers", ["hamper", "snacks", "treats", "him", "brother"]],
  ]),
  ...maker("ig-parva-creations", "parva.creations", ["personalised"], ["wedding", "festivals"], [
    ["Dd6iHt9AA8n", "Trousseau packing", "Wedding trousseau sarees and gifts packed and decorated on trays.", "Wedding packing", ["trousseau", "wedding", "saree", "packing", "bride"], ["wedding"]],
    ["Ded7FpvAqWr", "Handmade flower bunch", "A bunch of handcrafted flowers that won't wilt, for a keepsake or decor.", "Handmade flowers", ["flowers", "bouquet", "handmade", "artificial flowers", "decor"], ["birthday", "just-because"]],
  ]),
  ...maker("ig-chunks-of-heaven", "chunks.of.heaven_", ["plants-nature"], ["festivals", "birthday"], [
    ["DerHPszDViA", "Tiered festive hamper", "A gold tiered hamper of premium festive treats.", "Hampers", ["hamper", "diwali", "festive", "premium", "gold"], ["festivals"]],
    ["DeleUxlDUdT", "Curated Diwali hamper", "A curated festive hamper with treats and keepsakes in gold and green.", "Hampers", ["hamper", "diwali", "festive", "curated"], ["festivals"]],
  ]),
  ...maker("ig-bombay-board", "thebombayboard", ["food-coffee"], ["birthday", "festivals", "thank-you"], [
    ["DeolX3zIBmx", "Grazing table", "A spread of cheeses, dips and snacks for parties at home.", "Grazing tables", ["grazing", "cheese", "party", "host", "snacks", "platter"]],
    ["Deg-u_HCEZ5", "Custom cheese canvas", "An edible cheese canvas with natural colours, designed to match your event's theme.", "Cheese boards", ["cheese", "canvas", "custom", "baby shower", "party", "edible art"]],
    ["Ddg773VonCD", "Cheese and snack spread", "Signature cheeses, dips, starters and candy treats laid out for a celebration.", "Grazing tables", ["cheese", "snacks", "party", "grazing", "dips"]],
  ]),
];

export function getMakerProducts(makerId: string): MakerProduct[] {
  return makerProducts.filter((p) => p.makerId === makerId);
}

export function instagramPostUrl(code: string): string {
  return `https://www.instagram.com/p/${code}/`;
}
