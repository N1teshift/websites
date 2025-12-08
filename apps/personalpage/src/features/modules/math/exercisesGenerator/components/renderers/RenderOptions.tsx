import React, { useState, useEffect } from "react";
import { parseAndRenderMath } from "@math/shared/components";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";

interface RenderOptionsProps {
  options: string[];
  onOptionsChange: (updatedOptions: string[]) => void;
  optionsInputs: { example: string }[];
}

export const RenderOptions: React.FC<RenderOptionsProps> = ({
  options,
  onOptionsChange,
  optionsInputs,
}) => {
  const { t } = useFallbackTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    // Initialize editedText when options prop changes.
    setEditedText(options.join("\n"));
  }, [options]);

  /**
   * Substitutes {inputN} placeholders in a string with corresponding example values.
   * @param {string} text - The text containing placeholders.
   * @returns {string} The text with placeholders substituted.
   */
  const substituteInputs = (text: string) => {
    return text.replace(/\{input(\d+)\}/g, (match, inputIndex) => {
      const input = optionsInputs[parseInt(inputIndex) - 1];
      // Fallback to the original match if input or example is missing.
      return input?.example || match;
    });
  };

  /**
   * Handles the submission of edited options.
   * Splits the textarea content into an array, trims lines, calls onOptionsChange,
   * and exits editing mode.
   */
  const handleEditSubmit = () => {
    const updatedOptions = editedText.split("\n").map((line) => line.trim());
    onOptionsChange(updatedOptions);
    setIsEditing(false);
  };

  return (
    <div className="p-2 bg-gray-200 rounded-md border border-gray-200">
      <h4 className="font-bold">{t("answer_options")}</h4>
      {isEditing ? (
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          onBlur={handleEditSubmit}
          autoFocus
          className="w-full h-[150px] p-2.5 font-mono text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="p-2.5 bg-gray-50 border border-gray-200 rounded-md text-lg font-serif cursor-pointer"
        >
          {options.map((option, index) => (
            <div key={index} className="mb-1.5">
              <strong>{String.fromCharCode(65 + index)}.</strong>{" "}
              {parseAndRenderMath(substituteInputs(option || "Empty Option"))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
