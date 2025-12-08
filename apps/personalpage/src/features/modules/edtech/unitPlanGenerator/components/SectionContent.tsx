import React, { lazy, Suspense } from "react";
import {
  UnitPlanData,
  UnitPlanDocument,
  SubunitData,
  ActiveSection,
  QuestionType,
  AssessmentTask,
  ATLCard,
  ActivityCard,
  LearningExperienceCard,
  CurriculumConnection,
} from "../types/UnitPlanTypes";
import { SUBJECTS } from "../data/subjects";
import GuideSection from "./sections/GuideSection";
import BasicInfoSection from "./sections/BasicInfoSection";
import ContentSection from "./sections/ContentSection";
import InquirySection from "./sections/InquirySection";
import SummativeAssessmentSection from "./sections/SummativeAssessmentSection";
import PlanningSection from "./sections/PlanningSection";
import ATLSection from "./sections/ATLSection";
import ResourcesSection from "./sections/ResourcesSection";
import CommunityEngagementSection from "./sections/CommunityEngagementSection";
import ReflectionSection from "./sections/ReflectionSection";
import SettingsSection from "./sections/SettingsSection";
import DataManagementSection from "./sections/DataManagementSection";
import ContentDisplaySection from "./sections/ContentDisplaySection";
import YearPlanViewPlaceholder from "./ui/YearPlanViewPlaceholder";
import YearPlanContentView from "./sections/yearPlanViews/YearPlanContentView";
import YearPlanCommunityEngagementView from "./sections/yearPlanViews/YearPlanCommunityEngagementView";
import YearPlanReflectionView from "./sections/yearPlanViews/YearPlanReflectionView";
import YearPlanResourcesView from "./sections/yearPlanViews/YearPlanResourcesView";

// Lazy load the heaviest component
const PreviewSection = lazy(() => import("./sections/PreviewSection"));
const YearPlanPreviewSection = lazy(() => import("./sections/preview/YearPlanPreviewSection"));

interface SectionContentProps {
  activeSection: ActiveSection;
  unitPlan: UnitPlanData;
  unitPlans: UnitPlanDocument[];
  viewingMode: "individual" | "year";
  setViewingMode: (mode: "individual" | "year") => void;
  updateUnitPlan: (
    field: keyof UnitPlanData,
    value:
      | string
      | string[]
      | number
      | SubunitData[]
      | AssessmentTask[]
      | ATLCard[]
      | ActivityCard[]
      | LearningExperienceCard[]
      | CurriculumConnection[]
      | undefined
  ) => void;
  updateSubunit: (
    subunitIndex: number,
    field: keyof SubunitData,
    value: string | number | string[]
  ) => void;
  addSubunit: () => void;
  removeSubunit: (subunitIndex: number) => void;
  addQuestion: (type: QuestionType) => void;
  updateQuestion: (type: QuestionType, index: number, value: string) => void;
  removeQuestion: (type: QuestionType, index: number) => void;
  addTeacher: (teacherName: string) => void;
  removeTeacher: (teacherIndex: number) => void;
  exportToJSON: () => void;
  exportCollectionToJSON: () => void;
  importFromJSON: (files: File[]) => Promise<number>;
  exportAsHTML: () => void;
  exportCombinedAsHTML: () => void;
  exportZipHTML?: () => Promise<void>;
  exportYearPlanHTML?: () => void;
  exportAsPDF?: () => Promise<void>;
  exportYearPlanAsPDF?: () => Promise<void>;
  exportAllPlansAsZipPDF?: () => Promise<void>;
  onSectionChange: (section: ActiveSection) => void;
  updateSubunitByPlanId: (
    planId: string,
    subunitIndex: number,
    field: keyof SubunitData,
    value: string | number | string[]
  ) => void;
  addSubunitByPlanId: (planId: string) => void;
  removeSubunitByPlanId: (planId: string, subunitIndex: number) => void;
  updateCommunityEngagementByPlanId: (planId: string, value: string) => void;
  updateReflectionByPlanId: (
    planId: string,
    field:
      | "reflectionPriorToTeaching"
      | "reflectionDuringTeaching"
      | "reflectionAfterTeaching"
      | "reflectionFuturePlanning",
    value: string
  ) => void;
}

