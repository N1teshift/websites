import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface UnderConstructionProps {
  /** Translation key for the construction message */
  messageKey?: string;
  /** Optional estimated completion date */
  estimatedCompletion?: string;
}

/**
 * UnderConstruction component for displaying "coming soon" or under construction states.
 *
 * Features:
 * - Translated construction message
 * - Optional estimated completion date
 */
export default function UnderConstruction({
  messageKey = "coming_soon_message",
  estimatedCompletion,
}: UnderConstructionProps) {
  const { t } = useFallbackTranslation();

  return (
    <div className="relative flex items-center justify-center h-full p-8 text-center">
      <div className="relative z-10 text-center space-y-4 bg-white/30 backdrop-blur-sm p-8 rounded-xl border border-white/50 shadow-lg">
        <p className="text-xl font-bold text-text-primary">{t(messageKey)}</p>
        {estimatedCompletion && (
          <p className="text-sm text-text-secondary mt-4">
            Expected completion: {estimatedCompletion}
          </p>
        )}
      </div>
    </div>
  );
}
