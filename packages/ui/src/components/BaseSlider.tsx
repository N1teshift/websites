import React from "react";

export type InterfaceType = "simple" | "complex";

interface BaseSliderProps {
    value: InterfaceType;
    onChange: (value: InterfaceType) => void;
    label?: string;
}

const BaseSlider: React.FC<BaseSliderProps> = ({
    value,
    onChange,
    label = "Interface Type",
}) => {
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sliderValue = parseInt(e.target.value, 10);
        onChange(sliderValue === 0 ? "simple" : "complex");
    };

    return (
        <div className="flex flex-col items-center">
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

