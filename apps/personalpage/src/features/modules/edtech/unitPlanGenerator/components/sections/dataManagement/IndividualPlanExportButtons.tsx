import React from 'react';
import { ExportType } from './useExportHandlers';

interface IndividualPlanExportButtonsProps {
    handleExport: (type: ExportType) => void;
    isExporting: string;
    exportAsPDF?: () => Promise<void>;
    t: (key: string, params?: Record<string, unknown>) => string;
}

const IndividualPlanExportButtons: React.FC<IndividualPlanExportButtonsProps> = ({
    handleExport,
    isExporting,
    exportAsPDF,
    t
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
            <button
                onClick={() => handleExport('json')}
                disabled={isExporting === 'json'}
                className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-text-primary bg-surface-button border border-border-default rounded-md hover:bg-surface-button-hover focus:outline-none focus:ring-2 focus:ring-brand transition-colors touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isExporting === 'json' ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-text-primary mr-2"></div>
                        {t('exporting')}
                    </>
                ) : (
                    <>
                        <span className="mr-2">📥</span>
                        {t('export_json_button')}
                    </>
                )}
            </button>
            
            <button
                onClick={() => handleExport('excel')}
                disabled={isExporting === 'excel'}
                className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-text-primary bg-surface-button border border-border-default rounded-md hover:bg-surface-button-hover focus:outline-none focus:ring-2 focus:ring-brand transition-colors touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isExporting === 'excel' ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-text-primary mr-2"></div>
                        {t('exporting')}
                    </>
                ) : (
                    <>
                        <span className="mr-2">📊</span>
                        {t('export_excel_button')}
                    </>
                )}
            </button>
            
            <button
                onClick={() => handleExport('docxtemplater')}
                disabled={isExporting === 'docxtemplater'}
                className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-text-primary bg-surface-button border border-border-default rounded-md hover:bg-surface-button-hover focus:outline-none focus:ring-2 focus:ring-brand transition-colors touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isExporting === 'docxtemplater' ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-text-primary mr-2"></div>
                        {t('exporting')}
                    </>
                ) : (
                    <>
                        <span className="mr-2">📋</span>
                        {t('export_word')}
                    </>
                )}
            </button>
            
            <button
                onClick={() => handleExport('html')}
                disabled={isExporting === 'html'}
                className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-text-primary bg-surface-button border border-border-default rounded-md hover:bg-surface-button-hover focus:outline-none focus:ring-2 focus:ring-brand transition-colors touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isExporting === 'html' ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-text-primary mr-2"></div>
                        {t('exporting')}
                    </>
                ) : (
                    <>
                        <span className="mr-2">📄</span>
                        {t('export_html_button')}
                    </>
                )}
            </button>
            
            {exportAsPDF && (
                <button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting === 'pdf'}
                    className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-text-primary bg-surface-button border border-border-default rounded-md hover:bg-surface-button-hover focus:outline-none focus:ring-2 focus:ring-brand transition-colors touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExporting === 'pdf' ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-text-primary mr-2"></div>
                            {t('exporting')}
                        </>
                    ) : (
                        <>
                            <span className="mr-2">📕</span>
                            Export PDF
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default IndividualPlanExportButtons;







