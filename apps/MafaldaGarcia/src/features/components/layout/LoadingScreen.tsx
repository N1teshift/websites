import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

export const LoadingScreen: React.FC = () => {
  const { t } = useFallbackTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-artistic-dark">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-artistic-gold mx-auto mb-4"></div>
        <p className="text-white font-playfair text-xl">{t("loading")}</p>
      </div>
    </div>
  );
};
