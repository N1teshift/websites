import React from "react";
import InfoTooltip from "./InfoTooltip";

interface LabelWithInfoProps {
  label: string;
  info: string;
  required?: boolean;
  className?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
}

const LabelWithInfo: React.FC<LabelWithInfoProps> = ({
  label,
  info,
  required = false,
  className = "block text-sm font-medium text-text-primary mb-2",
  tooltipPosition = "top",
}) => {
  return (
    <label className={className}>
      <span className="inline-flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
        <InfoTooltip content={info} position={tooltipPosition} size="sm" />
      </span>
    </label>
  );
};

export default LabelWithInfo;
