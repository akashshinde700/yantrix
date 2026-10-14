"use client";

import { HeroSlider } from "@/components/site/hero-slider";
import { BadgesStrip, WhyChooseUs, TrainingModes } from "@/components/site/why-choose-us";
import { TechTicker, StatsBand } from "@/components/site/tech-ticker";
import { AboutPreview } from "@/components/site/about-preview";
import { PlacementSection } from "@/components/site/placement-section";
import { FaqSection } from "@/components/site/faq-section";
import { CtaBand } from "@/components/site/cta-band";
import { CyberDivider } from "@/components/site/ai-decor";

export function PageHome() {
  return (
    <>
      <HeroSlider />
      <BadgesStrip />
      <TechTicker />
      <StatsBand />
      <WhyChooseUs />
      <TrainingModes />
      <CyberDivider className="text-brand-400/70" />
      <AboutPreview />
      <CyberDivider className="text-brand-400/70" />
      <PlacementSection />
      <FaqSection />
      <CtaBand />
    </>
  );
}
