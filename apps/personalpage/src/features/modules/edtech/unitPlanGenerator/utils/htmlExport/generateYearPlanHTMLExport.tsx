import ReactDOMServer from 'react-dom/server';
import { UnitPlanDocument } from '../../types/UnitPlanTypes';
import { generateCSSFromTheme } from './themeToCSS';
import YearPlanPreviewSection from '../../components/sections/preview/YearPlanPreviewSection';

/**
 * Generate Year Plan HTML export
 * Shows overview of all unit plans in a collection
 */
export const generateYearPlanHTMLExport = (unitPlans: UnitPlanDocument[]): string => {
    // Render the year plan preview component to get the inner content
    const yearPlanHTML = ReactDOMServer.renderToStaticMarkup(
        <YearPlanPreviewSection unitPlans={unitPlans} />
    );
    
    // Get metadata for title
    const firstPlan = unitPlans[0]?.data;
    const schoolName = firstPlan?.schoolName || 'School';
    const academicYear = firstPlan?.academicYear || 'Academic Year';
    
    // Combine into complete HTML document - matching individual export structure exactly
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Year Plan Overview - ${schoolName} - ${academicYear}</title>
    <style>
        ${generateCSSFromTheme()}
    </style>
</head>
<body>
    ${yearPlanHTML}
</body>
</html>`;
};




