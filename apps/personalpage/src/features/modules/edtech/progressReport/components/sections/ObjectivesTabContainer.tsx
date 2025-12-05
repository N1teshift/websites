/**
 * Objectives Tab Container
 * Contains two tabs: Test Completion (old missions) and Cambridge Objectives (new missions)
 */

import React, { useState } from 'react';
import { StudentData } from '../../types/ProgressReportTypes';
import ObjectivesSection from './ObjectivesSection';
import { MissionCreator } from '../missions/MissionCreator';
import { MyMissions } from '../missions/MyMissions';

interface ObjectivesTabContainerProps {
    students: StudentData[];
    onDataChange?: (updatedStudents: StudentData[]) => void;
}

export const ObjectivesTabContainer: React.FC<ObjectivesTabContainerProps> = ({
    students,
    onDataChange
}) => {
    const [activeTab, setActiveTab] = useState<'mission-creator' | 'my-missions' | 'test-completion'>('mission-creator');

    const handleStudentUpdate = (updatedStudent: StudentData) => {
        if (!onDataChange) return;

        const updatedStudents = students.map(s => 
            s.id === updatedStudent.id ? updatedStudent : s
        );
        onDataChange(updatedStudents);
    };

    return (
        <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
                <nav className="flex space-x-1 px-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('mission-creator')}
                        className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'mission-creator'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🎯</span>
                            <span>Mission Creator</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('my-missions')}
                        className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'my-missions'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xl">📚</span>
                            <span>My Missions</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('test-completion')}
                        className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'test-completion'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xl">✅</span>
                            <span>Test Completion</span>
                        </div>
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="px-6">
                {activeTab === 'mission-creator' && (
                    <MissionCreator
                        students={students}
                        onStudentUpdate={handleStudentUpdate}
                    />
                )}
                {activeTab === 'my-missions' && (
                    <MyMissions
                        students={students}
                        onStudentUpdate={handleStudentUpdate}
                    />
                )}
                {activeTab === 'test-completion' && (
                    <ObjectivesSection
                        students={students}
                        onDataChange={onDataChange}
                    />
                )}
            </div>
        </div>
    );
};

export default ObjectivesTabContainer;




