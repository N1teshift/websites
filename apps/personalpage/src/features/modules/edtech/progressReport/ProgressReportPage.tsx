import React, { useState, useCallback } from "react";
import { ProgressReportActiveSection, StudentData } from "./types/ProgressReportTypes";
import { useProgressReportData } from "./hooks/useProgressReportData";
import GuideSection from "./components/sections/GuideSection";
import DataManagementSection from "./components/sections/DataManagementSection";
import StudentViewSection from "./components/sections/StudentViewSection";
import ClassViewSection from "./components/sections/ClassViewSection";
import GradeGeneratorSection from "./components/sections/GradeGeneratorSection";
import { ObjectivesTabContainer } from "./components/sections/ObjectivesTabContainer";
import CommentsGeneratorSection from "./components/sections/CommentsGeneratorSection";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import {
  BookOpen,
  Users,
  User,
  Target,
  BarChart3,
  MessageSquare,
  Database,
  LucideIcon,
} from "lucide-react";

const ProgressReportPage: React.FC = React.memo(() => {
  const { t } = useFallbackTranslation();
  const [activeSection, setActiveSection] = useState<ProgressReportActiveSection>("class-view");
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  const {
    data,
    isLoading,
    loadData,
    clearData,
    exportData,
    getUniqueClasses,
    validateData,
    hasUnsavedChanges,
    setUnsavedChanges,
  } = useProgressReportData();

  // Detect teacher type from metadata
  const teacherType = data?.metadata?.teacher_type || "main";
  const isEnglishTeacher = teacherType === "J" || teacherType === "A";

  const handleSectionChange = useCallback((section: ProgressReportActiveSection) => {
    setActiveSection(section);
  }, []);

  const handleSelectStudent = useCallback((student: StudentData) => {
    setSelectedStudent(student);
  }, []);

  const handleSwitchToStudentView = useCallback(() => {
    setActiveSection("student-view");
  }, []);

  const handleDataChange = useCallback(
    (updatedStudents: StudentData[]) => {
      if (!data) return;

      const updatedData = {
        ...data,
        students: updatedStudents,
      };

      loadData(updatedData);
      // Don't mark as unsaved here - the user has explicitly saved their changes
      // The unsaved flag should only be for pending edits that haven't been saved yet
    },
    [data, loadData]
  );

  const handlePendingEditsChange = useCallback(
    (hasPendingEdits: boolean) => {
      setUnsavedChanges(hasPendingEdits);
    },
    [setUnsavedChanges]
  );

  const handleSaveGrades = useCallback(
    (grades: Map<string, number>) => {
      if (!data) return;

      // Create updated student data with new generated grades
      const updatedStudents = data.students.map((student) => {
        const studentKey = `${student.first_name}-${student.last_name}`;
        const grade = grades.get(studentKey);

        if (grade === undefined) {
          return student;
        }

        // Create new assessment for the generated grade
        const newAssessment = {
          date: new Date().toISOString().split("T")[0], // Today's date
          column: "P1", // Percentage Grade
          type: "sav_darb" as const,
          task_name: "P1: Generated Grade",
          score: grade.toString(),
          comment: `Calculated from SD1, SD2, SD3 tests using formula: (SD1+SD2+SD3)×0.5, rounded up`,
          added: new Date().toISOString(),
          assessment_id: "p1",
          assessment_title: "P1",
        };

        return {
          ...student,
          assessments: [...(student.assessments || []), newAssessment],
        };
      });

      // Update the data
      const updatedData = {
        ...data,
        students: updatedStudents,
      };

      // Load the updated data
      loadData(updatedData);

      alert(`Successfully saved ${grades.size} calculated grades!`);
    },
    [data, loadData]
  );

  const sections: { key: ProgressReportActiveSection; label: string; icon: LucideIcon }[] = [
    { key: "guide", label: t("guide"), icon: BookOpen },
    { key: "class-view", label: t("class_view"), icon: Users },
    { key: "student-view", label: t("student_view"), icon: User },
    { key: "objectives", label: "Objectives", icon: Target },
    { key: "grade-generator", label: "Grade Generator", icon: BarChart3 },
    { key: "comments-generator", label: "Comments Generator", icon: MessageSquare },
    { key: "data-management", label: t("data_management"), icon: Database },
  ];

  const renderSection = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeSection) {
      case "guide":
        return <GuideSection onSectionChange={handleSectionChange} />;

      case "data-management":
        return (
          <DataManagementSection
            data={data}
            onLoadData={loadData}
            onClearData={clearData}
            onExportData={exportData}
            validateData={validateData}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        );

      case "student-view":
        return data ? (
          <StudentViewSection
            students={data.students}
            selectedStudent={selectedStudent}
            onSelectStudent={handleSelectStudent}
            onDataChange={handleDataChange}
            isEnglishTeacher={isEnglishTeacher}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">{t("no_data_loaded")}</p>
            <button
              onClick={() => handleSectionChange("data-management")}
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Go to Data Management →
            </button>
          </div>
        );

      case "class-view":
        return data ? (
          <ClassViewSection
            students={data.students}
            classes={getUniqueClasses()}
            onSelectStudent={handleSelectStudent}
            onSwitchToStudentView={handleSwitchToStudentView}
            onDataChange={handleDataChange}
            onPendingEditsChange={handlePendingEditsChange}
            isEnglishTeacher={isEnglishTeacher}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">{t("no_data_loaded")}</p>
            <button
              onClick={() => handleSectionChange("data-management")}
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Go to Data Management →
            </button>
          </div>
        );

      case "objectives":
        if (!data) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">{t("no_data_loaded")}</p>
              <button
                onClick={() => handleSectionChange("data-management")}
                className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Go to Data Management →
              </button>
            </div>
          );
        }

        // Check if this is main teacher data
        const objectivesTeacherType = data.metadata?.teacher_type || "main";
        if (objectivesTeacherType !== "main") {
          return (
            <div className="text-center py-12">
              <div className="max-w-2xl mx-auto">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Objectives Not Available
                </h3>
                <p className="text-gray-600 mb-4">
                  The Objectives feature is currently only available for the main teacher&apos;s
                  data (Math assessments).
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
                  <p className="text-blue-900 mb-2">
                    <strong>Current Data:</strong>{" "}
                    {data.metadata?.teacher_name || `Teacher ${objectivesTeacherType}`}
                  </p>
                  <p className="text-blue-800">
                    This feature is specifically designed for Cambridge Learning Objectives tracking
                    used in the main Math curriculum. For English assessment data, objectives are
                    tracked differently within the English curriculum.
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return <ObjectivesTabContainer students={data.students} onDataChange={handleDataChange} />;

      case "comments-generator":
        return data ? (
          <CommentsGeneratorSection students={data.students} teacherType={teacherType} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">{t("no_data_loaded")}</p>
            <button
              onClick={() => handleSectionChange("data-management")}
              className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Go to Data Management →
            </button>
          </div>
        );

      case "grade-generator":
        if (!data) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">{t("no_data_loaded")}</p>
              <button
                onClick={() => handleSectionChange("data-management")}
                className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Go to Data Management →
              </button>
            </div>
          );
        }

        // Check if this is main teacher data
        if (teacherType !== "main") {
          return (
            <div className="text-center py-12">
              <div className="max-w-2xl mx-auto">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Grade Generator Not Available
                </h3>
                <p className="text-gray-600 mb-4">
                  The Grade Generator is currently only available for the main teacher&apos;s data
                  (Math assessments).
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
                  <p className="text-blue-900 mb-2">
                    <strong>Current Data:</strong>{" "}
                    {data.metadata?.teacher_name || `Teacher ${teacherType}`}
                  </p>
                  <p className="text-blue-800">
                    This feature is specifically designed for SD1, SD2, SD3 test calculations used
                    in the main Math curriculum. For English assessment data, please use the Class
                    View to see all test scores and percentages.
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <GradeGeneratorSection
            students={data.students}
            classes={getUniqueClasses()}
            onSaveGrades={handleSaveGrades}
          />
        );

      default:
        return <GuideSection onSectionChange={handleSectionChange} />;
    }
  };

  return (
    <div className="w-full mx-auto relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-2xl shadow-large overflow-visible border border-gray-200">
        {/* Sticky header container */}
        <div className="sticky top-0 z-50 bg-white shadow-medium rounded-t-2xl">
          {/* Desktop Navigation */}
          <div className="hidden sm:block border-b border-gray-200 bg-gradient-to-b from-white to-gray-50/50">
            <div className="px-4 sm:px-6 py-3">
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  const isActive = activeSection === section.key;

                  return (
                    <button
                      key={section.key}
                      onClick={() => handleSectionChange(section.key)}
                      className={`group py-2.5 px-3.5 min-w-[110px] rounded-xl font-semibold text-xs transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-medium hover:shadow-large transform scale-105"
                          : "bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 hover:shadow-soft"
                      }`}
                      style={{ flexBasis: "calc(100% / 7 - 8px)" }}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <IconComponent
                          className={`${isActive ? "text-white" : "text-gray-500 group-hover:text-primary-600"} transition-colors`}
                          size={18}
                          strokeWidth={2.5}
                        />
                        <span className="whitespace-nowrap leading-tight text-center text-[11px]">
                          {section.label}
                        </span>
                      </div>
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden border-b border-gray-200 bg-gradient-to-b from-white to-gray-50/50">
            <div className="px-4 py-3">
              <div className="relative">
                <select
                  value={activeSection}
                  onChange={(e) =>
                    handleSectionChange(e.target.value as ProgressReportActiveSection)
                  }
                  className="w-full px-4 py-3 pr-10 text-base font-semibold text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none cursor-pointer"
                >
                  {sections.map((section) => (
                    <option key={section.key} value={section.key}>
                      {section.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Data Status Indicator */}
          {data && (
            <div className="bg-gradient-to-r from-success-50 to-emerald-50 border-b border-success-200 px-6 py-2.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
                  <span className="text-success-800 font-semibold">
                    {t("students_loaded", { count: data.students.length })}
                  </span>
                </div>
                {data.snapshot_metadata && (
                  <span className="text-success-600 text-xs font-medium bg-success-100 px-2 py-1 rounded-lg">
                    {data.snapshot_metadata.created_date}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">{renderSection()}</div>
      </div>
    </div>
  );
});

ProgressReportPage.displayName = "ProgressReportPage";

export default ProgressReportPage;
