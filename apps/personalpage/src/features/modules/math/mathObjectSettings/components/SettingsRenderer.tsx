import React from "react";
import {
  MathObjectSettings,
  MathObjectSettingsType,
} from "../../types/mathObjectSettingsInterfaces";
import {
  CoefficientRenderer,
  CoefficientsRenderer,
  TermRenderer,
  TermsRenderer,
  FunctionRenderer,
  EquationRenderer,
  InequalityRenderer,
  SetRenderer,
  PointRenderer,
  IntervalRenderer,
  ExpressionRenderer,
} from "../renderers";

export interface SettingsRendererProps {
  /** The index of the settings object within a list. */
  index: number;
  /** The comprehensive settings object for the math object. */
  settings: MathObjectSettings;
  /** Callback function to update the comprehensive settings object. */
  updateSettings: (newSettings: MathObjectSettings) => void;
}

interface RendererProps {
  /** A unique ID for the container, typically based on index and object type. */
  containerId: string;
  /** The specific settings object for the component's object type (e.g., CoefficientSettings). */
  settings: MathObjectSettingsType;
  /** Callback to update the specific settings object. */
  updateSettings: (newSettings: MathObjectSettingsType) => void;
  /** Starting index for variable naming (passed down but might not be used by all renderers). */
  startIndex: number;
  /** Flag indicating whether to show a description (passed down but might not be used by all renderers). */
  showDescription: boolean;
  /** The type of the math object being rendered. */
  objectType: string;
}

/**
 * Maps object types to their corresponding renderer component and the key
 * used to access their specific settings within the comprehensive `MathObjectSettings` object.
 * @internal
 */
interface RendererMapping {
  /** The React component responsible for rendering the settings UI for this object type. */
  Component: React.ComponentType<RendererProps>;
  /** The key within `MathObjectSettings` that holds the specific settings for this object type. */
  settingsKey: keyof MathObjectSettings;
}

// Mapping objectType to its renderer component and settings key
const rendererMap: Record<string, RendererMapping> = {
  coefficient: {
    Component: CoefficientRenderer as React.ComponentType<RendererProps>,
    settingsKey: "coefficientSettings",
  },
  coefficients: {
    Component: CoefficientsRenderer as React.ComponentType<RendererProps>,
    settingsKey: "coefficientsSettings",
  },
  term: {
    Component: TermRenderer as React.ComponentType<RendererProps>,
    settingsKey: "termSettings",
  },
  terms: {
    Component: TermsRenderer as React.ComponentType<RendererProps>,
    settingsKey: "termsSettings",
  },
  expression: {
    Component: ExpressionRenderer as React.ComponentType<RendererProps>,
    settingsKey: "expressionSettings",
  },
  equation: {
    Component: EquationRenderer as React.ComponentType<RendererProps>,
    settingsKey: "equationSettings",
  },
  inequality: {
    Component: InequalityRenderer as React.ComponentType<RendererProps>,
    settingsKey: "inequalitySettings",
  },
  function: {
    Component: FunctionRenderer as React.ComponentType<RendererProps>,
    settingsKey: "functionSettings",
  },
  point: {
    Component: PointRenderer as React.ComponentType<RendererProps>,
    settingsKey: "pointSettings",
  },
  set: { Component: SetRenderer as React.ComponentType<RendererProps>, settingsKey: "setSettings" },
  interval: {
    Component: IntervalRenderer as React.ComponentType<RendererProps>,
    settingsKey: "intervalSettings",
  },
};

/**
 * A dynamic renderer component that selects and renders the appropriate settings UI
 * based on the `objectType` specified in the `settings` prop.
 *
 * @param {SettingsRendererProps} props - The component props.
 * @returns {React.ReactElement} A div containing the rendered settings form for the specific object type,
 *                               or a message indicating an unsupported type.
 * @remarks
 * Uses a `rendererMap` to find the correct React component (`CoefficientRenderer`, `TermRenderer`, etc.)
 * from the `../renderers` directory and the corresponding settings key within the main `settings` object.
 * It passes the relevant slice of the settings and a tailored update function to the specific renderer.
 */
export const SettingsRenderer: React.FC<SettingsRendererProps> = ({
  index,
  settings,
  updateSettings,
}) => {
  const mainName = `${index}-${settings.objectType}`;

  const renderSettingsByType = () => {
    const mapping = rendererMap[settings.objectType as keyof typeof rendererMap];
    if (!mapping) {
      return <div>{"unsupported_object_type"}</div>;
    }
    const { Component, settingsKey } = mapping;
    // Type assertion is safe here because settingsKey is guaranteed to be a key of MathObjectSettings
    const currentSettings = settings[settingsKey] as MathObjectSettingsType;
    return (
      <Component
        containerId={mainName}
        settings={currentSettings}
        updateSettings={(newSettings: MathObjectSettingsType) =>
          updateSettings({ ...settings, [settingsKey]: newSettings })
        }
        startIndex={1}
        showDescription={false}
        objectType={settings.objectType}
      />
    );
  };

  return <div className="ml-5 mt-1">{renderSettingsByType()}</div>;
};

export default SettingsRenderer;
