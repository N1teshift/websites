import React from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";

interface TextAreaProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

/**
 * A text area input component, styled as a single line for concise input.
 *
 * @param props The component props.
 * @param props.label The label for the text area (translation key).
 * @param props.value The current string value.
 * @param props.onChange Callback function triggered when the value changes.
 * @param props.placeholder Optional. Placeholder text for the text area.
 * @returns A React element representing the single-line text area.
 */
const TextArea: React.FC<TextAreaProps> = ({ label, value, onChange, placeholder = "" }) => {
    const { t } = useFallbackTranslation();
    return (
        <div className="flex flex-col">
            <label className="font-bold text-sm">{t(label)}</label>
            <textarea
                className="w-full h-8 border border-gray-300 rounded-md p-1 resize-none whitespace-nowrap overflow-hidden text-ellipsis"
                value={value}
                placeholder={placeholder}
                rows={1}
                onChange={(e) => onChange(e.target.value)}
            ></textarea>
        </div>
    );
};

export default TextArea;

