import ReactDOMServer from "react-dom/server";
import { UnitPlanData } from "../../types/UnitPlanTypes";
import PreviewHeader from "../../components/sections/preview/PreviewHeader";
import PreviewInquirySection from "../../components/sections/preview/PreviewInquirySection";
import PreviewAssessmentSection from "../../components/sections/preview/PreviewAssessmentSection";
import PreviewATLSection from "../../components/sections/preview/PreviewATLSection";
import PreviewActionSection from "../../components/sections/preview/PreviewActionSection";
import PreviewResourcesSection from "../../components/sections/preview/PreviewResourcesSection";
import PreviewCommunitySection from "../../components/sections/preview/PreviewCommunitySection";
import PreviewReflectionSection from "../../components/sections/preview/PreviewReflectionSection";
import { generateCSSFromTheme } from "./themeToCSS";

/**
 * Generate complete HTML export using React components (single source of truth)
 */
export const generateHTMLExport = (unitPlan: UnitPlanData): string => {
  // Render each section to static HTML
  const headerHTML = ReactDOMServer.renderToStaticMarkup(<PreviewHeader unitPlan={unitPlan} />);

  const sectionsHTML = ReactDOMServer.renderToStaticMarkup(
    <div className="p-8 space-y-8">
      <PreviewInquirySection unitPlan={unitPlan} />
      <PreviewAssessmentSection unitPlan={unitPlan} />
      <PreviewATLSection unitPlan={unitPlan} />
      <PreviewActionSection unitPlan={unitPlan} />
      <PreviewResourcesSection unitPlan={unitPlan} />
      <PreviewCommunitySection unitPlan={unitPlan} />
      <PreviewReflectionSection unitPlan={unitPlan} />
    </div>
  );

  // Combine into complete HTML document
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unit Plan - ${unitPlan.schoolName} - ${unitPlan.unitTitle}</title>
    <style>
        ${generateCSSFromTheme()}
    </style>
</head>
<body>
    <div class="container">
        ${headerHTML}
        ${sectionsHTML}
    </div>
</body>
</html>`;
};
