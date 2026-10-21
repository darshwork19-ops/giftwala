import type { DeliveryZone } from "@/lib/types";

/**
 * Mumbai neighbourhoods grouped into delivery zones. Matching is by name, so
 * "Andheri West" and "andheri" both resolve to the western suburbs.
 */
const AREAS: Record<DeliveryZone, string[]> = {
  "south-mumbai": [
    "Colaba", "Fort", "Churchgate", "Marine Lines", "Cuffe Parade", "Malabar Hill",
    "Worli", "Lower Parel", "Mahalaxmi", "Byculla", "Tardeo", "Prabhadevi",
  ],
  central: [
    "Dadar", "Matunga", "Sion", "Wadala", "Parel", "Chembur", "Kurla", "Ghatkopar",
    "Vikhroli", "Powai", "Bhandup", "Mulund",
  ],
  "western-suburbs": [
    "Bandra", "Khar", "Santacruz", "Vile Parle", "Juhu", "Andheri", "Versova",
    "Jogeshwari", "Goregaon", "Malad", "Kandivali", "Borivali", "Dahisar",
  ],
  thane: ["Thane"],
  "navi-mumbai": ["Navi Mumbai", "Vashi", "Nerul", "Belapur", "Kharghar", "Airoli"],
};

export const zoneLabels: Record<DeliveryZone, string> = {
  "south-mumbai": "South Mumbai",
  central: "Central Mumbai",
  "western-suburbs": "Western suburbs",
  thane: "Thane",
  "navi-mumbai": "Navi Mumbai",
};

export interface AreaMatch {
  area: string;
  zone: DeliveryZone;
}

const index = Object.entries(AREAS).flatMap(([zone, names]) =>
  names.map((name) => ({ name, zone: zone as DeliveryZone })),
);

/** Finds the first known Mumbai area mentioned in free text. */
export function findArea(text: string): AreaMatch | undefined {
  const lower = text.toLowerCase();
  // Longest names first so "Navi Mumbai" wins over a stray "Mumbai".
  const hit = [...index]
    .sort((a, b) => b.name.length - a.name.length)
    .find(({ name }) => new RegExp(`\\b${name.toLowerCase()}\\b`).test(lower));
  return hit ? { area: hit.name, zone: hit.zone } : undefined;
}

export const allAreaNames = index.map((a) => a.name).sort();
