import React from "react";
import Image from "next/image";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

interface GallerySectionProps {
  images: string[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ images = [] }) => {
  const { t } = useFallbackTranslation();

  return (
    <section id="gallery" className="py-20 lg:py-32 bg-artistic-dark text-white">
      <div className="max-w-7xl mx-auto px-8">
        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
          {images.slice(0, 8).map((image, index) => (
            <div key={index} className="fade-in visible">
              <div className="relative overflow-hidden rounded-lg hover-lift">
                <div className="aspect-square relative">
                  <Image
                    src={image}
                    alt={`Gallery Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    onError={(e) => {
                      // Fallback to placeholder on error
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML =
                          '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500">Gallery Image</span></div>';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quote from MG */}
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="artistic-quote relative text-2xl lg:text-3xl leading-relaxed italic font-light">
            {t("gallery.quote")}
          </blockquote>
          <p className="text-lg text-warm-gray mt-6">{t("gallery.author")}</p>
        </div>
      </div>
    </section>
  );
};
