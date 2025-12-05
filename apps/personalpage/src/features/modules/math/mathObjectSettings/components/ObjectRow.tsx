import React from "react";
import {
    ObjectType, objectTypeOptions, DependencyType, dependencyTypeOptions,
    InterfaceType, CoefficientSettings, MathObjectSettings
} from "@math/types/index";
import { Dropdown, TextArea, NumberInput, IconButton } from "@websites/ui";
import { FiTrash2 } from "react-icons/fi";
import MathObjectDescription from "./MathObjectDescription";


export interface ObjectRowProps {
    /** The settings object for the current math object. */
    mathObjectSettings: MathObjectSettings;
    /** Callback to update the math object settings. */
    setMathObjectSettings: (settings: MathObjectSettings) => void;
    /** If true, displays additional properties like example, dependency, and priority. Defaults to false. */
    showProps?: boolean;
    /** The current interface type ("simple" or "complex") for the object, used by `MathObjectDescription`. */
    interfaceType: InterfaceType;
    /** Callback function to handle the deletion of this settings object. */
    onDelete: () => void;
}

/**
 * A React component that renders a single row representing a math object's primary settings.
 * It includes controls for `objectType` and, if `showProps` is true, for `example`,
 * `dependency`, and `priority`. It also displays a live LaTeX description of the object
 * using the `MathObjectDescription` component and a red trash icon on the right side.
 *
 * @param {ObjectRowProps} props - The component props.
 * @returns {React.ReactElement} A div representing the row for a math object's settings.
 */
const ObjectRow: React.FC<ObjectRowProps> = ({
    mathObjectSettings,
    setMathObjectSettings,
    showProps,
    interfaceType,
    onDelete,
}) => {
    const handleChange = <K extends keyof MathObjectSettings>(key: K, value: MathObjectSettings[K]) => {
        setMathObjectSettings({
            ...mathObjectSettings,
            [key]: value,
        });
    };

    return (
        <div className="w-full bg-surface-button p-1 flex items-center shadow-md text-sm rounded-2xl">
            {/* Left controls container */}
            <div className="flex items-center gap-2">
                <Dropdown
                    label={"object_type"}
                    options={objectTypeOptions.map((option) => ({ label: option, value: option }))}
                    value={mathObjectSettings.objectType}
                    onChange={(value) => handleChange("objectType", value as ObjectType)}
                    labelPosition="above"
                />
                {showProps && (
                    <>
                        <TextArea
                            label={"example"}
                            value={mathObjectSettings.example}
                            onChange={(value) => handleChange("example", value)}
                            placeholder={"math_object_example"}
                        />
                        <Dropdown
                            label={"dependency"}
                            options={[
                                { label: "none", value: "none" },
                                ...dependencyTypeOptions.map((option) => ({ label: option, value: option })),
                            ]}
                            value={mathObjectSettings.dependency || "none"}
                            onChange={(value) => handleChange("dependency", value as DependencyType)}
                            labelPosition="above"
                        />
                        <NumberInput
                            label={"priority"}
                            value={mathObjectSettings.priority}
                            onChange={(value) => handleChange("priority", value)}
                            min={0}
                            max={9}
                        />
                    </>
                )}
            </div>

            {/* Center: MathObjectDescription takes the remaining space */}
            <div className="flex-1 flex justify-center ml-2">
                <MathObjectDescription
                    objectType={mathObjectSettings.objectType}
                    interfaceType={interfaceType}
                    startIndex={1}
                    settings={
                        mathObjectSettings.objectType === "coefficient"
                            ? mathObjectSettings.coefficientSettings
                            : mathObjectSettings.objectType === "coefficients"
                                ? mathObjectSettings.coefficientsSettings
                                : mathObjectSettings.objectType === "term"
                                    ? mathObjectSettings.termSettings
                                    : mathObjectSettings.objectType === "terms"
                                        ? mathObjectSettings.termsSettings
                                        : mathObjectSettings.objectType === "equation"
                                            ? mathObjectSettings.equationSettings
                                            : mathObjectSettings.objectType === "function"
                                                ? mathObjectSettings.functionSettings
                                                : mathObjectSettings.objectType === "point"
                                                    ? mathObjectSettings.pointSettings
                                                    : mathObjectSettings.objectType === "set"
                                                        ? mathObjectSettings.setSettings
                                                        : mathObjectSettings.objectType === "interval"
                                                            ? mathObjectSettings.intervalSettings
                                                            : mathObjectSettings.objectType === "inequality"
                                                                ? mathObjectSettings.inequalitySettings
                                                                : mathObjectSettings.objectType === "expression"
                                                                    ? mathObjectSettings.expressionSettings
                                                                    : ({} as CoefficientSettings)
                    }
                />
            </div>

            {/* Right side: Delete icon */}
            <div className="ml-2">
                <IconButton
                    icon={<FiTrash2 />}
                    onClick={onDelete}
                    color="red"
                    size="medium"
                    title="delete"
                />
            </div>
        </div>
    );
};

export default ObjectRow;



