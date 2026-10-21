import { CuratedGifts } from "@/components/home/curated-gifts";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { InterestGrid } from "@/components/home/interest-grid";
import { MakersIntro } from "@/components/home/makers-intro";
import { OccasionGrid } from "@/components/home/occasion-grid";
import { PersonaliseIntro } from "@/components/home/personalise-intro";
import { TrustSection } from "@/components/home/trust-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <InterestGrid />
      <OccasionGrid />
      <CuratedGifts />
      <MakersIntro />
      <HowItWorks />
      <PersonaliseIntro />
      <TrustSection />
    </>
  );
}
