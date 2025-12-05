import React, { useState, useEffect, useRef, useMemo } from "react";
import { MathObjectSettings, InterfaceType, DEFAULT_MATH_OBJECT_SETTINGS } from "@math/types/index";
import MathObjectSettingsList from "./MathObjectSettingsList";
import InterfaceContext from "./InterfaceContext";
import { IconButton } from "@components/ui/index";
import { FiPlusCircle } from "react-icons/fi";

/**
 * Props for the `MathObjectSettingsListContainer` component.
 */
export interface MathObjectSettingsListContainerProps {
    /** The current list of math object settings. */
    settingsList: MathObjectSettings[];
    /** Callback function to update the entire list of settings. */
    setSettingsList: (settings: MathObjectSettings[]) => void;
    /** Optional flag passed to `MathObjectSettingsList` to show additional properties. */
    showProps?: boolean;
    /** Optional initial map for interface types (simple/complex) for settings items. */
    initialInterfaceMap?: Record<string, InterfaceType>;
    /** 
     * Optional callback that, when provided, is called once to allow the parent to pass a function
     * for updating the internal `interfaceMap` state from the outside.
     */
    onInterfaceMapReady?: (presetFunc: (interfaceTypes: Record<string, InterfaceType>) => void) => void;
}

/**
 * A container component that manages a list of `MathObjectSettings`.
 * It provides functionality to add, remove, and update settings in the list,
 * and wraps the displayed list in an `InterfaceContext.Provider` to manage
 * the simple/complex view state for each setting item.
 *
 * @param {MathObjectSettingsListContainerProps} props - The component props.
 * @returns {React.ReactElement} A div element containing the list of settings and an "add" button.
 */
const MathObjectSettingsListContainer: React.FC<MathObjectSettingsListContainerProps> = ({
    settingsList,
    setSettingsList,
    showProps,
    initialInterfaceMap = {},
    onInterfaceMapReady
}) => {
    const [interfaceMap, setInterfaceMap] = useState<Record<string, InterfaceType>>(initialInterfaceMap);
    const callbackSetupDone = useRef(false);

    // Only set up the callback once
    useEffect(() => {
        if (onInterfaceMapReady && !callbackSetupDone.current) {
            onInterfaceMapReady((interfaceTypes) => {
                setInterfaceMap((prev) => ({ ...prev, ...interfaceTypes }));
            });
            callbackSetupDone.current = true;
        }
    }, [onInterfaceMapReady]);

    // Remove the debug logging effect that was causing continuous updates
    
    const addMathObject = () => {
        setSettingsList([...settingsList, { ...DEFAULT_MATH_OBJECT_SETTINGS }]);
    };

    const removeMathObject = (index: number) => {
        if (settingsList.length === 1) return;
        
        // Clean up interfaceMap when removing an object
        const updatedMap = { ...interfaceMap };
        Object.keys(updatedMap).forEach(key => {
            if (key.startsWith(`${index}-`)) {
                delete updatedMap[key];
            }
        });
        setInterfaceMap(updatedMap);
        
        setSettingsList(settingsList.filter((_, i) => i !== index));
    };

    const updateMathObjectSettings = (index: number, newSettings: MathObjectSettings) => {
        setSettingsList(settingsList.map((item, i) => (i === index ? newSettings : item)));
    };

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        interfaceMap,
        setInterfaceMap
    }), [interfaceMap, setInterfaceMap]);

    return (
        <InterfaceContext.Provider value={contextValue}>
            <div className="w-full flex flex-col gap-2">
                <MathObjectSettingsList
                    settingsList={settingsList}
                    onUpdate={updateMathObjectSettings}
                    onDelete={removeMathObject}
                    showProps={showProps}
                />
                <div className="flex justify-start">
                    <IconButton
                        icon={<FiPlusCircle />}
                        onClick={addMathObject}
                        color="blue"
                        size="large"
                        title="add_math_object"
                        variant="filled"
                    />
                </div>
            </div>
        </InterfaceContext.Provider>
    );
};

export default MathObjectSettingsListContainer;



