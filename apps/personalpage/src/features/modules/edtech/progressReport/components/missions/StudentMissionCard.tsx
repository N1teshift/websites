/**
 * Student Mission Card Component
 * Displays a student with their unmastered objectives for mission creation
 */

import React, { useState } from 'react';
import { StudentMissionCandidate } from '../../types/MissionTypes';

interface StudentMissionCardProps {
    candidate: StudentMissionCandidate;
    onCreateMission: (studentId: string, selectedObjectives: string[]) => void;
}

export const StudentMissionCard: React.FC<StudentMissionCardProps> = ({
    candidate,
    onCreateMission
}) => {
    const [selectedObjectives, setSelectedObjectives] = useState<Set<string>>(new Set());

    const toggleObjective = (code: string) => {
        const newSet = new Set(selectedObjectives);
        if (newSet.has(code)) {
            newSet.delete(code);
        } else {
            newSet.add(code);
        }
        setSelectedObjectives(newSet);
    };

    const selectAll = () => {
        setSelectedObjectives(new Set(candidate.unmastered_objectives.map(obj => obj.code)));
    };

    const deselectAll = () => {
        setSelectedObjectives(new Set());
    };

    const handleCreateMission = () => {
        if (selectedObjectives.size > 0) {
            onCreateMission(candidate.student_id, Array.from(selectedObjectives));
        }
    };

    // Group objectives by strand
    const objectivesByStrand = candidate.unmastered_objectives.reduce((acc, obj) => {
        if (!acc[obj.strand]) {
            acc[obj.strand] = [];
        }
        acc[obj.strand].push(obj);
        return acc;
    }, {} as Record<string, typeof candidate.unmastered_objectives>);

    const getScoreColor = (score: number | null): string => {
        if (score === null) return 'text-gray-400';
        if (score === 0) return 'text-red-600';
        if (score === 0.5) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getScoreDisplay = (score: number | null): string => {
        if (score === null) return 'Not assessed';
        return `${score}/1`;
    };

    const getScoreBadge = (score: number | null): string => {
        if (score === null) return '⚪';
        if (score === 0) return '🔴';
        if (score === 0.5) return '🟡';
        return '🟢';
    };

    return (
        <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {candidate.first_name} {candidate.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">{candidate.class_name}</p>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-red-600">
                        {candidate.missing_points.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">points missing</div>
                </div>
            </div>

            {/* Last Assessed */}
            {candidate.last_assessed && (
                <div className="text-xs text-gray-500 mb-3">
                    Last assessed: {candidate.last_assessed}
                </div>
            )}

            {/* Objectives grouped by strand */}
            <div className="space-y-3 mb-4">
                {Object.entries(objectivesByStrand).map(([strand, objectives]) => (
                    <div key={strand}>
                        <div className="text-sm font-semibold text-gray-700 mb-1">
                            {strand}
                        </div>
                        <div className="space-y-1">
                            {objectives.map(obj => (
                                <label
                                    key={obj.code}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedObjectives.has(obj.code)}
                                        onChange={() => toggleObjective(obj.code)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className={`text-sm font-mono ${getScoreColor(obj.current_score)}`}>
                                        {getScoreBadge(obj.current_score)} {obj.code}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        ({Array.isArray(obj.unit) ? obj.unit.join(', ') : obj.unit})
                                    </span>
                                    <span className="text-xs text-gray-400">→</span>
                                    <span className="text-xs text-blue-600 font-medium">
                                        {obj.pd_assessment}
                                    </span>
                                    <span className={`text-xs ml-auto ${getScoreColor(obj.current_score)}`}>
                                        {getScoreDisplay(obj.current_score)}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                    onClick={selectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    Select All
                </button>
                <button
                    onClick={deselectAll}
                    className="text-sm text-gray-600 hover:text-gray-700"
                >
                    Clear
                </button>
                <button
                    onClick={handleCreateMission}
                    disabled={selectedObjectives.size === 0}
                    className={`ml-auto px-4 py-2 rounded text-sm font-medium ${
                        selectedObjectives.size > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Create Mission ({selectedObjectives.size})
                </button>
            </div>
        </div>
    );
};




