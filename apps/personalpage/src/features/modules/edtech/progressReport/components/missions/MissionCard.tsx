/**
 * Mission Card Component
 * Displays a single Cambridge objectives mission
 */

import React from 'react';
import { CambridgeMission } from '../../types/MissionTypes';
import { calculateMissionSummary, isMissionOverdue } from '../../utils/missionUtils';

interface MissionCardProps {
    mission: CambridgeMission;
    studentName: string;
    onViewDetails: (mission: CambridgeMission) => void;
    onEditDeadline?: (mission: CambridgeMission) => void;
    onComplete?: (mission: CambridgeMission) => void;
    onCancel?: (mission: CambridgeMission) => void;
}

export const MissionCard: React.FC<MissionCardProps> = ({
    mission,
    studentName,
    onViewDetails,
    onEditDeadline,
    onComplete,
    onCancel
}) => {
    const summary = calculateMissionSummary(mission);
    const isOverdue = isMissionOverdue(mission);

    const getStatusColor = () => {
        if (mission.status === 'completed') return 'bg-green-50 border-green-300';
        if (mission.status === 'cancelled') return 'bg-gray-100 border-gray-300';
        if (isOverdue) return 'bg-red-50 border-red-300';
        if (mission.status === 'in_progress') return 'bg-blue-50 border-blue-300';
        return 'bg-gray-50 border-gray-200';
    };

    const getStatusBadge = () => {
        const baseClass = 'px-3 py-1 rounded-full text-xs font-semibold';
        
        if (mission.status === 'completed') {
            return <span className={`${baseClass} bg-green-200 text-green-800`}>✅ Completed</span>;
        }
        if (mission.status === 'cancelled') {
            return <span className={`${baseClass} bg-gray-300 text-gray-700`}>❌ Cancelled</span>;
        }
        if (mission.status === 'not_started') {
            return <span className={`${baseClass} bg-gray-200 text-gray-700`}>⚪ Not Started</span>;
        }
        if (isOverdue) {
            return <span className={`${baseClass} bg-red-200 text-red-800`}>⚠️ Overdue</span>;
        }
        return <span className={`${baseClass} bg-blue-200 text-blue-800`}>🟡 In Progress</span>;
    };

    const getDaysUntilDeadline = () => {
        if (!mission.deadline) return null;
        
        const today = new Date();
        const deadline = new Date(mission.deadline);
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    };

    const daysLeft = getDaysUntilDeadline();

    return (
        <div className={`border-2 rounded-lg p-4 transition-all hover:shadow-lg ${getStatusColor()}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {mission.title}
                    </h3>
                    <p className="text-sm text-gray-600">{studentName}</p>
                </div>
                {getStatusBadge()}
            </div>

            {/* Deadline */}
            {mission.deadline && mission.status !== 'completed' && mission.status !== 'cancelled' && (
                <div className="mb-3 flex items-center gap-2 text-sm">
                    <span className="text-gray-600">📅</span>
                    <span className={`${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                        {new Date(mission.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </span>
                    {daysLeft !== null && (
                        <span className={`text-xs ${
                            isOverdue ? 'text-red-600' : 
                            daysLeft <= 3 ? 'text-orange-600' : 
                            'text-gray-500'
                        }`}>
                            {isOverdue ? '(Overdue)' : `(${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)`}
                        </span>
                    )}
                </div>
            )}

            {/* Completion Date */}
            {mission.status === 'completed' && mission.completed_date && (
                <div className="mb-3 flex items-center gap-2 text-sm text-green-700">
                    <span>✅</span>
                    <span>Completed: {new Date(mission.completed_date).toLocaleDateString()}</span>
                    {mission.deadline && new Date(mission.completed_date) < new Date(mission.deadline) && (
                        <span className="text-xs text-green-600 font-semibold">(On time!)</span>
                    )}
                </div>
            )}

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{summary.completion_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${
                            mission.status === 'completed' ? 'bg-green-500' :
                            mission.status === 'cancelled' ? 'bg-gray-400' :
                            'bg-blue-500'
                        }`}
                        style={{ width: `${summary.completion_percentage}%` }}
                    />
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
                <div className="text-center">
                    <div className="font-semibold text-gray-900">{summary.total_objectives}</div>
                    <div className="text-gray-500">Total</div>
                </div>
                <div className="text-center">
                    <div className="font-semibold text-green-600">{summary.mastered}</div>
                    <div className="text-gray-500">Mastered</div>
                </div>
                <div className="text-center">
                    <div className="font-semibold text-blue-600">{summary.improved}</div>
                    <div className="text-gray-500">Improved</div>
                </div>
                <div className="text-center">
                    <div className="font-semibold text-gray-600">{summary.not_assessed}</div>
                    <div className="text-gray-500">Pending</div>
                </div>
            </div>

            {/* Missing Points */}
            <div className="mb-3 text-sm">
                <span className="text-gray-600">Missing Points: </span>
                <span className="font-semibold text-red-600">
                    {mission.missing_points_current.toFixed(1)}
                </span>
                {mission.missing_points_current < mission.missing_points_initial && (
                    <span className="text-xs text-green-600 ml-2">
                        (↓ {(mission.missing_points_initial - mission.missing_points_current).toFixed(1)} improved!)
                    </span>
                )}
            </div>

            {/* Notes */}
            {mission.notes && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <span className="text-gray-600">📝 </span>
                    <span className="text-gray-700">{mission.notes}</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                    onClick={() => onViewDetails(mission)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    View Details
                </button>
                
                {mission.status === 'in_progress' && (
                    <>
                        {onEditDeadline && (
                            <button
                                onClick={() => onEditDeadline(mission)}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                                title="Edit Deadline"
                            >
                                📅
                            </button>
                        )}
                        {onComplete && (
                            <button
                                onClick={() => onComplete(mission)}
                                className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                                title="Mark Complete"
                            >
                                ✅
                            </button>
                        )}
                        {onCancel && (
                            <button
                                onClick={() => onCancel(mission)}
                                className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                                title="Cancel Mission"
                            >
                                ❌
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};




