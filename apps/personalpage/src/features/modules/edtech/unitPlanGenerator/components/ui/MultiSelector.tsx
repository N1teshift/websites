import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import LabelWithInfo from "../shared/LabelWithInfo";
import { Tooltip } from "react-tooltip";
import FieldCompletionIndicator from "./FieldCompletionIndicator";
import { isFeatureEnabled } from "@/config/features";
import { UnitPlanData } from "../../types/UnitPlanTypes";
import {
  getObjectiveStrands,
  isObjectiveId,
  isStrandId,
  getStrandByFullId,
  getObjectiveById,
} from "../../data/objectives";

interface Option {
  id: string;
  name: string;
  description?: string;
}

interface MultiSelectorProps {
  label: string;
  selectedItems: string[];
  onItemsChange: (items: string[]) => void;
  options?: Option[];
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  emptyStateMessage?: string;
  info?: string;
  fieldName?: keyof UnitPlanData;
  showDetailedTooltips?: boolean;

  // New props for dynamic data loading
  dataFetcher?: (subject: string, t: (key: string) => string) => Option[];
  subject?: string;
}

const MultiSelector: React.FC<MultiSelectorProps> = ({
  label,
  selectedItems,
  onItemsChange,
  options: staticOptions,
  placeholder,
  required = false,
  helpText,
  emptyStateMessage,
  info,
  fieldName,
  showDetailedTooltips = false,
  dataFetcher,
  subject,
}) => {
  const { t } = useFallbackTranslation();

  // Resolve defaults after translation function is available
  const resolvedPlaceholder = placeholder || t("available_options") || "No options available";
  const resolvedEmptyStateMessage =
    emptyStateMessage ||
    t("no_items_selected") ||
    "No items selected yet. Choose from the options above.";

  // Use dataFetcher if provided, otherwise use static options
  const options = dataFetcher && subject ? dataFetcher(subject, t) : staticOptions || [];

  const toggleItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      onItemsChange(selectedItems.filter((item) => item !== itemId));
    } else {
      onItemsChange([...selectedItems, itemId]);
    }
  };

  const removeItem = (itemId: string) => {
    onItemsChange(selectedItems.filter((item) => item !== itemId));
  };

  const getTooltipContent = (option: Option): string => {
    if (!showDetailedTooltips || fieldName !== "objectives") {
      return option.description || "";
    }

    // For objectives field, show detailed information
    if (isObjectiveId(option.id)) {
      // Handle main objectives (A, B, C, D) using localized strings when available
      const localizedObjective =
        t(`objective.${option.id}`) || `${option.id} - ${option.name || ""}`;
      const strands = getObjectiveStrands(option.id);

      if (strands.length > 0) {
        const strandsText = strands
          .map((strand) => {
            const localizedStrand = t(`strand.${strand.fullId}`) || strand.description;
            return `${strand.id}. ${localizedStrand}`;
          })
          .join("\n");

        return `${localizedObjective}\n\nStrands:\n${strandsText}`;
      }
    } else if (isStrandId(option.id)) {
      // Handle individual strands (A-i, B-ii, etc.) using localized strings when available
      const localizedStrand = t(`strand.${option.id}`);
      const strandObj = getStrandByFullId(option.id);
      const strandDescription =
        localizedStrand || (strandObj ? strandObj.description : option.description || "");
      const parentObjective = strandObj ? getObjectiveById(strandObj.objectiveId) : undefined;
      const localizedObjectiveName = parentObjective
        ? t(`objective.${parentObjective.id}`) || parentObjective.name
        : "";

      const focusLabel = t("strand_focus") || "This strand focuses on";
      return `${localizedObjectiveName}\n\n${strandDescription}\n\n${focusLabel}: ${strandDescription.toLowerCase()}`;
    }

    return option.description || "";
  };

  if (options.length === 0) {
    return (
      <div>
        {info ? (
          <LabelWithInfo label={label} info={info} required={required} />
        ) : (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="text-text-muted text-sm italic p-4 border-2 border-dashed border-border-default rounded-lg text-center">
          {resolvedPlaceholder}
        </div>
      </div>
    );
  }

  return (
    <div>
      {label &&
        (info ? (
          <LabelWithInfo label={label} info={info} required={required} />
        ) : (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        ))}

      {helpText && <p className="text-xs text-text-muted mb-2">{helpText}</p>}

      {/* Available Options */}
      <div className="mb-3">
        <h4 className="text-xs font-medium text-text-muted mb-1">{t("available_options")}</h4>
        <div className="flex flex-wrap gap-1">
          {options.map((option) => {
            const tooltipId = `tooltip-${option.id}`;
            const tooltipContent = getTooltipContent(option);
            const hasTooltip = tooltipContent.length > 0;

            // Determine styling based on whether it's an objective or strand
            const isObjective = isObjectiveId(option.id);
            const isStrand = isStrandId(option.id);

            const getOptionStyle = () => {
              if (selectedItems.includes(option.id)) {
                if (isObjective) {
                  return "bg-blue-50 border-blue-300 text-blue-800";
                } else if (isStrand) {
                  return "bg-green-50 border-green-300 text-green-800";
                }
                return "bg-blue-50 border-blue-300 text-blue-800";
              } else {
                if (isObjective) {
                  return "bg-surface-button border-border-default hover:bg-surface-button-hover text-text-primary";
                } else if (isStrand) {
                  return "bg-gray-50 border-gray-200 hover:bg-gray-100 text-text-secondary";
                }
                return "bg-surface-button border-border-default hover:bg-surface-button-hover text-text-primary";
              }
            };

            return (
              <label
                key={option.id}
                className={`inline-flex items-center px-2 py-1 rounded cursor-pointer border transition-colors text-xs whitespace-nowrap ${getOptionStyle()}`}
                data-tooltip-id={hasTooltip ? tooltipId : undefined}
                data-tooltip-content={tooltipContent}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(option.id)}
                  onChange={() => toggleItem(option.id)}
                  className="w-3 h-3 text-brand border-border-default rounded focus:ring-brand"
                />
                <span className="ml-1 text-xs leading-tight">{option.name}</span>

                {hasTooltip && (
                  <Tooltip
                    id={tooltipId}
                    place="top"
                    className="max-w-md"
                    style={{
                      backgroundColor: "#1f2937",
                      color: "white",
                      fontSize: "0.75rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.375rem",
                      boxShadow:
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      zIndex: 50,
                      whiteSpace: "pre-line",
                      wordBreak: "break-word",
                      lineHeight: "1.5",
                      maxWidth: "400px",
                    }}
                    delayShow={200}
                    delayHide={100}
                  />
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* Selected Items Display */}
      {selectedItems.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-text-secondary mb-1">
            {t("selected")} ({selectedItems.length}):
          </h4>
          <div className="flex flex-wrap gap-1">
            {selectedItems.map((itemId) => {
              const option = options.find((opt) => opt.id === itemId);
              const isObjective = isObjectiveId(itemId);
              const isStrand = isStrandId(itemId);

              const getTagStyle = () => {
                if (isObjective) {
                  return "bg-blue-100 text-blue-800 border-blue-200";
                } else if (isStrand) {
                  return "bg-green-100 text-green-800 border-green-200";
                }
                return "bg-blue-100 text-blue-800 border-blue-200";
              };

              return (
                <span
                  key={itemId}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${getTagStyle()}`}
                >
                  {option?.name || itemId}
                  <button
                    onClick={() => removeItem(itemId)}
                    className="ml-1 w-3 h-3 hover:opacity-70 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {selectedItems.length === 0 && (
        <div className="text-text-muted text-xs italic p-2 border border-dashed border-border-default rounded text-center">
          {resolvedEmptyStateMessage}
        </div>
      )}

      {/* Field completion indicator */}
      {fieldName && isFeatureEnabled("fieldCompletion") && (
        <FieldCompletionIndicator fieldName={fieldName} value={selectedItems} />
      )}
    </div>
  );
};

export default MultiSelector;
