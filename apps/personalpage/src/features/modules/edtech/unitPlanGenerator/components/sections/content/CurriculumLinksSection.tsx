import React, { useState } from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface CurriculumLinksSectionProps {
  mypYear?: number;
}

const CurriculumLinksSection: React.FC<CurriculumLinksSectionProps> = ({ mypYear }) => {
  const { t } = useFallbackTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!mypYear || ![1, 2, 3].includes(mypYear)) {
    return null;
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
      >
        <svg
          className={`w-4 h-4 mr-1.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        {t("curriculum_links")}
      </button>

      {isExpanded && (
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
          <div className="space-y-2">
            <a
              href="https://www.cambridge.org/go/ereader/read/9781108783897/?groupId=0&bookid=2273&root=anon#book/2273"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-700 hover:text-blue-900 hover:underline transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                  clipRule="evenodd"
                />
              </svg>
              {t("cambridge_program")}
            </a>
            <a
              href="https://emokykla.lt/bendrosios-programos/visos-bendrosios-programos/5?types=&clases=3656&educations=&st=2&ach-1=4&ach-2=4&ach-3=4&ct=4"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-700 hover:text-blue-900 hover:underline transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                  clipRule="evenodd"
                />
              </svg>
              {t("lithuanian_bup")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumLinksSection;
