import React, { useEffect, useRef } from "react";
import { useFallbackTranslation } from '@websites/infrastructure/i18n';
import { BaseToggleSwitch } from "@websites/ui";
import useInterfaceType from "../hooks/useInterfaceType";
import { InterfaceType } from "@math/types/index";

export interface InterfaceToggleSwitchProps {
    containerId: string; // unique container id
    onChange: (newType: "simple" | "complex") => void; // called when toggled
    children: React.ReactNode; // content next to toggle
    initialType?: InterfaceType; // optional initial type
}

const InterfaceToggleSwitch: React.FC<InterfaceToggleSwitchProps> = ({
    containerId,
    onChange,
    children,
    initialType,
}) => {
    const { t } = useFallbackTranslation();
    const { interfaceType, setInterfaceType } = useInterfaceType(containerId);
    const initializedRef = useRef(false);
    
    // Set initial interface type once on mount if specified
    useEffect(() => {
        if (initialType && !initializedRef.current) {
            setInterfaceType(initialType);
            initializedRef.current = true;
        }
    }, [containerId, initialType, setInterfaceType]);

    return (
        <div className="flex flex-row items-start gap-4 w-full">
            <BaseToggleSwitch
                value={interfaceType}
                options={[
                    { label: t("simple"), value: "simple" },
                    { label: t("complex"), value: "complex" },
                ]}
                onChange={(newValue) => {
                    const newInterface = newValue as "simple" | "complex";
                    setInterfaceType(newInterface);
                    onChange(newInterface);
                }}
            />
            <div className="flex-1">{children}</div>
        </div>
    );
};

export default InterfaceToggleSwitch;



