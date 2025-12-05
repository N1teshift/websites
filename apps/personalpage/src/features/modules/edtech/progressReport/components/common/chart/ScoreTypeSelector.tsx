import React from 'react';
import { ScoreTypeOption } from '../../../hooks/useAvailableScoreTypes';
import { AllScoreTypes } from '../ClassPerformanceChartEnhanced';

interface ScoreTypeSelectorProps {
    scoreType: AllScoreTypes;
    availableScoreTypes: ScoreTypeOption[];
    onScoreTypeChange: (scoreType: AllScoreTypes) => void;
}

/**
 * Dropdown selector for choosing which score type to display (percentage, MYP, Cambridge, etc.)
 */
export const ScoreTypeSelector: React.FC<ScoreTypeSelectorProps> = ({
    scoreType,
    availableScoreTypes,
    onScoreTypeChange
}) => {
    if (availableScoreTypes.length === 0) {
        return null;
    }
    
    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Score Type:</label>
            <select
                value={scoreType}
                onChange={(e) => onScoreTypeChange(e.target.value as AllScoreTypes)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
                {availableScoreTypes.map(st => (
                    <option key={st.value} value={st.value}>
                        {st.label}
                    </option>
                ))}
            </select>
        </div>
    );
};




