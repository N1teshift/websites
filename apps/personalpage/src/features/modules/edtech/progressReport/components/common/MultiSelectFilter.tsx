import React from 'react';

interface MultiSelectFilterProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    label: string;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
    options,
    selected,
    onChange,
    label
}) => {

    const handleToggle = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const handleSelectAll = () => {
        onChange(options);
    };

    const handleClearAll = () => {
        onChange([]);
    };

    const allSelected = selected.length === options.length;
    const noneSelected = selected.length === 0;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
                <label className="font-semibold text-gray-900">{label}</label>
                <div className="flex gap-2">
                    <button
                        onClick={handleSelectAll}
                        disabled={allSelected}
                        className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                        onClick={handleClearAll}
                        disabled={noneSelected}
                        className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {options.map(option => {
                    const isSelected = selected.includes(option);
                    return (
                        <button
                            key={option}
                            onClick={() => handleToggle(option)}
                            className={`px-3 py-1.5 text-sm rounded-md border-2 transition-all ${
                                isSelected
                                    ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {isSelected && <span className="mr-1">✓</span>}
                            {option}
                        </button>
                    );
                })}
            </div>

            {selected.length > 0 && (
                <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
                    <span className="font-medium">{selected.length}</span> of {options.length} selected
                </div>
            )}
        </div>
    );
};

export default MultiSelectFilter;




