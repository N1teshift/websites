import React from "react";
import BaseMathObjectRenderer from "./BaseMathObjectRenderer";
import TermsSettingsContainer from "../containers/TermsSettingsContainer";
import { TermsSettings, TermSettings, MathObjectContainerProps } from "@math/types/index";
import TermRenderer from "./TermRenderer";
import { generateTermsDescription } from "../../shared/descriptionGenerators";

/**
 * Renders the settings UI for `Terms` (a collection/combination of individual terms).
 *
 * @param {MathObjectContainerProps<TermsSettings>} props - The component props.
 * @returns {React.ReactElement} The rendered UI for terms settings.
 * @remarks
 * - Uses `BaseMathObjectRenderer` for the overall structure.
 * - Specifies `TermsSettingsContainer` for the top-level settings (e.g., combination type, overall power).
 * - Does not support the simple/complex interface toggle at the Terms level.
 * - Uses `childrenRenderer` to iterate through the `settings.terms` array and render a `TermRenderer`
 *   for each individual `TermSettings` object, allowing configuration of each term in the collection.
 * - Uses `generateTermsDescription` primarily to calculate the correct `startIndex` for variable naming within each child `TermRenderer`.
 */
const TermsRenderer: React.FC<MathObjectContainerProps<TermsSettings>> = ({
  containerId,
  settings,
  updateSettings,
  startIndex = 1,
  showDescription = false,
  objectType = null,
}) => {
  const renderChildren = () => {
    const termsDescResult = generateTermsDescription(settings, startIndex);
    return termsDescResult.terms.map((termInfo, index) => (
      <div key={index} className="mt-1">
        <TermRenderer
          containerId={`${containerId}-term-${index}`}
          settings={settings.terms[index]}
          updateSettings={(newTermSettings: TermSettings) =>
            updateSettings({
              ...settings,
              terms: settings.terms.map((term, ci) => (ci === index ? newTermSettings : term)),
            })
          }
          startIndex={termInfo.startIndex}
          showDescription={true}
          objectType="term"
        />
      </div>
    ));
  };

  return (
    <BaseMathObjectRenderer
      containerId={containerId}
      settings={settings}
      updateSettings={updateSettings}
      startIndex={startIndex}
      showDescription={showDescription}
      objectType={objectType}
      settingsContainer={TermsSettingsContainer}
      supportsInterfaceToggle={false}
      childrenRenderer={() => renderChildren()}
    />
  );
};

export default TermsRenderer;
