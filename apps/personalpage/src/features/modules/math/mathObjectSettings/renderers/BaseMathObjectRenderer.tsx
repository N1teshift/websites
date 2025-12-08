import React, { ReactNode } from "react";
import InterfaceToggleSwitch from "../ui/InterfaceToggleSwitch";
import useInterfaceType from "../hooks/useInterfaceType";
import { MathObjectSettingsType, InterfaceType, MathObjectContainerProps } from "@math/types/index";

/**
 * Props for the `BaseMathObjectRenderer` component.
 * @template T - The specific type of MathObjectSettings being handled (e.g., CoefficientSettings).
 */
export interface BaseMathObjectRendererProps<
  T extends MathObjectSettingsType,
> extends MathObjectContainerProps<T> {
  /** The specific container component (e.g., CoefficientSettingsContainer) that renders the core settings UI. */
  settingsContainer: React.FC<MathObjectContainerProps<T>>;
  /** Optional render prop function to render nested children settings UI (e.g., terms within an expression). */
  childrenRenderer?: (props: MathObjectContainerProps<T>) => ReactNode;
  /** If true, wraps the settingsContainer in an InterfaceToggleSwitch. Defaults to false. */
  supportsInterfaceToggle?: boolean;
  /** Optional callback triggered when the interface type changes via the toggle switch. */
  onInterfaceChange?: (
    newInterface: InterfaceType,
    updateSettings: (newSettings: T) => void
  ) => void;
}

/**
 * A base wrapper component for rendering the settings UI for different math object types.
 * It handles the common structure, including an optional toggle for simple/complex interfaces
 * and rendering nested children settings.
 *
 * @template T - The specific type of MathObjectSettings being handled.
 * @param {BaseMathObjectRendererProps<T>} props - The component props.
 * @returns {React.ReactElement} A React fragment containing the rendered settings UI and optional children.
 * @remarks
 * - Uses the `settingsContainer` prop to render the main UI for the specific object type.
 * - If `supportsInterfaceToggle` is true, it wraps the `settingsContainer` with `InterfaceToggleSwitch`,
 *   allowing the user to change the view and triggering the `onInterfaceChange` callback if provided.
 * - Uses the `useInterfaceType` hook to manage the simple/complex state via context.
 * - If `childrenRenderer` is provided, it invokes it to render nested settings UI below the main settings.
 */
const BaseMathObjectRenderer = <T extends MathObjectSettingsType>({
  containerId,
  settings,
  updateSettings,
  startIndex = 1,
  showDescription = false,
  objectType = null,
  settingsContainer: SettingsContainer,
  childrenRenderer,
  supportsInterfaceToggle = false,
  onInterfaceChange,
}: BaseMathObjectRendererProps<T>) => {
  const { setInterfaceType } = useInterfaceType(containerId);

  const renderSettings = () =>
    supportsInterfaceToggle ? (
      <InterfaceToggleSwitch
        containerId={containerId}
        onChange={(newInterface) => {
          setInterfaceType(newInterface);
          if (onInterfaceChange) onInterfaceChange(newInterface, updateSettings);
        }}
      >
        <SettingsContainer
          containerId={containerId}
          settings={settings}
          updateSettings={updateSettings}
          startIndex={startIndex}
          showDescription={showDescription}
          objectType={objectType}
        />
      </InterfaceToggleSwitch>
    ) : (
      <SettingsContainer
        containerId={containerId}
        settings={settings}
        updateSettings={updateSettings}
        startIndex={startIndex}
        showDescription={showDescription}
        objectType={objectType}
      />
    );

  return (
    <>
      {renderSettings()}
      {childrenRenderer && (
        <div className="ml-5 mt-1">
          {childrenRenderer({
            containerId,
            settings,
            updateSettings,
            startIndex,
            showDescription,
            objectType,
          })}
        </div>
      )}
    </>
  );
};

export default BaseMathObjectRenderer;
