import React from "react";
import Image from "next/image";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

export const ContactMeSection: React.FC = () => {
  const { t } = useFallbackTranslation();

  return (
    <section id="contact" className="relative py-20 lg:py-32 bg-artistic-dark text-white">
      {/* Background gradient overlay for footer merge effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-artistic-dark to-artistic-dark"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="font-playfair text-5xl lg:text-6xl text-white">{t("contact.title")}</h2>

            <div className="space-y-6 text-lg leading-relaxed text-gray-300">
              <div>
                <h3 className="font-medium text-white mb-2">{t("contact.address")}</h3>
                <p dangerouslySetInnerHTML={{ __html: t("contact.addressDetails") }} />
              </div>

              <div>
                <h3 className="font-medium text-white mb-2">{t("contact.phone")}</h3>
                <p>{t("contact.phoneNumber")}</p>
              </div>

              <div>
                <h3 className="font-medium text-white mb-2">{t("contact.email")}</h3>
                <a
                  href="mailto:mafalda.garsija@gmail.com"
                  className="text-artistic-gold hover:underline transition-colors duration-300"
                >
                  {t("contact.emailAddress")}
                </a>
              </div>
            </div>
          </div>

          {/* Placeholder Image */}
          <div className="fade-in visible">
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <div className="aspect-[4/5] relative">
                <Image
                  src={process.env.NEXT_PUBLIC_PLACEHOLDER_URL || ""}
                  alt="Contact Me"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-gray-500">Contact Image</span></div>';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer merge area - extra padding to accommodate floating footer */}
      <div className="relative z-10 h-20 lg:h-24"></div>
    </section>
  );
};
