import React from "react";
import Image from "next/image";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

interface MajorWorkItemProps {
  title: string;
  year: string;
  duration: string;
  concept?: string;
  description?: string;
  credits?: string;
  location?: string;
  images: string[];
}

export const MajorWorkItem: React.FC<MajorWorkItemProps> = ({
  title,
  year,
  duration,
  concept,
  description,
  credits,
  location,
  images,
}) => {
  const { t } = useFallbackTranslation();

  return (
    <div className="fade-in visible max-w-6xl mx-auto">
      {/* Images Grid */}
      {images && images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {images.slice(0, 6).map((image, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg hover-lift">
              <div className="aspect-[4/3] relative">
                <Image
                  src={image}
                  alt={`${title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    // Fallback to placeholder on error
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500">Work Image</span></div>';
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="space-y-8">
        {/* Title and Basic Info */}
        <div className="space-y-4">
          <h3 className="font-playfair text-4xl lg:text-5xl text-gray-900">"{title}"</h3>
          <div className="flex flex-wrap gap-6 text-lg text-gray-700">
            <div>
              <span className="font-medium">{t("ui.yearOfCreation")}</span> {year}
            </div>
            <div>
              <span className="font-medium">{t("ui.duration")}</span> {duration}
            </div>
          </div>
        </div>

        {/* Concept */}
        {concept && (
          <div className="space-y-4">
            <h4 className="text-2xl lg:text-3xl font-playfair text-gray-900">
              {t("ui.conceptDescription")}
            </h4>
            <div className="space-y-4 text-lg leading-relaxed text-gray-700">
              <p>{concept}</p>
              {description &&
                description.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </div>
        )}

        {/* Credits and Location */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          {credits && (
            <div>
              <h4 className="text-xl font-playfair text-gray-900 mb-2">{t("ui.credits")}</h4>
              <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-line">{credits}</p>
            </div>
          )}
          {location && (
            <div>
              <h4 className="text-xl font-playfair text-gray-900 mb-2">{t("ui.location")}</h4>
              <p className="text-lg leading-relaxed text-gray-700">{location}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
