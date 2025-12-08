import React, { useMemo } from "react";
import { Tooltip } from "react-tooltip";

interface InfoTooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  size?: "sm" | "md" | "lg";
  id?: string; // Optional custom ID for deterministic behavior
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  position = "top",
  size = "md",
  id,
}) => {
  const sizeClasses = {
    sm: "w-3 h-3 text-xs",
    md: "w-4 h-4 text-sm",
    lg: "w-5 h-5 text-base",
  };

  // Use a deterministic ID based on content hash or provided ID
  const tooltipId = useMemo(() => {
    if (id) return `tooltip-${id}`;

    // Create a simple hash from content for deterministic ID
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `tooltip-${Math.abs(hash).toString(36)}`;
  }, [content, id]);

  // Format the content to render HTML properly
  const formatContent = (text: string) => {
    return text
      .replace(/•/g, "<br>•") // Add line break before bullet points
      .replace(/\n/g, "<br>") // Convert newlines to HTML breaks
      .replace(/\s{2,}/g, " ") // Normalize multiple spaces
      .trim();
  };

  return (
    <>
      <div
        className={`${sizeClasses[size]} rounded-full bg-brand-light border border-brand text-brand flex items-center justify-center cursor-help hover:bg-brand-hover transition-colors`}
        data-tooltip-id={tooltipId}
        data-tooltip-html={formatContent(content)}
      >
        <span className="font-medium">i</span>
      </div>

      <Tooltip
        id={tooltipId}
        place={position}
        className="max-w-sm sm:max-w-md lg:max-w-lg !bg-surface-card !text-text-primary !border !border-border-default !shadow-large"
        style={{
          fontSize: size === "sm" ? "0.75rem" : size === "lg" ? "1rem" : "0.875rem",
          padding: "0.75rem 1rem",
          borderRadius: "0.5rem",
          zIndex: 50,
          whiteSpace: "normal",
          wordBreak: "break-word",
          lineHeight: "1.6",
        }}
        delayShow={200}
        delayHide={100}
      />
    </>
  );
};

export default InfoTooltip;
