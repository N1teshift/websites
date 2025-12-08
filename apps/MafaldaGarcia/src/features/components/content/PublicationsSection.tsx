import React from "react";
import Image from "next/image";
import { PublicationItem } from "../ui/PublicationItem";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

interface PublicationsSectionProps {
  images?: string[];
}

export const PublicationsSection: React.FC<PublicationsSectionProps> = ({ images = [] }) => {
  const { t } = useFallbackTranslation();

  const publications = [
    {
      title: t("publications.items.zaratan.title"),
      subtitle: t("publications.items.zaratan.subtitle"),
      description: t("publications.items.zaratan.description"),
      location: t("publications.items.zaratan.location"),
      year: t("publications.items.zaratan.year"),
      images: images.slice(0, 6),
    },
    {
      title: t("publications.items.freedomForum.title"),
      subtitle: t("publications.items.freedomForum.subtitle"),
      description: t("publications.items.freedomForum.description"),
      location: t("publications.items.freedomForum.location"),
      year: t("publications.items.freedomForum.year"),
      images: images.slice(0, 6),
    },
    {
      title: t("publications.items.criatura.title"),
      subtitle: t("publications.items.criatura.subtitle"),
      description: t("publications.items.criatura.description"),
      location: t("publications.items.criatura.location"),
      year: t("publications.items.criatura.year"),
      images: images.slice(0, 6),
    },
  ];

  return (
    <section id="publications" className="py-20 lg:py-32 bg-artistic-light">
      <div className="max-w-7xl mx-auto px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-6xl font-playfair text-gray-900 mb-6">
            {t("publications.title")}
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto">
            {t("publications.subtitle")}
          </p>
        </div>

        {/* Welcome Image */}
        <div className="mb-20">
          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <div className="aspect-[16/9] relative">
              <Image
                src={
                  images[0] ||
                  "https://via.placeholder.com/1600x900/f3f4f6/6b7280?text=Publications+Welcome+Image"
                }
                alt="Publications Welcome"
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML =
                      '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500">Publications Welcome Image</span></div>';
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Publications List */}
        <div className="space-y-24">
          {publications.map((publication, index) => (
            <PublicationItem
              key={index}
              title={publication.title}
              subtitle={publication.subtitle}
              description={publication.description}
              location={publication.location}
              year={publication.year}
              images={publication.images}
            />
          ))}
        </div>
      </div>
      <div className="section-divider dark"></div>
    </section>
  );
};
