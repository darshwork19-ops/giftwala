const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Formats whole rupees, e.g. 1450 → "₹1,450". */
export function formatPrice(rupees: number): string {
  return inr.format(rupees);
}

/** "Ships in 2–4 working days" style label from a processing range. */
export function formatProcessing({ min, max }: { min: number; max: number }) {
  if (max === 0) return "Dispatched the same day";
  if (min === max) return `Dispatched in ${max} working day${max === 1 ? "" : "s"}`;
  return `Dispatched in ${min}–${max} working days`;
}
