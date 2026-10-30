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
import { AnimatedGradient } from "@/components/site/animated-gradients";
import { ScrollReveal, StardustEffect, FloatingParticles } from "@/components/site/scroll-animations";

export function PageHome() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
         HERO: Immersive space + starfield
         ═══════════════════════════════════════════════════════════════ */}
      <ImmersiveSpaceHero />

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 1: Badges + Tech ticker — with stardust effect
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
        <StardustEffect className="absolute inset-0 z-0" particleCount={40} color="rgba(255,255,255,0.5)" size={3} />
        <div className="relative z-10">
          <BadgesStrip />
          <TechTicker />
          <StatsBand />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 2: Why choose us + Training modes — floating particles
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 z-0 h-[200px] w-[200px]">
          <CosmicDivider direction="horizontal" className="absolute inset-0" />
        </div>
        <AuroraBackground className="absolute inset-0 z-0" />
        <FloatingParticles className="absolute inset-0 z-0" count={30} color="rgba(255,255,255,0.4)" size={3} />
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
         SECTION 3: About preview — with gradient + particles
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <StarFieldOverlay className="absolute inset-0 z-0" count={30} />
        <NebulaSmoke className="absolute inset-0 z-0" />
        <AnimatedGradient
          className="absolute inset-0 z-0"
          colors={[
            "rgba(6, 182, 212, 0.2)",
            "rgba(99, 102, 241, 0.25)",
            "rgba(236, 72, 153, 0.2)",
          ]}
          speed={1.2}
          intensity={0.5}
        />
        <FloatingParticles className="absolute inset-0 z-0" count={20} color="rgba(168,85,247,0.5)" size={3} />
        <div className="relative z-10">
          <AboutPreview />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         DIVIDER
         ═══════════════════════════════════════════════════════════════ */}
      <CyberDivider className="text-brand-400/70" />

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 4: Placement section — with stardust + gradient
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <StardustEffect className="absolute inset-0 z-0" particleCount={35} color="rgba(34,211,238,0.6)" size={3} />
        <AnimatedGradient
          className="absolute inset-0 z-0"
          colors={[
            "rgba(168, 85, 247, 0.2)",
            "rgba(99, 102, 241, 0.25)",
            "rgba(6, 182, 212, 0.15)",
          ]}
          speed={1}
          intensity={0.6}
        />
        <div className="relative z-10">
          <PlacementSection />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 5: FAQ — subtle particles
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <StarFieldOverlay className="absolute inset-0 z-0" count={15} />
        <FloatingParticles className="absolute inset-0 z-0" count={15} color="rgba(255,255,255,0.3)" size={2} />
        <div className="relative z-10">
          <FaqSection />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         CTA BAND — with golden stardust effect
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <StardustEffect className="absolute inset-0 z-0" particleCount={50} color="rgba(255,200,50,0.7)" size={4} />
        <div className="relative z-10">
          <CtaBand />
        </div>
      </section>
    </>
  );
}
