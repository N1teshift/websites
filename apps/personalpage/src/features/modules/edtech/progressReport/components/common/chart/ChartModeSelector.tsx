import React from 'react';
import { GroupedAssessments } from '../../../utils/chartAssessmentUtils';

interface ChartModeSelectorProps {
    mode: string;
    groupedOptions: GroupedAssessments;
    onModeChange: (mode: string) => void;
    label: string;
}

/**
 * Dropdown selector for choosing which assessment to display in the chart
 */
export const ChartModeSelector: React.FC<ChartModeSelectorProps> = ({
    mode,
    groupedOptions,
    onModeChange,
    label
}) => {
    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">{label}:</label>
            <select
                value={mode}
                onChange={(e) => onModeChange(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
                {groupedOptions.english_diagnostic.length > 0 && (
                    <optgroup label="English Diagnostic Tests">
                        {groupedOptions.english_diagnostic.map(test => (
                            <option key={test.id} value={test.id}>{test.title}</option>
                        ))}
                    </optgroup>
                )}
                {groupedOptions.english_unit.length > 0 && (
                    <optgroup label="English Unit Tests">
                        {groupedOptions.english_unit.map(test => (
                            <option key={test.id} value={test.id}>{test.title}</option>
                        ))}
                    </optgroup>
                )}
                {groupedOptions.summative.length > 0 && (
                    <optgroup label="Summative Assessments">
                        {groupedOptions.summative.map(a => (
                            <option key={a.id} value={a.id}>{a.title}</option>
                        ))}
                    </optgroup>
                )}
                {groupedOptions.test.length > 0 && (
                    <optgroup label="Tests">
                        {groupedOptions.test.map(a => (
                            <option key={a.id} value={a.id}>{a.title}</option>
                        ))}
                    </optgroup>
                )}
                {groupedOptions.homework.length > 0 && (
                    <optgroup label="Homework (Binary)">
                        {groupedOptions.homework.map(a => (
                            <option key={a.id} value={a.id}>{a.title}</option>
                        ))}
                    </optgroup>
                )}
                {groupedOptions.homework_graded.length > 0 && (
                    <optgroup label="Homework (Graded)">
                        {groupedOptions.homework_graded.map(a => (
                            <option key={a.id} value={a.id}>{a.title}</option>
                        ))}
                    </optgroup>
                )}
            </select>
        </div>
    );
};




