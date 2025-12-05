import React from "react";
import BaseMathObjectRenderer from "./BaseMathObjectRenderer";
import ExpressionRenderer from "./ExpressionRenderer";
import InequalitySettingsContainer from "../containers/InequalitySettingsContainer";
import {
    MathObjectContainerProps,
    InequalitySettings, ExpressionSettings, TermSettings, TermsSettings,
    DEFAULT_SIMPLE_INEQUALITY_SETTINGS, DEFAULT_COMPLEX_INEQUALITY_SETTINGS
} from "@math/types/index";
import useInterfaceType from "../hooks/useInterfaceType";

/**
 * Renders the settings UI for an `Inequality`.
 * Inequalities consist of two sides (LHS and RHS), each represented by an `Expression`,
 * and an inequality type (e.g., <, <=, >, >=).
 *
 * @param {MathObjectContainerProps<InequalitySettings>} props - The component props.
 * @returns {React.ReactElement} The rendered UI for inequality settings.
 * @remarks
 * - Uses `BaseMathObjectRenderer` for the overall structure.
 * - Specifies `InequalitySettingsContainer` for top-level inequality settings (the inequality type).
 * - Enables the simple/complex interface toggle.
 * - When the interface type changes:
 *   - To "simple": Resets settings to `DEFAULT_SIMPLE_INEQUALITY_SETTINGS`.
 *   - To "complex": Resets settings to `DEFAULT_COMPLEX_INEQUALITY_SETTINGS`.
 * - Uses `childrenRenderer` to display `ExpressionRenderer` components for the sides, similar to `EquationRenderer`:
 *   - **Simple Mode:** Renders a single `ExpressionRenderer` for the combined `ExpressionSettings`.
 *   - **Complex Mode:** Renders two separate `ExpressionRenderer` components for LHS and RHS.
 */
const InequalityRenderer: React.FC<MathObjectContainerProps<InequalitySettings>> = ({
    containerId,
    settings,
    updateSettings,
    startIndex = 1,
    showDescription = false,
    objectType = null,
}) => {
    const { interfaceType } = useInterfaceType(containerId);

    const renderChildren = () => {
        let currentStartIndex = startIndex;

        if (interfaceType === "simple") {
            const exprSettings = settings.terms[0];
            const commonProps = {
                containerId: `${containerId}-expression`,
                settings: exprSettings as ExpressionSettings,
                updateSettings: (newExprSettings: ExpressionSettings) =>
                    updateSettings({
                        ...settings,
                        terms: [newExprSettings] as [ExpressionSettings],
                    }),
                startIndex: currentStartIndex,
                showDescription: false,
                objectType: objectType, // Pass root "inequality" type
            };

            return (
                    <ExpressionRenderer {...commonProps} />
            );
        } else {
            const terms = settings.terms as [ExpressionSettings, ExpressionSettings];
            return terms.map((side, sideIndex) => {
                const subContainerId = `${containerId}-side-${sideIndex}`;
                const commonProps = {
                    containerId: subContainerId,
                    settings: side as ExpressionSettings,
                    updateSettings: (newSideSettings: ExpressionSettings) =>
                        updateSettings({
                            ...settings,
                            terms: terms.map((s, i) => (i === sideIndex ? newSideSettings : s)) as [ExpressionSettings, ExpressionSettings],
                        }),
                    startIndex: currentStartIndex,
                    showDescription: true,
                    objectType: objectType, // Pass root "inequality" type
                };

                const coefficientCount = side.expressions.reduce((sum, expr) =>
                    sum + ("coefficients" in expr && "termIds" in expr
                        ? (expr as TermSettings).coefficients.collectionCount
                        : (expr as TermsSettings).terms.reduce((s, t) => s + t.coefficients.collectionCount, 0)), 0);
                currentStartIndex += coefficientCount;

                return (
                    <div key={sideIndex} className="mt-1">
                        <ExpressionRenderer {...commonProps} />
                        {sideIndex === 0}
                    </div>
                );
            });
        }
    };

    return (
        <BaseMathObjectRenderer
            containerId={containerId}
            settings={settings}
            updateSettings={updateSettings}
            startIndex={startIndex}
            showDescription={showDescription}
            objectType={objectType}
            settingsContainer={InequalitySettingsContainer}
            supportsInterfaceToggle={true}
            onInterfaceChange={(newInterface) => {
                const newSettings: InequalitySettings = newInterface === "simple"
                    ? DEFAULT_SIMPLE_INEQUALITY_SETTINGS
                    : DEFAULT_COMPLEX_INEQUALITY_SETTINGS;
                updateSettings(newSettings);
            }}
            childrenRenderer={() => renderChildren()}
        />
    );
};

export default InequalityRenderer;



