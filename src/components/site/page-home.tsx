"use client";

import { ImmersiveSpaceHero } from "@/components/site/immersive-space-hero";
import { BadgesStrip, WhyChooseUs, TrainingModes } from "@/components/site/why-choose-us";
import { TechTicker, StatsBand } from "@/components/site/tech-ticker";
import { AboutPreview } from "@/components/site/about-preview";
import { PlacementSection } from "@/components/site/placement-section";
import { FaqSection } from "@/components/site/faq-section";
import { CtaBand } from "@/components/site/cta-band";

/**
 * Home page. The hero carries the site's one interactive moment (HeroField);
 * the sections below stay calm so the copy and CTAs do the work.
 */
export function PageHome() {
  return (
    <>
      <ImmersiveSpaceHero />
      <BadgesStrip />
      <TechTicker />
      <StatsBand />
      <WhyChooseUs />
      <TrainingModes />
      <AboutPreview />
      <PlacementSection />
      <FaqSection />
      <CtaBand />
    </>
  );
}