const SectionContent: React.FC<SectionContentProps> = React.memo(
  ({
    activeSection,
    unitPlan,
    unitPlans,
    viewingMode,
    setViewingMode: _setViewingMode,
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
    exportAsHTML,
    exportCombinedAsHTML,
    exportZipHTML,
    exportYearPlanHTML,
    exportAsPDF,
    exportYearPlanAsPDF,
    exportAllPlansAsZipPDF,
    onSectionChange,
    updateSubunitByPlanId,
    addSubunitByPlanId,
    removeSubunitByPlanId,
    updateCommunityEngagementByPlanId,
    updateReflectionByPlanId,
  }) => {
    const isYearPlanView = viewingMode === "year";

    // Sections that should always be available in both modes
    const alwaysAvailableSections: ActiveSection[] = [
      "guide",
      "settings",
      "data-management",
      "preview",
    ];

    // Sections that have Year Plan View implementations
    const yearPlanImplementedSections: ActiveSection[] = [
      "content",
      "community-engagement",
      "reflection",
      "resources",
    ];

    const renderSection = () => {
      // Special handling for sections with Year Plan View implementation
      if (isYearPlanView && yearPlanImplementedSections.includes(activeSection)) {
        if (activeSection === "content") {
          return (
            <YearPlanContentView
              unitPlans={unitPlans}
              onUpdateSubunit={updateSubunitByPlanId}
              onAddSubunit={addSubunitByPlanId}
              onRemoveSubunit={removeSubunitByPlanId}
            />
          );
        }
        if (activeSection === "community-engagement") {
          return (
            <YearPlanCommunityEngagementView
              unitPlans={unitPlans}
              onUpdateCommunityEngagement={updateCommunityEngagementByPlanId}
            />
          );
        }
        if (activeSection === "reflection") {
          return (
            <YearPlanReflectionView
              unitPlans={unitPlans}
              onUpdateReflection={updateReflectionByPlanId}
            />
          );
        }
        if (activeSection === "resources") {
          return <YearPlanResourcesView unitPlans={unitPlans} />;
        }
      }

      // Check if in Year Plan View mode and if this section should show placeholder
      if (isYearPlanView && !alwaysAvailableSections.includes(activeSection)) {
        return <YearPlanViewPlaceholder sectionName={activeSection} />;
      }

      switch (activeSection) {
        case "guide":
          return <GuideSection onSectionChange={onSectionChange} />;

        case "basic-info":
          return (
            <BasicInfoSection
              unitPlan={unitPlan}
              updateUnitPlan={updateUnitPlan}
              subjects={SUBJECTS}
              addTeacher={addTeacher}
              removeTeacher={removeTeacher}
            />
          );

        case "content":
          return (
            <ContentSection
              unitPlan={unitPlan}
              updateUnitPlan={updateUnitPlan}
              updateSubunit={updateSubunit}
              addSubunit={addSubunit}
              removeSubunit={removeSubunit}
            />
          );

        case "inquiry":
          return (
            <InquirySection
              unitPlan={unitPlan}
              updateUnitPlan={updateUnitPlan}
              addQuestion={addQuestion}
              updateQuestion={updateQuestion}
              removeQuestion={removeQuestion}
              subjects={SUBJECTS}
            />
          );

        case "summative-assessment":
          return <SummativeAssessmentSection unitPlan={unitPlan} updateUnitPlan={updateUnitPlan} />;

        case "planning":
          return (
            <PlanningSection
              unitPlan={unitPlan}
              updateUnitPlan={updateUnitPlan}
              subject={unitPlan.subject}
            />
          );

        case "atl":
          return (
            <ATLSection
              unitPlan={unitPlan}
              updateUnitPlan={updateUnitPlan}
              subject={unitPlan.subject}
            />
          );

        case "resources":
          return <ResourcesSection unitPlan={unitPlan} updateUnitPlan={updateUnitPlan} />;

        case "community-engagement":
          return <CommunityEngagementSection unitPlan={unitPlan} updateUnitPlan={updateUnitPlan} />;

        case "reflection":
          return <ReflectionSection unitPlan={unitPlan} updateUnitPlan={updateUnitPlan} />;

        case "settings":
          return <SettingsSection unitPlan={unitPlan} updateUnitPlan={updateUnitPlan} />;

        case "preview":
          if (isYearPlanView) {
            return (
              <Suspense fallback={<div>Loading Year Plan Preview...</div>}>
                <YearPlanPreviewSection unitPlans={unitPlans} />
              </Suspense>
            );
          }
          return (
            <Suspense fallback={<div>Loading Preview...</div>}>
              <PreviewSection unitPlan={unitPlan} />
            </Suspense>
          );

        case "content-display":
          return <ContentDisplaySection unitPlan={unitPlan} />;

        case "data-management":
          return (
            <DataManagementSection
              unitPlan={unitPlan}
              viewingMode={viewingMode}
              exportToJSON={exportToJSON}
              exportCollectionToJSON={exportCollectionToJSON}
              importFromJSON={importFromJSON}
              exportAsHTML={exportAsHTML}
              exportCombinedAsHTML={exportCombinedAsHTML}
              exportAllPlansAsZipHTML={exportZipHTML}
              exportYearPlanHTML={exportYearPlanHTML}
              exportAsPDF={exportAsPDF}
              exportYearPlanAsPDF={exportYearPlanAsPDF}
              exportAllPlansAsZipPDF={exportAllPlansAsZipPDF}
            />
          );

        default:
          return <GuideSection onSectionChange={onSectionChange} />;
      }
    };

    return <div className="p-6">{renderSection()}</div>;
  }
);

SectionContent.displayName = "SectionContent";

export default SectionContent;
