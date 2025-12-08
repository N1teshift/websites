import React from "react";
import { UnitPlanData } from "../../types/UnitPlanTypes";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface SettingsSectionProps {
  unitPlan: UnitPlanData;
  updateUnitPlan: (field: keyof UnitPlanData, value: string) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ unitPlan, updateUnitPlan }) => {
  const { t } = useFallbackTranslation();

  return (
    <div className="space-y-8 p-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 pb-4 border-b-2 border-border-default mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-medium">
            <span className="text-white text-xl font-bold">⚙️</span>
          </div>
          <h2 className="text-3xl font-bold text-text-primary">{t("settings")}</h2>
        </div>
        <p className="text-text-secondary text-base bg-surface-button border-l-4 border-brand p-4 rounded-r-xl">
          Configure how the Unit Plan Generator exports and displays content.
        </p>
      </div>

      {/* Output Mapping */}
      <div className="bg-surface-card border-2 border-border-default rounded-2xl p-6 shadow-soft hover:shadow-medium transition-shadow">
        <h3 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-600">
            📋
          </span>
          {t("output_mapping")}
        </h3>
        <p className="text-sm text-text-secondary mb-5">
          Control how content is organized in exported documents (HTML, Excel, Word). This affects
          the structure of your final output.
        </p>

        <div className="space-y-3">
          <label className="flex items-start p-5 border-2 border-border-default rounded-xl cursor-pointer transition-all hover:bg-surface-button-hover hover:border-brand hover:shadow-soft">
            <input
              type="radio"
              name="outputMapping"
              value="current"
              checked={unitPlan.outputMapping === "current"}
              onChange={(e) => updateUnitPlan("outputMapping", e.target.value)}
              className="mt-1 mr-3 w-4 h-4 text-brand"
            />
            <div className="flex-1">
              <div className="font-medium text-text-primary">Current</div>
              <div className="text-sm text-text-secondary">
                Current MYP Unit Plan template format.
              </div>
            </div>
          </label>

          <label className="flex items-start p-4 border-2 border-border-default rounded-lg cursor-pointer transition-all hover:bg-surface-button-hover hover:border-brand hover:shadow-soft">
            <input
              type="radio"
              name="outputMapping"
              value="enhanced"
              checked={unitPlan.outputMapping === "enhanced"}
              onChange={(e) => updateUnitPlan("outputMapping", e.target.value)}
              className="mt-1 mr-3 w-4 h-4 text-brand"
            />
            <div className="flex-1">
              <div className="font-medium text-text-primary">Enhanced</div>
              <div className="text-sm text-text-secondary">
                Enhanced format with additional sections and improved organization.
              </div>
            </div>
          </label>

          <label className="flex items-start p-4 border-2 border-border-default rounded-lg cursor-pointer transition-all hover:bg-surface-button-hover hover:border-brand hover:shadow-soft">
            <input
              type="radio"
              name="outputMapping"
              value="custom"
              checked={unitPlan.outputMapping === "custom"}
              onChange={(e) => updateUnitPlan("outputMapping", e.target.value)}
              className="mt-1 mr-3 w-4 h-4 text-brand"
            />
            <div className="flex-1">
              <div className="font-medium text-text-primary">Custom</div>
              <div className="text-sm text-text-secondary">
                Fully customizable output with all available sections and options. Maximum
                flexibility.
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-surface-card border-2 border-border-default rounded-xl p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-text-primary mb-2">About Output Mapping</h3>
            <div className="text-sm text-text-secondary">
              <p>
                <strong>Output Mapping</strong> determines how your unit plan is structured in
                exported files (HTML, PDF, Excel). Choose the format that best matches your
                documentation needs. You can change the viewing mode using the toggle button in the
                navigation bar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
