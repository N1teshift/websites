import React from 'react';
import { UnitPlanData } from '../../types/UnitPlanTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import { useExportHandlers } from './dataManagement/useExportHandlers';
import IndividualPlanExportButtons from './dataManagement/IndividualPlanExportButtons';
import YearPlanExportSection from './dataManagement/YearPlanExportSection';
import ImportButton from './dataManagement/ImportButton';
import StatusMessage from './dataManagement/StatusMessage';

interface DataManagementSectionProps {
    unitPlan: UnitPlanData;
    viewingMode: 'individual' | 'year';
    exportToJSON: () => void;
    exportCollectionToJSON: () => void;
    importFromJSON: (files: File[]) => Promise<number>;
    exportAsHTML: () => void;
    exportCombinedAsHTML: () => void;
    exportAllPlansAsZipHTML?: () => void;
    exportYearPlanHTML?: () => void;
    exportAsPDF?: () => Promise<void>;
    exportYearPlanAsPDF?: () => Promise<void>;
    exportAllPlansAsZipPDF?: () => Promise<void>;
}

const DataManagementSection: React.FC<DataManagementSectionProps> = ({
    unitPlan,
    viewingMode,
    exportToJSON,
    exportCollectionToJSON,
    importFromJSON,
    exportAsHTML,
    exportCombinedAsHTML,
    exportAllPlansAsZipHTML,
    exportYearPlanHTML,
    exportAsPDF,
    exportYearPlanAsPDF,
    exportAllPlansAsZipPDF
}) => {
    const { t } = useFallbackTranslation();
    
    const { handleExport, exportStatus, isExporting } = useExportHandlers({
        unitPlan,
        exportToJSON,
        exportCollectionToJSON,
        exportAsHTML,
        exportCombinedAsHTML,
        exportAllPlansAsZipHTML,
        exportYearPlanHTML,
        exportAsPDF,
        exportYearPlanAsPDF,
        exportAllPlansAsZipPDF,
        t
    });

    const isYearPlanView = viewingMode === 'year';

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <div className="flex items-center gap-3 pb-4 border-b-2 border-border-default mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-medium">
                        <span className="text-white text-xl font-bold">💾</span>
                    </div>
                    <h2 className="text-3xl font-bold text-text-primary">{t('data_management')}</h2>
                </div>
                <p className="text-text-secondary text-base bg-surface-button border-l-4 border-secondary-500 p-4 rounded-r-xl">
                    {isYearPlanView 
                        ? 'Export and import your entire collection of unit plans. Collection exports include all currently loaded plans.'
                        : t('data_management_description')
                    }
                </p>
            </div>

            {/* Individual Plan View */}
            {!isYearPlanView && (
                <>
                    <IndividualPlanExportButtons
                        handleExport={handleExport}
                        isExporting={isExporting}
                        exportAsPDF={exportAsPDF}
                        t={t}
                    />
                    <ImportButton importFromJSON={importFromJSON} t={t} />
                </>
            )}

            {/* Year Plan View */}
            {isYearPlanView && (
                <>
                    <ImportButton importFromJSON={importFromJSON} t={t} />
                    <YearPlanExportSection
                        handleExport={handleExport}
                        isExporting={isExporting}
                        exportYearPlanHTML={exportYearPlanHTML}
                        exportYearPlanAsPDF={exportYearPlanAsPDF}
                        exportCombinedAsHTML={exportCombinedAsHTML}
                        exportAllPlansAsZipHTML={exportAllPlansAsZipHTML}
                        exportAllPlansAsZipPDF={exportAllPlansAsZipPDF}
                        t={t}
                    />
                </>
            )}
            
            <StatusMessage message={exportStatus} />
        </div>
    );
};

export default DataManagementSection;



