import React, { ReactNode } from "react";
import MathObjectDescription from "../components/MathObjectDescription";
import { MathObjectContainerProps, MathObjectSettingsType } from "../../types/index";
import useInterfaceType from "../hooks/useInterfaceType";

/**
 * BaseMathObjectSettingsContainer serves as a foundational wrapper component for all math object setting containers.
 * 
 * This component provides a consistent structure for rendering math object settings with conditional description display.
 * It uses the render props pattern through the children prop to allow specialized containers to inject their content
 * while maintaining standard layout and behavior.
 * 
 * @template T - Type parameter extending MathObjectSettingsType, representing the specific math object settings type
 * 
 * @param {Object} props - Component props
 * @param {string} props.containerId - Unique identifier for the container, used for interface type tracking
 * @param {T} props.settings - The current settings object for the math object
 * @param {Function} props.updateSettings - Callback function to update the settings
 * @param {number} props.startIndex - Starting index for mathematical notation (defaults to 1)
 * @param {boolean} props.showDescription - Whether to show the mathematical description of the object
 * @param {ObjectType | null} props.objectType - The type of mathematical object being configured
 * @param {Function} props.children - Render prop function that receives all container props and returns ReactNode
 * 
 * @returns {JSX.Element} A container with children content and optional mathematical description
 */
const BaseMathObjectSettingsContainer = <T extends MathObjectSettingsType>({
    containerId,
    settings,
    updateSettings,
    startIndex = 1,
    showDescription = false,
    objectType,
    children,
}: MathObjectContainerProps<T> & {
    children: (props: MathObjectContainerProps<T>) => ReactNode;
}) => {
    // Retrieve the current interface type (simple or complex) for this container
    const { interfaceType } = useInterfaceType(containerId);
    return (
        <div className="settings-container">
            {/* Render the specialized content using the children render prop */}
            {children({
                containerId,
                settings,
                updateSettings,
                startIndex,
                showDescription,
                objectType,
            })}
            {/* Conditionally render the mathematical description if requested and objectType is provided */}
            {showDescription && objectType && (
                <MathObjectDescription
                    objectType={objectType}
                    interfaceType={interfaceType}
                    startIndex={startIndex}
                    settings={settings}
                />
            )}
        </div>
    );
};

export default BaseMathObjectSettingsContainer;



