import React, { useContext } from "react";
import SettingsRenderer from "./SettingsRenderer";
import ObjectRow from "./ObjectRow";
import InterfaceContext from "./InterfaceContext";
import { CollapsibleSection } from "@websites/ui";
import { MathObjectSettings } from "../../types/mathObjectSettingsInterfaces";

export interface MathObjectSettingsContainerProps {
    /** The index of this settings object within a list. */
    index: number;
    /** The current settings object for the math object. */
    mathObjectSettings: MathObjectSettings;
    /** Callback function to update the settings object. */
    setMathObjectSettings: (settings: MathObjectSettings) => void;
    /** Callback function to handle the deletion of this settings object. */
    onDelete: () => void;
    /** Optional flag to show additional properties in the `ObjectRow`. Defaults to false. */
    showProps?: boolean;
}

/**
 * A container component that displays and manages the settings for a single math object.
 * It includes a header row (`ObjectRow`) with an integrated delete button and a collapsible section 
 * containing the detailed settings form (`SettingsRenderer`).
 *
 * @param {MathObjectSettingsContainerProps} props - The component props.
 * @returns {React.ReactElement} A div element containing the settings UI for one math object.
 * @remarks
 * Retrieves the interface type ("simple" or "complex") from the `InterfaceContext`
 * to pass down to the `ObjectRow`.
 */
const MathObjectSettingsContainer: React.FC<MathObjectSettingsContainerProps> = ({
    index,
    mathObjectSettings,
    setMathObjectSettings,
    onDelete,
    showProps = false,
}) => {
    const mainName = `${index}-${mathObjectSettings.objectType}`;

    const { interfaceMap } = useContext(InterfaceContext);

    return (
            <div className="w-full flex flex-col">
                <ObjectRow
                    mathObjectSettings={mathObjectSettings}
                    setMathObjectSettings={setMathObjectSettings}
                    showProps={showProps}
                    interfaceType={interfaceMap[mainName] || "simple"}
                    onDelete={onDelete}
                />
                <CollapsibleSection>
                    <SettingsRenderer
                        index={index}
                        settings={mathObjectSettings}
                        updateSettings={setMathObjectSettings}
                    />
                </CollapsibleSection>
            </div>
    );
};

export default MathObjectSettingsContainer;



