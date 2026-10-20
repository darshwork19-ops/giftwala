/**
 * Core domain types for GIFTWALA.
 *
 * Product data drives what the UI is allowed to show: a product only offers
 * the personalisation options listed on its own record.
 */

export type OccasionId =
  | "birthday"
  | "anniversary"
  | "thank-you"
  | "wedding"
  | "festivals"
  | "just-because";

export type CategoryId =
  | "hampers"
  | "candles"
  | "stationery"
  | "chocolates-treats"
  | "ceramics"
  | "flowers-plants"
  | "keepsakes"
  | "home-decor"
  | "accessories";

export type RecipientId =
  | "partner"
  | "friend"
  | "parent"
  | "sibling"
  | "colleague"
  | "someone-else";

export type InterestId =
  | "books-stationery"
  | "food-coffee"
  | "art-handmade"
  | "home-decor"
  | "self-care"
  | "keepsakes"
  | "plants-nature"
  | "personalised";

export interface ImageAsset {
  src: string;
  alt: string;
}

interface PersonalisationBase {
  id: string;
  label: string;
  required: boolean;
  helpText?: string;
  /** Extra working days the maker needs when this option is used. */
  processingDaysAdded?: number;
}

/** Free text: recipient name, gift message, engraving, printed text. */
export interface TextPersonalisation extends PersonalisationBase {
  kind: "text";
  maxLength: number;
  /** Extra cost in INR when the field is filled in. */
  extraCost: number;
  multiline?: boolean;
  placeholder?: string;
}

/** A single choice from a fixed list: colour, packaging, scent. */
export interface ChoicePersonalisation extends PersonalisationBase {
  kind: "choice";
  choices: { id: string; label: string; extraCost: number }[];
}

export type PersonalisationOption = TextPersonalisation | ChoicePersonalisation;

export type StockStatus = "in-stock" | "low-stock" | "made-to-order";

/**
 * Return rules configured per product. Personalised and perishable items are
 * not returnable unless they arrive damaged.
 */
export type ReturnPolicy = "returnable" | "non-returnable-perishable";

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** One line used on cards and in recommendation explanations. */
  summary: string;
  description: string;
  materials?: string[];
  category: CategoryId;
  occasions: OccasionId[];
  recipients: RecipientId[];
  interests: InterestId[];
  /** Base price in whole rupees. */
  price: number;
  images: ImageAsset[];
  makerId: string;
  personalisation: PersonalisationOption[];
  stock: StockStatus;
  /** Working days for the maker to prepare and dispatch the order. */
  processingDays: { min: number; max: number };
  returnPolicy: ReturnPolicy;
  tags: string[];
  featured?: boolean;
}

export interface Maker {
  id: string;
  slug: string;
  name: string;
  location: string;
  craft: string;
  /** Short line for cards. */
  tagline: string;
  /** A few sentences for the profile page. */
  story: string;
  process?: string;
  image: ImageAsset;
}

export interface Occasion {
  id: OccasionId;
  label: string;
  blurb: string;
  image: ImageAsset;
}

export interface Category {
  id: CategoryId;
  label: string;
}
