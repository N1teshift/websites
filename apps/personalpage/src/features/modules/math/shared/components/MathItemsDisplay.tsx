import React from "react";
import { parseAndRenderMath } from "./MathParser";

export interface MathItemsDisplayProps {
  mathItems: unknown[];
  fallbackMessage?: string;
}

/**
 * Component to display math items
 * This is a local component for personalpage
 */
const MathItemsDisplay: React.FC<MathItemsDisplayProps> = ({
  mathItems,
  fallbackMessage = "No math items available",
}) => {
  if (!mathItems || mathItems.length === 0) {
    return <span className="text-gray-400">{fallbackMessage}</span>;
  }

  return (
    <div className="math-items-display">
      {mathItems.map((item, index) => {
        const content = typeof item === "string" ? item : JSON.stringify(item);
        return (
          <div key={index} className="math-item">
            {parseAndRenderMath(content)}
          </div>
        );
      })}
    </div>
  );
};

export default MathItemsDisplay;
