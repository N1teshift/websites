import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { UnitPlanData, UnitPlanDocument } from '../types/UnitPlanTypes';
import { generateHTMLExport } from './htmlExport/generateHTMLExport';
import { generateYearPlanHTMLExport } from './htmlExport/generateYearPlanHTMLExport';
import { generateCSSFromTheme } from './htmlExport/themeToCSS';

/**
 * Exports unit plan data as an HTML file for download
 * Uses React components as single source of truth for both preview and export
 * @param unitPlan - The unit plan data to export
 * @param filename - Optional filename for the download (defaults to 'unit-plan.html')
 */
export const exportUnitPlanAsHTML = (unitPlan: UnitPlanData, filename: string = 'unit-plan.html'): void => {
    const htmlContent = generateHTMLExport(unitPlan);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Mobile-friendly download handling
    try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading HTML:', error);
        // Fallback: open in new tab
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
};

/**
 * Exports multiple unit plans as a combined HTML file
 * @param unitPlans - Array of unit plan data objects to export
 * @param filename - Optional filename for the download
 */
export const exportCombinedUnitPlansAsHTML = (
    unitPlans: Array<{ name: string; data: UnitPlanData }>,
    filename: string = 'combined-unit-plans.html'
): void => {
    // Generate HTML content for each unit plan
    const unitPlanSections = unitPlans.map((plan, index) => {
        const htmlContent = generateHTMLExport(plan.data);
        // Extract just the body content (remove HTML, head, and body tags)
        const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : htmlContent;
        
        // Add separator and page break between plans (except for the last one)
        const separator = index < unitPlans.length - 1 
            ? '<div style="page-break-after: always; margin: 3rem 0; border-top: 3px solid #e5e7eb;"></div>'
            : '';
        
        return `${bodyContent}${separator}`;
    }).join('\n');

    // Get the title for the combined document
    const timestamp = new Date().toISOString().split('T')[0];
    const title = `Combined Unit Plans - ${timestamp}`;

    // Combine into complete HTML document
    const combinedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${generateCSSFromTheme()}
        
        /* Additional styles for combined export */
        @media print {
            .page-break {
                page-break-after: always;
            }
        }
        
        /* Add some spacing for the combined view */
        body {
            padding: 40px 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div style="text-align: center; padding: 2rem; margin-bottom: 2rem; border-bottom: 2px solid #e5e7eb;">
            <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">Combined Unit Plans Collection</h1>
            <p style="color: #6b7280; font-size: 1rem;">Generated: ${timestamp}</p>
            <p style="color: #6b7280; font-size: 1rem;">Total Plans: ${unitPlans.length}</p>
        </div>
        ${unitPlanSections}
    </div>
</body>
</html>`;

    const blob = new Blob([combinedHTML], { type: 'text/html' });
    
    // Mobile-friendly download handling
    try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading combined HTML:', error);
        // Fallback: open in new tab
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
};

/**
 * Exports multiple unit plans as individual HTML files in a ZIP archive
 * @param unitPlans - Array of unit plan data objects to export
 */
export const exportAllPlansAsZipHTML = async (
    unitPlans: Array<{ name: string; data: UnitPlanData }>
): Promise<void> => {
    try {
        const zip = new JSZip();
        const timestamp = new Date().toISOString().split('T')[0];
        
        // Generate HTML for each plan and add to ZIP
        unitPlans.forEach((plan, index) => {
            const htmlContent = generateHTMLExport(plan.data);
            
            // Create a safe filename from unit title or plan name
            const unitTitle = plan.data.unitTitle || plan.name || `Unit Plan ${index + 1}`;
            const safeFilename = unitTitle
                .replace(/[^a-z0-9]/gi, '_')  // Replace non-alphanumeric with underscore
                .replace(/_{2,}/g, '_')        // Replace multiple underscores with single
                .toLowerCase();
            
            // Add order number prefix if unitOrder exists and is greater than 0
            const orderPrefix = (plan.data.unitOrder && plan.data.unitOrder > 0) ? `${String(plan.data.unitOrder).padStart(2, '0')}_` : '';
            const finalFilename = `${orderPrefix}${safeFilename}.html`;
            
            zip.file(finalFilename, htmlContent);
        });
        
        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        // Download the ZIP file
        const zipFilename = `unit_plans_collection_${timestamp}.zip`;
        saveAs(zipBlob, zipFilename);
        
    } catch (error) {
        console.error('Error creating ZIP file:', error);
        throw error;
    }
};

/**
 * Exports year plan overview as HTML file
 * @param unitPlans - Array of all unit plans
 * @param filename - Optional filename for the download
 */
export const exportYearPlanAsHTML = (
    unitPlans: UnitPlanDocument[],
    filename: string = 'year-plan-overview.html'
): void => {
    const htmlContent = generateYearPlanHTMLExport(unitPlans);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Mobile-friendly download handling
    try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading year plan HTML:', error);
        // Fallback: open in new tab
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
};

/**
 * Exports unit plan as PDF file
 * @param unitPlan - The unit plan data to export
 * @param filename - Optional filename for the download
 */
export const exportUnitPlanAsPDF = async (
    unitPlan: UnitPlanData,
    filename?: string
): Promise<void> => {
    try {
        // Dynamically import html2pdf (client-side only)
        const html2pdf = (await import('html2pdf.js')).default;
        
        const htmlContent = generateHTMLExport(unitPlan);
        const defaultFilename = filename || `unit-plan-${unitPlan.unitTitle || 'export'}.pdf`;
        
        const options = {
            margin: [10, 10, 10, 10] as [number, number, number, number],
            filename: defaultFilename,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };
        
        await html2pdf().set(options).from(htmlContent).save();
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        throw error;
    }
};

/**
 * Exports year plan overview as PDF file
 * @param unitPlans - Array of all unit plans
 * @param filename - Optional filename for the download
 */
export const exportYearPlanAsPDF = async (
    unitPlans: UnitPlanDocument[],
    filename?: string
): Promise<void> => {
    try {
        // Dynamically import html2pdf (client-side only)
        const html2pdf = (await import('html2pdf.js')).default;
        
        const htmlContent = generateYearPlanHTMLExport(unitPlans);
        const timestamp = new Date().toISOString().split('T')[0];
        const defaultFilename = filename || `year-plan-overview-${timestamp}.pdf`;
        
        const options = {
            margin: [10, 10, 10, 10] as [number, number, number, number],
            filename: defaultFilename,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };
        
        await html2pdf().set(options).from(htmlContent).save();
    } catch (error) {
        console.error('Error exporting year plan to PDF:', error);
        throw error;
    }
};

/**
 * Exports multiple unit plans as individual PDF files in a ZIP archive
 * @param unitPlans - Array of unit plan data objects to export
 */
export const exportAllPlansAsZipPDF = async (
    unitPlans: Array<{ name: string; data: UnitPlanData }>
): Promise<void> => {
    try {
        const zip = new JSZip();
        const timestamp = new Date().toISOString().split('T')[0];
        
        // Dynamically import html2pdf (client-side only)
        const html2pdf = (await import('html2pdf.js')).default;
        
        // Generate PDF for each plan and add to ZIP
        for (let i = 0; i < unitPlans.length; i++) {
            const plan = unitPlans[i];
            const htmlContent = generateHTMLExport(plan.data);
            
            // Create a safe filename from unit title or plan name
            const unitTitle = plan.data.unitTitle || plan.name || `Unit Plan ${i + 1}`;
            const safeFilename = unitTitle
                .replace(/[^a-z0-9]/gi, '_')
                .replace(/_{2,}/g, '_')
                .toLowerCase();
            
            // Add order number prefix if unitOrder exists and is greater than 0
            const orderPrefix = (plan.data.unitOrder && plan.data.unitOrder > 0) ? `${String(plan.data.unitOrder).padStart(2, '0')}_` : '';
            const pdfFilename = `${orderPrefix}${safeFilename}.pdf`;
            
            // Configure options for PDF generation
            const options = {
                margin: [10, 10, 10, 10] as [number, number, number, number],
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };
            
            // Generate PDF as blob
            const pdfBlob = await html2pdf().set(options).from(htmlContent).outputPdf('blob');
            
            // Add to ZIP
            zip.file(pdfFilename, pdfBlob);
        }
        
        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        // Download the ZIP file
        const zipFilename = `unit_plans_pdf_collection_${timestamp}.zip`;
        saveAs(zipBlob, zipFilename);
        
    } catch (error) {
        console.error('Error creating PDF ZIP file:', error);
        throw error;
    }
};



