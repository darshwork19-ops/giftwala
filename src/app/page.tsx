import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { MumbaiMakers } from "@/components/home/mumbai-makers";
import { OccasionLinks } from "@/components/home/occasion-links";

export default function HomePage() {
  return (
    <>
      <Hero />
      <OccasionLinks />
      <MumbaiMakers />
      <HowItWorks />
    </>
  );
}
