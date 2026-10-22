import { DrunkenMugStrip } from "@/components/home/drunken-mug-strip";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { MumbaiMakers } from "@/components/home/mumbai-makers";
import { OccasionLinks } from "@/components/home/occasion-links";
import { PopularGifts } from "@/components/home/popular-gifts";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularGifts />
      <MumbaiMakers />
      <OccasionLinks />
      <DrunkenMugStrip />
      <HowItWorks />
    </>
  );
}
