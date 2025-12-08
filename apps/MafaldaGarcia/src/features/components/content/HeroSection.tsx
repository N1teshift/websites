import React from "react";
import { HeroContent } from "./HeroContent";
import { SmartImage } from "@websites/ui";

interface HeroSectionProps {
  heroImage?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ heroImage }) => {
  return (
    <section className="relative min-h-screen flex items-center">
      <div className="absolute inset-0 bg-artistic-dark"></div>
      <div className="relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          <HeroContent />
          <div className="relative min-h-screen">
            <SmartImage
              src={heroImage}
              alt="Mafalda Garcia"
              photographer="Ricardo Graça"
              priority={true}
              imageClassName="filter contrast-110 brightness-90"
              containerClassName="h-full"
              fallbackText="Artist Portrait"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
