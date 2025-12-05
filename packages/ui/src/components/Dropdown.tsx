import React, { useState, useEffect, useRef, useMemo } from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface DropdownOption {
    label: string;
    value: string;
}

interface DropdownProps {
    label: string;
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    labelPosition?: "above" | "left";
}

const Dropdown: React.FC<DropdownProps> = ({
    label,
    options,
    value,
    onChange,
    disabled = false,
    labelPosition = "above",
}) => {
    const { t } = useFallbackTranslation();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((o) => o.value === value);
    const selectedLabel = selectedOption ? t(selectedOption.label) : "";

    const toggleOpen = () => {
        if (!disabled) setOpen(!open);
    };

    const handleSelect = (val: string) => {
        onChange(val);
        setOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const buttonWidth = useMemo(() => {
        const maxLabelLength = Math.max(
            ...options.map((opt) => t(opt.label).length),
            t(label).length
        );
        return `${maxLabelLength + 2}ch`;
    }, [options, label, t]);

    return (
        <div
            className={`mb-0 inline-flex ${labelPosition === "left" ? "items-center space-x-2" : "flex-col items-center"
                }`}
            style={{ minWidth: buttonWidth }}
            ref={containerRef}
        >
            <label className={`font-semibold ${disabled ? "text-text-muted" : "text-text-primary"} whitespace-nowrap`}>
                {t(label)}
            </label>
            <div className="relative" style={{ width: buttonWidth, minWidth: buttonWidth }}>
                <button
                    type="button"
                    disabled={disabled}
                    className={`w-full text-left border rounded-md bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand px-3 py-1.5 ${disabled ? "border-border-default text-text-muted opacity-60" : "border-border-default text-text-primary hover:border-brand"
                        } transition-colors shadow-sm`}
                    onClick={toggleOpen}
                >
                    {selectedLabel || t("select")}
                </button>
                {open && (
                    <ul className="absolute z-10 mt-1 w-full bg-surface-card border border-border-default rounded-md shadow-lg max-h-60 overflow-y-auto overflow-x-hidden">
                        {options.map((opt) => (
                            <li
                                key={opt.value}
                                className={`px-3 py-2 cursor-pointer whitespace-normal break-words ${opt.value === value
                                        ? "bg-surface-button text-text-primary"
                                        : "text-text-primary hover:bg-surface-button-hover"
                                    }`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                {t(opt.label)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Dropdown;

