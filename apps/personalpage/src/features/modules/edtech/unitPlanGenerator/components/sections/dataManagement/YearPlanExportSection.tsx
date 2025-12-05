import React from 'react';
import { ExportType } from './useExportHandlers';

interface YearPlanExportSectionProps {
    handleExport: (type: ExportType) => void;
    isExporting: string;
    exportYearPlanHTML?: () => void;
    exportYearPlanAsPDF?: () => Promise<void>;
    exportCombinedAsHTML: () => void;
    exportAllPlansAsZipHTML?: () => void;
    exportAllPlansAsZipPDF?: () => Promise<void>;
    t: (key: string, params?: Record<string, unknown>) => string;
}

const YearPlanExportSection: React.FC<YearPlanExportSectionProps> = ({
    handleExport,
    isExporting,
    exportYearPlanHTML,
    exportYearPlanAsPDF,
    exportAllPlansAsZipHTML,
    exportAllPlansAsZipPDF,
    t
}) => {
    return (
        <>
            {/* Collection Export Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                <button
                    onClick={() => handleExport('collection')}
                    disabled={isExporting === 'collection'}
                    className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-indigo-700 bg-indigo-100 border border-indigo-300 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExporting === 'collection' ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-700 mr-2"></div>
                            {t('exporting')}
                        </>
                    ) : (
                        <>
                            <span className="mr-2">📦</span>
                            {t('export_collection_button')}
                        </>
                    )}
                </button>
            </div>

            {/* Year Plan Overview Export */}
            {(exportYearPlanHTML || exportYearPlanAsPDF) && (
                <div className="mt-6 p-6 bg-surface-card rounded-lg border-2 border-border-default">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-3xl">📋</div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-text-primary mb-2">
                                Export Year Plan Overview
                            </h3>
                            <p className="text-sm text-text-secondary mb-4">
                                Export a clean overview of your entire year plan showing all unit titles, order numbers, and lesson counts in a single summary page. Perfect for year planning and sharing with administrators.
                            </p>
                            <div className="flex gap-3">
                                {exportYearPlanHTML && (
                                    <button
                                        onClick={() => handleExport('yearPlanHtml')}
                                        disabled={isExporting === 'yearPlanHtml'}
                                        className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 border border-transparent rounded-md hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                    >
                                        {isExporting === 'yearPlanHtml' ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                {t('exporting')}
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2">📋</span>
                                                HTML
                                            </>
                                        )}
                                    </button>
                                )}
                                {exportYearPlanAsPDF && (
                                    <button
                                        onClick={() => handleExport('yearPlanPdf')}
                                        disabled={isExporting === 'yearPlanPdf'}
                                        className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 border border-transparent rounded-md hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                    >
                                        {isExporting === 'yearPlanPdf' ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                {t('exporting')}
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2">📕</span>
                                                PDF
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Combined HTML Export Section */}
            <div className="mt-6 p-6 bg-surface-card rounded-lg border-2 border-border-default">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-3xl">📚</div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-text-primary mb-2">
                            {t('export_combined_html_title') || 'Export Combined HTML Collection'}
                        </h3>
                        <p className="text-sm text-text-secondary mb-4">
                            {t('export_combined_html_description') || 'Export all loaded unit plans as a single HTML document with all plans combined into one file for easy viewing and printing.'}
                        </p>
                        <button
                            onClick={() => handleExport('combinedHtml')}
                            disabled={isExporting === 'combinedHtml'}
                            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 border border-transparent rounded-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {isExporting === 'combinedHtml' ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {t('exporting')}
                                </>
                            ) : (
                                <>
                                    <span className="mr-2">📦</span>
                                    {t('export_combined_html_button') || 'Export Combined HTML'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ZIP of Individual Files Export Section */}
            {(exportAllPlansAsZipHTML || exportAllPlansAsZipPDF) && (
                <div className="mt-6 p-6 bg-surface-card rounded-lg border-2 border-border-default">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-3xl">🗜️</div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-text-primary mb-2">
                                Export ZIP of Individual Files
                            </h3>
                            <p className="text-sm text-text-secondary mb-4">
                                Download a ZIP archive containing separate files for each unit plan. Each plan is exported as its own standalone file for individual distribution or archiving.
                            </p>
                            <div className="flex gap-3">
                                {exportAllPlansAsZipHTML && (
                                    <button
                                        onClick={() => handleExport('zipHtml')}
                                        disabled={isExporting === 'zipHtml'}
                                        className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 border border-transparent rounded-md hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                    >
                                        {isExporting === 'zipHtml' ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                {t('exporting')}
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2">📄</span>
                                                HTML ZIP
                                            </>
                                        )}
                                    </button>
                                )}
                                {exportAllPlansAsZipPDF && (
                                    <button
                                        onClick={() => handleExport('zipPdf')}
                                        disabled={isExporting === 'zipPdf'}
                                        className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-600 border border-transparent rounded-md hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                    >
                                        {isExporting === 'zipPdf' ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                {t('exporting')}
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2">📕</span>
                                                PDF ZIP
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default YearPlanExportSection;







