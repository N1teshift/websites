/**
 * Create Mission Dialog Component
 * Dialog for finalizing mission details before creation
 */

import React, { useState } from 'react';
import { StudentMissionCandidate, UnmasteredObjective } from '../../types/MissionTypes';
import { generateMissionTitle } from '../../utils/missionUtils';

interface CreateMissionDialogProps {
    candidate: StudentMissionCandidate;
    selectedObjectives: string[];
    onConfirm: (title: string, deadline: string | null, notes: string) => void;
    onCancel: () => void;
}

export const CreateMissionDialog: React.FC<CreateMissionDialogProps> = ({
    candidate,
    selectedObjectives,
    onConfirm,
    onCancel
}) => {
    const objectivesData = selectedObjectives
        .map(code => candidate.unmastered_objectives.find(obj => obj.code === code))
        .filter(Boolean) as UnmasteredObjective[];

    const defaultTitle = generateMissionTitle(selectedObjectives);
    const [title, setTitle] = useState(defaultTitle);
    const [deadline, setDeadline] = useState('');
    const [notes, setNotes] = useState('');

    const totalMissing = objectivesData.reduce((sum, obj) => sum + obj.missing_points, 0);

    // Get tomorrow's date as default min date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    const handleConfirm = () => {
        onConfirm(title, deadline || null, notes);
    };

    // Group by strand for display
    const byStrand = objectivesData.reduce((acc, obj) => {
        if (!acc[obj.strand]) acc[obj.strand] = [];
        acc[obj.strand].push(obj);
        return acc;
    }, {} as Record<string, UnmasteredObjective[]>);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Create Mission
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {candidate.first_name} {candidate.last_name} • {candidate.class_name}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Mission Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mission Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter mission title..."
                        />
                    </div>

                    {/* Deadline */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Deadline (Optional)
                        </label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            min={minDate}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add any notes about this mission..."
                        />
                    </div>

                    {/* Selected Objectives Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Selected Objectives ({selectedObjectives.length})
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(byStrand).map(([strand, objectives]) => (
                                <div key={strand}>
                                    <div className="text-xs font-semibold text-gray-600 mb-1">
                                        {strand}
                                    </div>
                                    <div className="space-y-1">
                                        {objectives.map(obj => (
                                            <div key={obj.code} className="flex items-center gap-2 text-sm">
                                                <span className={`font-mono ${
                                                    obj.current_score === 0 ? 'text-red-600' :
                                                    obj.current_score === 0.5 ? 'text-yellow-600' :
                                                    'text-gray-600'
                                                }`}>
                                                    {obj.code}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ({Array.isArray(obj.unit) ? obj.unit.join(', ') : obj.unit})
                                                </span>
                                                <span className="text-xs text-gray-400">→</span>
                                                <span className="text-xs text-blue-600">
                                                    {obj.pd_assessment}
                                                </span>
                                                <span className={`text-xs ml-auto ${
                                                    obj.current_score === 0 ? 'text-red-600' :
                                                    obj.current_score === 0.5 ? 'text-yellow-600' :
                                                    'text-gray-400'
                                                }`}>
                                                    {obj.current_score !== null ? `${obj.current_score}/1` : 'Not assessed'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Stats */}
                        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-sm">
                            <span className="text-gray-600">Total Missing Points:</span>
                            <span className="font-semibold text-red-600">
                                {totalMissing.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!title.trim()}
                        className={`px-6 py-2 rounded-md font-medium ${
                            title.trim()
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        Create Mission
                    </button>
                </div>
            </div>
        </div>
    );
};




