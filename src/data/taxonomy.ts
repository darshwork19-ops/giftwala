import { unsplash } from "@/lib/images";
import type {
  Category,
  CategoryId,
  InterestId,
  Occasion,
  RecipientId,
} from "@/lib/types";

export const occasions: Occasion[] = [
  {
    id: "birthday",
    label: "Birthday",
    blurb: "Something to open with a grin",
    image: {
      src: unsplash("photo-1764385827123-45525c44373c"),
      alt: "A golden gift box tied with pink and gold ribbons",
    },
  },
  {
    id: "anniversary",
    label: "Anniversary",
    blurb: "For the years, and the ones ahead",
    image: {
      src: unsplash("photo-1685613855323-a7e885dcbb2e"),
      alt: "A bunch of deep red roses resting on a table",
    },
  },
  {
    id: "thank-you",
    label: "Thank You",
    blurb: "Gratitude, said properly",
    image: {
      src: unsplash("photo-1549032305-e816fabf0dd2"),
      alt: "A handwritten thanks note and a black pen on wood",
    },
  },
  {
    id: "wedding",
    label: "Wedding",
    blurb: "For two people starting something",
    image: {
      src: unsplash("photo-1625552187571-7ee60ac43d2b"),
      alt: "Two hands exchanging a beautifully wrapped gift box",
    },
  },
  {
    id: "festivals",
    label: "Festivals",
    blurb: "Light, sweets and a full table",
    image: {
      src: unsplash("photo-1763610642272-787bfeb8045c"),
      alt: "Rows of small oil lamps burning brightly",
    },
  },
  {
    id: "just-because",
    label: "Just Because",
    blurb: "No reason needed",
    image: {
      src: unsplash("photo-1513201099705-a9746e1e201f"),
      alt: "A brown paper gift box tied with a pink ribbon",
    },
  },
];

export const categories: Category[] = [
  { id: "hampers", label: "Gift hampers" },
  { id: "candles", label: "Candles" },
  { id: "stationery", label: "Stationery" },
  { id: "chocolates-treats", label: "Chocolates & treats" },
  { id: "ceramics", label: "Ceramics" },
  { id: "flowers-plants", label: "Flowers & plants" },
  { id: "keepsakes", label: "Keepsakes" },
  { id: "home-decor", label: "Home decor" },
  { id: "accessories", label: "Artisan accessories" },
];

export const recipients: { id: RecipientId; label: string }[] = [
  { id: "partner", label: "Partner" },
  { id: "friend", label: "Friend" },
  { id: "parent", label: "Parent" },
  { id: "sibling", label: "Sibling" },
  { id: "colleague", label: "Colleague" },
  { id: "someone-else", label: "Someone else" },
];

export const interests: { id: InterestId; label: string }[] = [
  { id: "books-stationery", label: "Books & stationery" },
  { id: "food-coffee", label: "Food & coffee" },
  { id: "art-handmade", label: "Art & handmade goods" },
  { id: "home-decor", label: "Home & decor" },
  { id: "self-care", label: "Self-care" },
  { id: "keepsakes", label: "Keepsakes" },
  { id: "plants-nature", label: "Plants & nature" },
  { id: "personalised", label: "Personalised gifts" },
];

export function categoryLabel(id: CategoryId): string {
  return categories.find((c) => c.id === id)?.label ?? id;
}
