import React from "react";

type InterfaceType = "simple" | "complex";

interface BaseSliderProps {
    value: InterfaceType;
    onChange: (value: InterfaceType) => void;
    label?: string;
}

/**
 * A slider component to toggle between "simple" and "complex" interface types.
 *
 * @param props The component props.
 * @param props.value The current interface type ("simple" or "complex").
 * @param props.onChange Callback function triggered when the slider value changes.
 * @param props.label Optional. The label displayed above the slider. Defaults to "Interface Type".
 * @returns A React element representing the slider.
 */
const BaseSlider: React.FC<BaseSliderProps> = ({
    value,
    onChange,
    label = "Interface Type",
}) => {
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sliderValue = parseInt(e.target.value, 10);
        // Map slider value 0 to "simple", 1 to "complex"
        onChange(sliderValue === 0 ? "simple" : "complex");
    };

    return (
        <div className="flex flex-col items-center">
            {/* Label above the slider */}
            <div className="mb-2 font-bold">{label}</div>
            <div className="flex items-center space-x-4">
                <span className="font-semibold">Simple</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="1"
                    value={value === "simple" ? 0 : 1}
                    onChange={handleSliderChange}
                    className="w-32"
                />
                <span className="font-semibold">Complex</span>
            </div>
        </div>
    );
};

export default BaseSlider;
