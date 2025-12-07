import React from 'react';
import {
  Navigation,
  HeroSection,
  PhilosophySection,
  EducationSection,
  WorksSection,
  MajorWorksSection,
  PublicationsSection,
  GallerySection,
  ContactMeSection,
  FloatingFooter,
  ScrollAnimations,
  ArtisticStyles,
  LoadingScreen
} from './features/components';
import { usePortfolioImages, useScrollPosition } from './features/hooks';

interface MafaldaGarciaPageProps {
  title?: string;
  sections?: Array<{ heading?: string; paragraphs: string[]; backgroundColor?: string }>;
}

export const MafaldaGarciaPage: React.FC<MafaldaGarciaPageProps> = ({ 
}) => {
  const { images, loading, error } = usePortfolioImages({
    numImageSlots: 16,
    placeholderImage: 'education.jpg'
  });
  const { isAtBottom } = useScrollPosition();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    console.error('Portfolio loading error:', error);
  }

  const hasImages = images && images.length > 0;
  const hero = hasImages ? images[0] : undefined;
  const educationImage = hasImages && images.length > 1 ? images[1] : hero;

  return (
    <>
      <ArtisticStyles />

      <main className="min-h-screen w-full bg-white text-black font-inter">
        <Navigation />
        <HeroSection heroImage={hero} />
        <PhilosophySection image={hero} />
        <EducationSection image={educationImage} />
        <WorksSection images={images || []} />
        <MajorWorksSection images={images || []} />
        <PublicationsSection images={images || []} />
        <GallerySection images={images || []} />
        <ContactMeSection />
      </main>

      <FloatingFooter isAtBottom={isAtBottom} />
      <ScrollAnimations />
    </>
  );
};
