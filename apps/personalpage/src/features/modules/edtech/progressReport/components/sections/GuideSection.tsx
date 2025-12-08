import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import { ProgressReportActiveSection } from "../../types/ProgressReportTypes";

interface GuideSectionProps {
  onSectionChange: (section: ProgressReportActiveSection) => void;
}

const GuideSection: React.FC<GuideSectionProps> = ({ onSectionChange }) => {
  const { t } = useFallbackTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("guide_title")}</h2>
        <p className="text-lg text-gray-600 mb-6">{t("guide_intro")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("guide_step_1")}</h3>
              <p className="text-gray-600 mb-4">{t("guide_step_1_desc")}</p>
              <button
                onClick={() => onSectionChange("data-management")}
                className="text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Go to Data Management →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("guide_step_2")}</h3>
              <p className="text-gray-600 mb-4">{t("guide_step_2_desc")}</p>
              <button
                onClick={() => onSectionChange("class-view")}
                className="text-green-600 hover:text-green-800 font-medium underline"
              >
                Go to Class View →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("guide_step_3")}</h3>
              <p className="text-gray-600 mb-4">{t("guide_step_3_desc")}</p>
              <button
                onClick={() => onSectionChange("student-view")}
                className="text-purple-600 hover:text-purple-800 font-medium underline"
              >
                Go to Student View →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                4
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Track Learning Objectives
              </h3>
              <p className="text-gray-600 mb-4">
                Monitor student progress on Cambridge Learning Objectives. Mark objectives as
                completed and track mastery across your curriculum.
              </p>
              <button
                onClick={() => onSectionChange("objectives")}
                className="text-amber-600 hover:text-amber-800 font-medium underline"
              >
                Go to Objectives →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                5
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Final Grades</h3>
              <p className="text-gray-600 mb-4">
                Calculate student grades automatically based on assessment data, MYP levels, and
                performance metrics. Export results for reporting.
              </p>
              <button
                onClick={() => onSectionChange("grade-generator")}
                className="text-indigo-600 hover:text-indigo-800 font-medium underline"
              >
                Go to Grade Generator →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                6
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Student Comments</h3>
              <p className="text-gray-600 mb-4">
                Generate personalized student report comments based on assessment data. Choose from
                templates for Math or English assessments.
              </p>
              <button
                onClick={() => onSectionChange("comments-generator")}
                className="text-rose-600 hover:text-rose-800 font-medium underline"
              >
                Go to Comments Generator →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Data Overview</h3>
        <p className="text-gray-600">
          The Progress Report Dashboard displays comprehensive student data including:
        </p>
        <ul className="list-disc list-inside mt-3 space-y-1 text-gray-600">
          <li>Student profiles with learning attributes</li>
          <li>Assessment records with scores and comments</li>
          <li>Material completion tracking by unit</li>
          <li>Attendance records by month</li>
          <li>Cambridge test history and results</li>
          <li>Consultation logs and future plans</li>
        </ul>
      </div>
    </div>
  );
};

export default GuideSection;
