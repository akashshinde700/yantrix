"use client";

import { HeroSlider } from "@/components/site/hero-slider";
import { BadgesStrip, WhyChooseUs, TrainingModes } from "@/components/site/why-choose-us";
import { AboutPreview } from "@/components/site/about-preview";
import { PlacementSection } from "@/components/site/placement-section";
import { FaqSection } from "@/components/site/faq-section";
import { CtaBand } from "@/components/site/cta-band";

export function PageHome() {
  return (
    <>
      <HeroSlider />
      <BadgesStrip />
      <WhyChooseUs />
      <TrainingModes />
      <AboutPreview />
      <PlacementSection />
      <FaqSection />
      <CtaBand />
    </>
  );
}
