import React from 'react';
import { MajorWorkItem } from '../ui/MajorWorkItem';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

interface MajorWorksSectionProps {
  images: string[];
}

export const MajorWorksSection: React.FC<MajorWorksSectionProps> = ({ images = [] }) => {
  const { t } = useFallbackTranslation();

  const majorWorks = [
    {
      title: t('majorWorks.existentialServices.title'),
      year: t('majorWorks.existentialServices.year'),
      duration: t('majorWorks.existentialServices.duration'),
      concept: t('majorWorks.existentialServices.concept'),
      description: t('majorWorks.existentialServices.description'),
      credits: t('majorWorks.existentialServices.credits'),
      location: t('majorWorks.existentialServices.location'),
      images: images.slice(0, 6)
    },
    {
      title: t('majorWorks.youAre.title'),
      year: t('majorWorks.youAre.year'),
      duration: t('majorWorks.youAre.duration'),
      concept: t('majorWorks.youAre.concept'),
      description: t('majorWorks.youAre.description'),
      credits: t('majorWorks.youAre.credits'),
      location: t('majorWorks.youAre.location'),
      images: images.slice(0, 6)
    },
    {
      title: t('majorWorks.freeDoom.title'),
      year: t('majorWorks.freeDoom.year'),
      duration: t('majorWorks.freeDoom.duration'),
      concept: t('majorWorks.freeDoom.concept'),
      description: t('majorWorks.freeDoom.description'),
      credits: t('majorWorks.freeDoom.credits'),
      location: t('majorWorks.freeDoom.location'),
      images: images.slice(0, 6)
    },
    {
      title: t('majorWorks.invisibleLines.title'),
      year: t('majorWorks.invisibleLines.year'),
      duration: t('majorWorks.invisibleLines.duration'),
      concept: t('majorWorks.invisibleLines.concept'),
      description: t('majorWorks.invisibleLines.description'),
      credits: t('majorWorks.invisibleLines.credits'),
      location: t('majorWorks.invisibleLines.location'),
      images: images.slice(0, 6)
    },
    {
      title: t('majorWorks.santaPaciencia.title'),
      year: t('majorWorks.santaPaciencia.year'),
      duration: t('majorWorks.santaPaciencia.duration'),
      concept: t('majorWorks.santaPaciencia.concept'),
      description: t('majorWorks.santaPaciencia.description'),
      credits: t('majorWorks.santaPaciencia.credits'),
      location: t('majorWorks.santaPaciencia.location'),
      images: images.slice(0, 6)
    },
    {
      title: t('majorWorks.obscura.title'),
      year: t('majorWorks.obscura.year'),
      duration: t('majorWorks.obscura.duration'),
      concept: t('majorWorks.obscura.concept'),
      description: t('majorWorks.obscura.description'),
      credits: t('majorWorks.obscura.credits'),
      location: t('majorWorks.obscura.location'),
      images: images.slice(0, 6)
    },
    {
      title: t('majorWorks.ouroborus.title'),
      year: t('majorWorks.ouroborus.year'),
      duration: t('majorWorks.ouroborus.duration'),
      concept: t('majorWorks.ouroborus.concept'),
      description: t('majorWorks.ouroborus.description'),
      credits: t('majorWorks.ouroborus.credits'),
      location: t('majorWorks.ouroborus.location'),
      images: images.slice(0, 6)
    },
    {
      title: t('majorWorks.abscôndito.title'),
      year: t('majorWorks.abscôndito.year'),
      duration: t('majorWorks.abscôndito.duration'),
      concept: t('majorWorks.abscôndito.concept'),
      description: t('majorWorks.abscôndito.description'),
      credits: t('majorWorks.abscôndito.credits'),
      location: t('majorWorks.abscôndito.location'),
      images: images.slice(0, 6)
    }
  ];

  return (
    <section id="major-works" className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-6xl font-playfair text-gray-900 mb-6">
            {t('navigation.majorWorks')}
          </h2>
        </div>

        <div className="space-y-24">
          {majorWorks.map((work, index) => (
            <MajorWorkItem
              key={index}
              title={work.title}
              year={work.year}
              duration={work.duration}
              concept={work.concept}
              description={work.description}
              credits={work.credits}
              location={work.location}
              images={work.images}
            />
          ))}
        </div>
      </div>
      <div className="section-divider"></div>
    </section>
  );
};
