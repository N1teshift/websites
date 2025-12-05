/**
 * Cambridge Objectives Table Component
 * Displays student Cambridge objective mastery in a grid format
 */

import React, { useState, useMemo, useCallback } from 'react';
import { StudentData } from '../../types/ProgressReportTypes';
import { CAMBRIDGE_OBJECTIVE_STRANDS, getAssessmentsForObjective, getCambridgeScoreField, getUnitsForObjective } from '@progressReport/student-data/config/cambridgeObjectiveMapping';

interface CambridgeObjectivesTableProps {
    students: StudentData[];
}

const CambridgeObjectivesTable: React.FC<CambridgeObjectivesTableProps> = ({ students }) => {
    const [selectedStrands, setSelectedStrands] = useState<Set<string>>(new Set(Object.keys(CAMBRIDGE_OBJECTIVE_STRANDS)));
    const [sortBy, setSortBy] = useState<'name' | 'mastery'>('name');

    // Toggle strand selection
    const toggleStrand = (strand: string) => {
        const newSelection = new Set(selectedStrands);
        if (newSelection.has(strand)) {
            newSelection.delete(strand);
        } else {
            newSelection.add(strand);
        }
        setSelectedStrands(newSelection);
    };

    // Select all strands
    const selectAllStrands = () => {
        setSelectedStrands(new Set(Object.keys(CAMBRIDGE_OBJECTIVE_STRANDS)));
    };

    // Deselect all strands
    const deselectAllStrands = () => {
        setSelectedStrands(new Set());
    };

    // Get all unique objectives from all students
    const allObjectives = useMemo(() => {
        const objectiveSet = new Set<string>();
        students.forEach(student => {
            const objectives = student.curriculum_progress?.cambridge_objectives;
            if (objectives) {
                Object.keys(objectives).forEach(code => objectiveSet.add(code));
            }
        });
        return Array.from(objectiveSet).sort();
    }, [students]);

    // Filter objectives by selected strands
    const filteredObjectives = useMemo(() => {
        if (selectedStrands.size === 0) {
            return [];
        }
        
        const objectivesInSelectedStrands: string[] = [];
        selectedStrands.forEach(strandName => {
            const objectives = CAMBRIDGE_OBJECTIVE_STRANDS[strandName as keyof typeof CAMBRIDGE_OBJECTIVE_STRANDS];
            if (objectives) {
                objectivesInSelectedStrands.push(...objectives);
            }
        });
        
        // Return in sorted order
        return allObjectives.filter(obj => objectivesInSelectedStrands.includes(obj));
    }, [selectedStrands, allObjectives]);

    // Calculate mastery percentage for a student
    const calculateMastery = useCallback((student: StudentData) => {
        const objectives = student.curriculum_progress?.cambridge_objectives;
        if (!objectives) return 0;

        const relevantObjectives = filteredObjectives.filter(code => code in objectives);
        if (relevantObjectives.length === 0) return 0;

        const masteredCount = relevantObjectives.filter(code => 
            objectives[code]?.current_score === 1
        ).length;

        return (masteredCount / relevantObjectives.length) * 100;
    }, [filteredObjectives]);

    // Sort students
    const sortedStudents = useMemo(() => {
        const sorted = [...students];
        if (sortBy === 'mastery') {
            sorted.sort((a, b) => calculateMastery(b) - calculateMastery(a));
        } else {
            sorted.sort((a, b) => 
                `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`)
            );
        }
        return sorted;
    }, [students, sortBy, calculateMastery]);

    // Get score color
    const getScoreColor = (score: number | null): string => {
        if (score === null) return 'bg-gray-100 text-gray-400';
        if (score === 1) return 'bg-green-100 text-green-800';
        if (score === 0.5) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    // Get score display
    const getScoreDisplay = (score: number | null): string => {
        if (score === null) return '—';
        return score.toString();
    };

    // Check if there's a newer assessment for this objective
    const checkForNewerData = (student: StudentData, objectiveCode: string): {
        hasNewerData: boolean;
        newestScore: number | null;
        newestDate: string;
        newestAssessment: string;
    } | null => {
        const objective = student.curriculum_progress?.cambridge_objectives?.[objectiveCode];
        if (!objective || !student.assessments) return null;

        const relevantAssessments = getAssessmentsForObjective(objectiveCode);
        const currentLastUpdated = objective.last_updated;
        
        // Find the most recent assessment that tests this objective
        let newestAssessment: typeof student.assessments[0] | null = null;
        let newestDate = '';

        for (const assessment of student.assessments) {
            const assessmentId = assessment.assessment_id?.toUpperCase() || assessment.column?.toUpperCase();
            if (!assessmentId || !relevantAssessments.includes(assessmentId)) continue;

            // Get the correct Cambridge score field for this specific objective
            const scoreField = getCambridgeScoreField(assessmentId, objectiveCode);
            let cambridgeScore: number | null = null;
            
            if (scoreField === 'cambridge_score_1') {
                cambridgeScore = assessment.evaluation_details?.cambridge_score_1 ?? null;
            } else if (scoreField === 'cambridge_score_2') {
                cambridgeScore = assessment.evaluation_details?.cambridge_score_2 ?? null;
            } else {
                cambridgeScore = assessment.evaluation_details?.cambridge_score ?? null;
            }
            
            if (cambridgeScore === null || cambridgeScore === undefined) continue;

            if (!newestDate || assessment.date > newestDate) {
                newestDate = assessment.date;
                newestAssessment = assessment;
            }
        }

        if (!newestAssessment || !currentLastUpdated) return null;

        // Check if the newest assessment is after the current last_updated date
        const hasNewerData = newestDate > currentLastUpdated;
        
        // Get the correct score from the newest assessment
        const assessmentId = newestAssessment.assessment_id?.toUpperCase() || newestAssessment.column?.toUpperCase();
        const scoreField = getCambridgeScoreField(assessmentId || '', objectiveCode);
        let newestScore: number | null = null;
        
        if (scoreField === 'cambridge_score_1') {
            newestScore = newestAssessment.evaluation_details?.cambridge_score_1 ?? null;
        } else if (scoreField === 'cambridge_score_2') {
            newestScore = newestAssessment.evaluation_details?.cambridge_score_2 ?? null;
        } else {
            newestScore = newestAssessment.evaluation_details?.cambridge_score ?? null;
        }
        
        const scoreChanged = newestScore !== objective.current_score;

        if (hasNewerData && scoreChanged) {
            const assessmentId = newestAssessment.assessment_id?.toUpperCase() || newestAssessment.column?.toUpperCase();
            return {
                hasNewerData: true,
                newestScore,
                newestDate,
                newestAssessment: assessmentId || ''
            };
        }

        return null;
    };

    // Get score tooltip with stale data warning
    const getScoreTooltip = (student: StudentData, objectiveCode: string): string => {
        const objective = student.curriculum_progress?.cambridge_objectives?.[objectiveCode];
        if (!objective) return 'Not assessed';

        const newerData = checkForNewerData(student, objectiveCode);

        const lines = [
            `Current: ${objective.current_score ?? 'Not assessed'}`,
            `Last updated: ${objective.last_updated ?? 'Never'}`,
        ];

        if (newerData) {
            lines.push(
                '',
                '⚠️ STALE DATA WARNING:',
                `Newer assessment found: ${newerData.newestAssessment}`,
                `Date: ${newerData.newestDate}`,
                `Score: ${newerData.newestScore}`,
                '',
                'Tip: Re-import Cambridge objectives to update'
            );
        }

        if (objective.history && objective.history.length > 0) {
            lines.push('', 'History:');
            objective.history.forEach(entry => {
                lines.push(`  ${entry.date}: ${entry.score} (${entry.assessment})`);
            });
        }

        return lines.join('\n');
    };

    if (students.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No students to display
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                {/* Strand Filter Buttons */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">Filter by strands:</label>
                        <div className="flex gap-2">
                            <button
                                onClick={selectAllStrands}
                                className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                            >
                                Select All
                            </button>
                            <button
                                onClick={deselectAllStrands}
                                className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                Deselect All
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(CAMBRIDGE_OBJECTIVE_STRANDS).map(([strand, objectives]) => {
                            const isSelected = selectedStrands.has(strand);
                            return (
                                <button
                                    key={strand}
                                    onClick={() => toggleStrand(strand)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                                        isSelected
                                            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {strand} ({objectives.length})
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sort Control */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-700">Sort by:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'mastery')}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="name">Name</option>
                        <option value="mastery">Mastery %</option>
                    </select>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-6 text-sm bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center text-green-800 font-medium">1</div>
                    <span className="text-gray-700">Mastered</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-6 bg-yellow-100 border border-yellow-300 rounded flex items-center justify-center text-yellow-800 font-medium">0.5</div>
                    <span className="text-gray-700">Partial</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-6 bg-red-100 border border-red-300 rounded flex items-center justify-center text-red-800 font-medium">0</div>
                    <span className="text-gray-700">Not mastered</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-6 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-gray-400 font-medium">—</div>
                    <span className="text-gray-700">Not assessed</span>
                </div>
                <div className="flex items-center gap-2 pl-4 border-l-2 border-orange-300">
                    <div className="w-8 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center text-green-800 font-medium relative">
                        1
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-white text-[8px] font-bold">!</span>
                        </span>
                    </div>
                    <span className="text-gray-700">⚠️ Stale data (newer assessment exists)</span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {/* Unit Header Row */}
                        <tr className="border-b border-gray-300">
                            <th 
                                scope="col" 
                                rowSpan={2}
                                className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200"
                            >
                                Student
                            </th>
                            <th 
                                scope="col" 
                                rowSpan={2}
                                className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider"
                            >
                                Mastery
                            </th>
                            {filteredObjectives.map(objectiveCode => {
                                const units = getUnitsForObjective(objectiveCode);
                                return (
                                    <th 
                                        key={`unit-${objectiveCode}`}
                                        scope="col" 
                                        className="px-2 py-2 text-center text-[10px] font-medium text-blue-600 tracking-wider whitespace-nowrap bg-blue-50"
                                        title={`Unit(s): ${units.join(', ')}`}
                                    >
                                        {units.join(', ')}
                                    </th>
                                );
                            })}
                        </tr>
                        {/* Objective Code Row */}
                        <tr>
                            {filteredObjectives.map(objectiveCode => (
                                <th 
                                    key={objectiveCode}
                                    scope="col" 
                                    className="px-2 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap"
                                    title={objectiveCode}
                                >
                                    {objectiveCode}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedStudents.map((student, idx) => {
                            const mastery = calculateMastery(student);
                            return (
                                <tr key={student.id || idx} className="hover:bg-gray-50">
                                    <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 whitespace-nowrap">
                                        {student.last_name} {student.first_name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            mastery >= 80 ? 'bg-green-100 text-green-800' :
                                            mastery >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                            mastery >= 40 ? 'bg-orange-100 text-orange-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {mastery.toFixed(0)}%
                                        </span>
                                    </td>
                                    {filteredObjectives.map(objectiveCode => {
                                        const objective = student.curriculum_progress?.cambridge_objectives?.[objectiveCode];
                                        const score = objective?.current_score ?? null;
                                        const newerData = checkForNewerData(student, objectiveCode);
                                        
                                        return (
                                            <td 
                                                key={objectiveCode}
                                                className="px-2 py-3 text-center text-xs relative"
                                                title={getScoreTooltip(student, objectiveCode)}
                                            >
                                                <span className={`inline-flex items-center justify-center w-8 h-6 rounded ${getScoreColor(score)} font-medium relative`}>
                                                    {getScoreDisplay(score)}
                                                    {newerData && (
                                                        <span 
                                                            className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center"
                                                            title={`Newer data: ${newerData.newestScore} on ${newerData.newestDate}`}
                                                        >
                                                            <span className="text-white text-[8px] font-bold">!</span>
                                                        </span>
                                                    )}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                <p>
                    Showing <strong>{filteredObjectives.length}</strong> objectives for <strong>{sortedStudents.length}</strong> students
                    {selectedStrands.size > 0 && selectedStrands.size < Object.keys(CAMBRIDGE_OBJECTIVE_STRANDS).length && 
                        ` (${selectedStrands.size} of ${Object.keys(CAMBRIDGE_OBJECTIVE_STRANDS).length} strands selected)`
                    }
                </p>
            </div>
        </div>
    );
};

export default CambridgeObjectivesTable;




