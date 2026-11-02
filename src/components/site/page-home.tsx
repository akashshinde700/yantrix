"use client";

import type { ReactNode } from "react";
import { ImmersiveSpaceHero } from "@/components/site/immersive-space-hero";
import { BadgesStrip, WhyChooseUs, TrainingModes } from "@/components/site/why-choose-us";
import { TechTicker, StatsBand } from "@/components/site/tech-ticker";
import { AboutPreview } from "@/components/site/about-preview";
import { PlacementSection } from "@/components/site/placement-section";
import { FaqSection } from "@/components/site/faq-section";
import { CtaBand } from "@/components/site/cta-band";
import { TrainersSection } from "@/components/site/trainers-section";
import { PlacedStudents } from "@/components/site/placed-students";
import {
  AppSection,
  BrochureSection,
  CampusGallery,
  CentresSection,
  PartnersSection,
  TestimonialsSection,
  VideosSection,
} from "@/components/site/home-sections";

/**
 * Home page as a journey through the universe: every chapter id below is a
 * destination for the 3D camera (see universe/chapters.ts) and an entry in
 * the bottom chapter dock (rendered by the site shell).
 */
function Chapter({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div id={id} className="chapter relative scroll-mt-20 py-6 sm:py-10">
      {children}
    </div>
  );
}

export function PageHome() {
  return (
    <>
      <ImmersiveSpaceHero />
      <Chapter id="chapter-skills">
        <BadgesStrip />
        <TechTicker />
        <StatsBand />
      </Chapter>
      <Chapter id="chapter-why">
        <WhyChooseUs />
      </Chapter>
      <Chapter id="chapter-gallery">
        <CampusGallery />
        <PartnersSection />
      </Chapter>
      <Chapter id="chapter-modes">
        <TrainingModes />
      </Chapter>
      <Chapter id="chapter-about">
        <AboutPreview />
        <VideosSection />
        <TrainersSection />
        <TestimonialsSection />
      </Chapter>
      <Chapter id="chapter-placement">
        <PlacementSection />
        <PlacedStudents />
      </Chapter>
      <Chapter id="chapter-faq">
        <BrochureSection />
        <AppSection />
        <CentresSection />
        <FaqSection />
      </Chapter>
      <Chapter id="chapter-cta">
        <CtaBand />
      </Chapter>
    </>
  );
}
