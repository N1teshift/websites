import React, { useState, useEffect } from "react";
import { UnitPlanData } from "../../types/UnitPlanTypes";
import { getFieldCompletionStatus } from "../../utils/progressTracker";
import { isFeatureEnabled } from "@/config/features";

interface FieldCompletionIndicatorProps {
  fieldName: keyof UnitPlanData | string;
  value: UnitPlanData[keyof UnitPlanData] | string;
}

const FieldCompletionIndicator: React.FC<FieldCompletionIndicatorProps> = ({
  fieldName,
  value,
}) => {
  const [status, setStatus] = useState(() => getFieldCompletionStatus(fieldName, value));
  const [isVisible, setIsVisible] = useState(false);

  // Update status when value changes
  useEffect(() => {
    const newStatus = getFieldCompletionStatus(fieldName, value);
    setStatus((prevStatus) => {
      // Only update if the status has actually changed
      if (
        prevStatus.completed !== newStatus.completed ||
        prevStatus.message !== newStatus.message ||
        prevStatus.color !== newStatus.color
      ) {
        return newStatus;
      }
      return prevStatus;
    });
  }, [fieldName, value]);

  // Show indicator when user starts typing
  useEffect(() => {
    const hasContent = Boolean(value && String(value).trim().length > 0);
    setIsVisible(hasContent);
  }, [value]);

  // Hide this component entirely if the feature flag is disabled
  if (!isFeatureEnabled("fieldCompletion")) return null;

  // Don't show if no content and not visible
  if (!isVisible && (!value || String(value).trim().length === 0)) {
    return null;
  }

  return (
    <div className="mt-1">
      <div className="flex items-center space-x-2">
        {/* Status indicator */}
        <div
          className={`w-2 h-2 rounded-full ${status.completed ? "bg-green-500" : "bg-red-500"}`}
        ></div>

        {/* Status message */}
        <span className={`text-xs font-medium ${status.color}`}>{status.message}</span>
      </div>
    </div>
  );
};

export default FieldCompletionIndicator;
