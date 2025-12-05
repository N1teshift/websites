import React, { useState, useCallback } from 'react';
import { ActiveSection } from './types/UnitPlanTypes';
import { 
    exportUnitPlanAsHTML, 
    exportCombinedUnitPlansAsHTML, 
    exportAllPlansAsZipHTML, 
    exportYearPlanAsHTML,
    exportUnitPlanAsPDF,
    exportYearPlanAsPDF,
    exportAllPlansAsZipPDF
} from './utils/exportUtils';
import { useMultipleUnitPlans } from './hooks/useMultipleUnitPlans';
import Navigation from './components/ui/Navigation';
import UnitPlanSwitcher from './components/ui/UnitPlanSwitcher';
import SectionContent from './components/SectionContent';

const UnitPlanGeneratorPage: React.FC = React.memo(() => {
    
    const [activeSection, setActiveSection] = useState<ActiveSection>('guide');
    const [viewingMode, setViewingMode] = useState<'individual' | 'year'>('individual');
    
    const {
        unitPlans,
        activeUnitPlanId,
        unitPlan,
        updateUnitPlan,
        updateSubunit,
        addSubunit,
        removeSubunit,
        addQuestion,
        updateQuestion,
        removeQuestion,
        addTeacher,
        removeTeacher,
        exportToJSON,
        exportCollectionToJSON,
        importFromJSON,
        switchToUnitPlan,
        addUnitPlan,
        duplicateUnitPlanWithBasicInfo,
        removeUnitPlan,
        updateUnitPlanName,
        getAllUnitPlansForExport,
        updateSubunitByPlanId,
        addSubunitByPlanId,
        removeSubunitByPlanId,
        updateCommunityEngagementByPlanId,
        updateReflectionByPlanId
    } = useMultipleUnitPlans();

    const exportAsHTML = useCallback(() => {
        exportUnitPlanAsHTML(unitPlan);
    }, [unitPlan]);

    const exportCombinedAsHTML = useCallback(() => {
        const allPlans = getAllUnitPlansForExport();
        const timestamp = new Date().toISOString().split('T')[0];
        exportCombinedUnitPlansAsHTML(allPlans, `combined_unit_plans_${timestamp}.html`);
    }, [getAllUnitPlansForExport]);

    const exportZipHTML = useCallback(async () => {
        const allPlans = getAllUnitPlansForExport();
        await exportAllPlansAsZipHTML(allPlans);
    }, [getAllUnitPlansForExport]);

    const exportYearPlanHTML = useCallback(() => {
        const timestamp = new Date().toISOString().split('T')[0];
        exportYearPlanAsHTML(unitPlans, `year_plan_overview_${timestamp}.html`);
    }, [unitPlans]);

    const exportAsPDF = useCallback(async () => {
        await exportUnitPlanAsPDF(unitPlan);
    }, [unitPlan]);

    const exportYearPlanPDF = useCallback(async () => {
        await exportYearPlanAsPDF(unitPlans);
    }, [unitPlans]);

    const exportZipPDF = useCallback(async () => {
        const allPlans = getAllUnitPlansForExport();
        await exportAllPlansAsZipPDF(allPlans);
    }, [getAllUnitPlansForExport]);

    const handleSectionChange = useCallback((section: ActiveSection) => {
        setActiveSection(section);
    }, []);

    const handleAddPlan = useCallback(() => {
        addUnitPlan();
    }, [addUnitPlan]);

    const handleDuplicateWithBasicInfo = useCallback(() => {
        duplicateUnitPlanWithBasicInfo();
    }, [duplicateUnitPlanWithBasicInfo]);

    return (
        <div className="w-full mx-auto relative min-h-screen bg-page-bg">
            <div className="bg-surface-card rounded-2xl shadow-large overflow-visible border border-border-default">
                {/* Sticky header container */}
                <div className="sticky top-0 z-50 bg-surface-card shadow-medium rounded-t-2xl">
                    <UnitPlanSwitcher
                        unitPlans={unitPlans}
                        activeUnitPlanId={activeUnitPlanId}
                        onSwitchPlan={switchToUnitPlan}
                        onRemovePlan={removeUnitPlan}
                        onAddPlan={handleAddPlan}
                        onDuplicateWithBasicInfo={handleDuplicateWithBasicInfo}
                        onRenamePlan={updateUnitPlanName}
                    />

                    <Navigation 
                        activeSection={activeSection}
                        onSectionChange={handleSectionChange}
                        unitPlan={unitPlan}
                        viewingMode={viewingMode}
                        setViewingMode={setViewingMode}
                    />
                </div>

                <SectionContent
                    activeSection={activeSection}
                    unitPlan={unitPlan}
                    unitPlans={unitPlans}
                    viewingMode={viewingMode}
                    setViewingMode={setViewingMode}
                    updateUnitPlan={updateUnitPlan}
                    updateSubunit={updateSubunit}
                    addSubunit={addSubunit}
                    removeSubunit={removeSubunit}
                    addQuestion={addQuestion}
                    updateQuestion={updateQuestion}
                    removeQuestion={removeQuestion}
                    addTeacher={addTeacher}
                    removeTeacher={removeTeacher}
                    exportToJSON={exportToJSON}
                    exportCollectionToJSON={exportCollectionToJSON}
                    importFromJSON={importFromJSON}
                    exportAsHTML={exportAsHTML}
                    exportCombinedAsHTML={exportCombinedAsHTML}
                    exportZipHTML={exportZipHTML}
                    exportYearPlanHTML={exportYearPlanHTML}
                    exportAsPDF={exportAsPDF}
                    exportYearPlanAsPDF={exportYearPlanPDF}
                    exportAllPlansAsZipPDF={exportZipPDF}
                    onSectionChange={handleSectionChange}
                    updateSubunitByPlanId={updateSubunitByPlanId}
                    addSubunitByPlanId={addSubunitByPlanId}
                    removeSubunitByPlanId={removeSubunitByPlanId}
                    updateCommunityEngagementByPlanId={updateCommunityEngagementByPlanId}
                    updateReflectionByPlanId={updateReflectionByPlanId}
                />
            </div>
        </div>
    );
});

UnitPlanGeneratorPage.displayName = 'UnitPlanGeneratorPage';

export default UnitPlanGeneratorPage;



