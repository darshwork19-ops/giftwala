import type { Metadata } from "next";
import { GiftBoxBuilder } from "@/components/gift-box/gift-box-builder";

export const metadata: Metadata = {
  title: "Mix and match a gift box",
  description: "Choose 2 to 6 gifts from GIFTWALA makers and send them together in one box.",
};

export default function GiftBoxPage() {
  return (
    <div className="page-container py-10 sm:py-14">
      <p className="eyebrow mb-3">Gift box</p>
      <h1 className="max-w-2xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
        Mix and match a gift box
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Pick 2 to 6 gifts — a mug and chocolates, a candle and a journal — and send them together. We check that
        every maker in the box delivers to the same area and show the earliest date the whole box can arrive.
      </p>
      <div className="mt-8">
        <GiftBoxBuilder />
      </div>
    </div>
  );
}
