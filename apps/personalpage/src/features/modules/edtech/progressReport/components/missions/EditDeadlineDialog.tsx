/**
 * Edit Deadline Dialog Component
 * Simple dialog for editing mission deadline
 */

import React, { useState } from 'react';
import { CambridgeMission } from '../../types/MissionTypes';

interface EditDeadlineDialogProps {
    mission: CambridgeMission;
    onSave: (newDeadline: string | null) => void;
    onCancel: () => void;
}

export const EditDeadlineDialog: React.FC<EditDeadlineDialogProps> = ({
    mission,
    onSave,
    onCancel
}) => {
    const [deadline, setDeadline] = useState(mission.deadline || '');

    // Get tomorrow's date as default min date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    const handleSave = () => {
        onSave(deadline || null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        Edit Deadline
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {mission.title}
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deadline
                    </label>
                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        min={minDate}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Leave empty to remove deadline
                    </p>
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
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};




