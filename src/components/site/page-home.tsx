"use client";

import { ImmersiveSpaceHero } from "@/components/site/immersive-space-hero";
import { BadgesStrip, WhyChooseUs, TrainingModes } from "@/components/site/why-choose-us";
import { TechTicker, StatsBand } from "@/components/site/tech-ticker";
import { AboutPreview } from "@/components/site/about-preview";
import { PlacementSection } from "@/components/site/placement-section";
import { FaqSection } from "@/components/site/faq-section";
import { CtaBand } from "@/components/site/cta-band";
import { CyberDivider } from "@/components/site/ai-decor";
import { CosmicDivider, StarFieldOverlay, NebulaSmoke } from "@/components/site/cosmic-effects";
import { AuroraBackground } from "@/components/site/aurora-background";
import { AnimatedGridPattern } from "@/components/site/grid-patterns";
import { BorderBeam } from "@/components/site/border-beam";

export function PageHome() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
         HERO: Immersive space + starfield
         ═══════════════════════════════════════════════════════════════ */}
      <ImmersiveSpaceHero />

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 1: Badges + Tech ticker — with enhanced effects
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <StarFieldOverlay className="absolute inset-0 z-0" count={25} />
        <NebulaSmoke vertical={false} className="absolute inset-0 z-0" />
        <AnimatedGridPattern
          className="absolute inset-0 z-0"
          width={30}
          height={40}
          cellSize={3}
          color="rgba(34, 211, 238, 0.15)"
        />
        <div className="relative z-10">
          <BadgesStrip />
          <TechTicker />
          <StatsBand />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 2: Why choose us + Training modes — cosmic divider
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 z-0 h-[200px] w-[200px]">
          <CosmicDivider direction="horizontal" className="absolute inset-0" />
        </div>
        <AuroraBackground className="absolute inset-0 z-0" />
        <div className="relative z-10">
          <WhyChooseUs />
          <TrainingModes />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         DIVIDER: Border beam with light sweep
         ═══════════════════════════════════════════════════════════════ */}
      <BorderBeam className="w-full py-3" color="rgba(34, 211, 238, 0.6)">
        <div className="h-full w-full" />
      </BorderBeam>

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 3: About preview — with star field
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <StarFieldOverlay className="absolute inset-0 z-0" count={30} />
        <NebulaSmoke className="absolute inset-0 z-0" />
        <div className="relative z-10">
          <AboutPreview />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         DIVIDER
         ═══════════════════════════════════════════════════════════════ */}
      <CyberDivider className="text-brand-400/70" />

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 4: Placement section — with enhanced effects
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <StarFieldOverlay className="absolute inset-0 z-0" count={20} />
        <div className="relative z-10">
          <PlacementSection />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 5: FAQ — subtle stars
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <StarFieldOverlay className="absolute inset-0 z-0" count={15} />
        <div className="relative z-10">
          <FaqSection />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         CTA BAND
         ═══════════════════════════════════════════════════════════════ */}
      <CtaBand />
    </>
  );
}
