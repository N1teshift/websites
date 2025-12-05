import React, { useMemo, useState, useCallback } from 'react';
import { StudentData, Mission, StudentMissionProgress } from '../../types/ProgressReportTypes';
import MissionConstructor from '../common/MissionConstructor';

interface ObjectivesSectionProps {
    students: StudentData[];
    missions?: Mission[];
    onDataChange?: (updatedStudents: StudentData[]) => void;
}

interface GradeInput {
    studentId: string;
    assessmentType: 'KD' | 'SD1' | 'SD2' | 'SD3';
    value: string;
}

const ObjectivesSection: React.FC<ObjectivesSectionProps> = ({ students, missions: _missions = [], onDataChange }) => {
    
    // State for grade inputs
    const [gradeInputs, setGradeInputs] = useState<Map<string, GradeInput>>(new Map());
    const [isSaving, setIsSaving] = useState(false);
    const [showMissionConstructor, setShowMissionConstructor] = useState(false);
    const [customMissions, setCustomMissions] = useState<Mission[]>([]);

    // Dynamically calculate students missing KD2
    const findStudentsMissingKD2 = useMemo(() => {
        const missingStudents: StudentMissionProgress[] = [];
        const today = new Date().toISOString().split('T')[0];

        students.forEach(student => {
            const kdAssessment = student.assessments?.find(a => a.assessment_id === 'kd2');
            
            // Check if missing or has empty/n score
            const isMissing = !kdAssessment || 
                             kdAssessment.score === '' || 
                             kdAssessment.score === 'n' ||
                             !kdAssessment.score;

            if (isMissing) {
                missingStudents.push({
                    student_id: student.id!,
                    status: 'pending',
                    assigned_date: today,
                    notes: ''
                });
            }
        });

        return missingStudents;
    }, [students]);

    // Helper function to find students missing specific assessments
    const findStudentsMissingAssessments = useCallback((assessmentIds: string[]) => {
        const missingStudents: StudentMissionProgress[] = [];
        const today = new Date().toISOString().split('T')[0];

        students.forEach(student => {
            const missingAssessments: string[] = [];
            
            assessmentIds.forEach(assessmentId => {
                // Check both assessment_id and column fields (case-insensitive)
                const assessment = student.assessments?.find(a => 
                    a.assessment_id?.toLowerCase() === assessmentId.toLowerCase() ||
                    a.column?.toLowerCase() === assessmentId.toLowerCase()
                );
                const isMissing = !assessment || assessment.score === '' || assessment.score === 'n' || !assessment.score;
                
                if (isMissing) {
                    missingAssessments.push(assessmentId.toUpperCase());
                }
            });

            if (missingAssessments.length > 0) {
                missingStudents.push({
                    student_id: student.id!,
                    status: 'pending',
                    assigned_date: today,
                    notes: '',
                    missing_assessments: missingAssessments
                });
            }
        });

        return missingStudents;
    }, [students]);

    // Dynamically calculate students missing SD1, SD2, SD3 tests
    const findStudentsMissingSDTests = useMemo(() => {
        const missingStudents: StudentMissionProgress[] = [];
        const today = new Date().toISOString().split('T')[0];

        const sdTestIds = ['sd1', 'sd2', 'sd3'];
        const sdTestNames = ['SD1', 'SD2', 'SD3'];

        students.forEach(student => {
            const missingTests: string[] = [];

            sdTestIds.forEach((testId, index) => {
                const assessment = student.assessments?.find(a => a.assessment_id === testId);
                const percentageScore = assessment?.evaluation_details?.percentage_score;

                if (!assessment || percentageScore === null || percentageScore === undefined) {
                    missingTests.push(sdTestNames[index]);
                }
            });

            if (missingTests.length > 0) {
                missingStudents.push({
                    student_id: student.id!,
                    status: 'pending',
                    assigned_date: today,
                    missing_assessments: missingTests,
                    notes: ''
                });
            }
        });

        return missingStudents;
    }, [students]);

    // Find students missing SD4, SD5, SD6
    const findStudentsMissingSD456 = useMemo(() => {
        return findStudentsMissingAssessments(['sd4', 'sd5', 'sd6']);
    }, [findStudentsMissingAssessments]);

    // Find students missing SD7, SD8, SD9
    const findStudentsMissingSD789 = useMemo(() => {
        return findStudentsMissingAssessments(['sd7', 'sd8', 'sd9']);
    }, [findStudentsMissingAssessments]);

    // Find students missing KD3
    const findStudentsMissingKD3 = useMemo(() => {
        const missingStudents: StudentMissionProgress[] = [];
        const today = new Date().toISOString().split('T')[0];

        students.forEach(student => {
            const kdAssessment = student.assessments?.find(a => a.assessment_id === 'kd3');
            
            const isMissing = !kdAssessment || 
                             kdAssessment.score === '' || 
                             kdAssessment.score === 'n' ||
                             !kdAssessment.score;

            if (isMissing) {
                missingStudents.push({
                    student_id: student.id!,
                    status: 'pending',
                    assigned_date: today,
                    notes: ''
                });
            }
        });

        return missingStudents;
    }, [students]);

    // Generate missions dynamically based on current student data
    const dynamicMissions = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        
        const missions: Mission[] = [
            {
                mission_id: 'kd2-missing-data',
                title: 'KD2 Test Completion',
                description: 'Students with blank KD2 data must complete this test',
                deadline: '2025-10-31',
                created_date: today,
                status: 'active',
                check_type: 'column',
                assessment_column: 'KD2',
                assessment_display_name: 'KD2',
                students_assigned: findStudentsMissingKD2
            },
            {
                mission_id: 'sd-tests-missing',
                title: 'SD1, SD2, SD3 Tests Completion',
                description: 'Students must complete all three subunit tests (SD1, SD2, SD3) for grade calculation',
                deadline: '2025-11-07',
                created_date: today,
                status: 'active',
                check_type: 'assessment-ids',
                assessment_ids: ['sd1', 'sd2', 'sd3'],
                assessment_display_names: ['SD1', 'SD2', 'SD3'],
                students_assigned: findStudentsMissingSDTests
            },
            {
                mission_id: 'sd456-tests-missing',
                title: 'SD4, SD5, SD6 Tests Completion',
                description: 'Students must complete these three subunit tests',
                deadline: '2025-11-21',
                created_date: today,
                status: 'active',
                check_type: 'assessment-ids',
                assessment_ids: ['sd4', 'sd5', 'sd6'],
                assessment_display_names: ['SD4', 'SD5', 'SD6'],
                students_assigned: findStudentsMissingSD456
            },
            {
                mission_id: 'sd789-tests-missing',
                title: 'SD7, SD8, SD9 Tests Completion',
                description: 'Students must complete these three subunit tests',
                deadline: '2025-11-28',
                created_date: today,
                status: 'active',
                check_type: 'assessment-ids',
                assessment_ids: ['sd7', 'sd8', 'sd9'],
                assessment_display_names: ['SD7', 'SD8', 'SD9'],
                students_assigned: findStudentsMissingSD789
            },
            {
                mission_id: 'kd3-missing-data',
                title: 'KD3 Test Completion',
                description: 'Students with blank KD3 data must complete this test',
                deadline: '2025-11-28',
                created_date: today,
                status: 'active',
                check_type: 'column',
                assessment_column: 'KD3',
                assessment_display_name: 'KD3',
                students_assigned: findStudentsMissingKD3
            }
        ];

        return missions;
    }, [findStudentsMissingKD2, findStudentsMissingSDTests, findStudentsMissingSD456, findStudentsMissingSD789, findStudentsMissingKD3]);

    // Combine dynamic missions with custom missions
    const allMissions = useMemo(() => {
        return [...dynamicMissions, ...customMissions];
    }, [dynamicMissions, customMissions]);

    // Use dynamically generated missions instead of static ones
    const activeMissions = useMemo(() => {
        return allMissions.filter(m => m.status === 'active');
    }, [allMissions]);

    // Handle mission creation from constructor
    const handleCreateMission = useCallback((formData: { title: string; description: string; deadline: string; assessmentColumns: string[] }) => {
        const today = new Date().toISOString().split('T')[0];
        const missionId = `custom-${Date.now()}`;
        
        // Convert column names to assessment IDs (lowercase)
        const assessmentIds = formData.assessmentColumns.map(col => col.toLowerCase().replace(/\s+/g, ''));
        
        // Find students missing these assessments
        const missingStudents = findStudentsMissingAssessments(assessmentIds);
        
        const newMission: Mission = {
            mission_id: missionId,
            title: formData.title,
            description: formData.description || `Students must complete: ${formData.assessmentColumns.join(', ')}`,
            deadline: formData.deadline,
            created_date: today,
            status: 'active',
            check_type: 'assessment-ids',
            assessment_ids: assessmentIds,
            assessment_display_names: formData.assessmentColumns,
            students_assigned: missingStudents
        };
        
        setCustomMissions(prev => [...prev, newMission]);
        setShowMissionConstructor(false);
    }, [findStudentsMissingAssessments]);

    const getMissionProgress = (mission: Mission) => {
        // Get students assigned to this mission
        const assignedStudents = mission.students_assigned || [];
        
        // Filter to only show pending and in_progress students
        const activeStudents = assignedStudents.filter(
            sp => sp.status === 'pending' || sp.status === 'in_progress'
        );

        // Build student details with their progress
        const studentsWithDetails = activeStudents.map(studentProgress => {
            const student = students.find(s => s.id === studentProgress.student_id);
            
            return {
                student: student!,
                studentProgress,
                missingTests: studentProgress.missing_assessments || []
            };
        }).filter(item => item.student); // Remove any students not found

        // Group by class
        type StudentDetailsByClass = { 
            [className: string]: Array<{ 
                student: StudentData; 
                studentProgress: StudentMissionProgress;
                missingTests: string[] 
            }> 
        };
        
        const studentsByClass: StudentDetailsByClass = studentsWithDetails.reduce<StudentDetailsByClass>((acc, item) => {
            const className = item.student.class_name || 'Unknown Class';
            if (!acc[className]) {
                acc[className] = [];
            }
            acc[className].push(item);
            return acc;
        }, {});

        return {
            studentsByClass,
            totalCount: activeStudents.length,
            checkType: mission.check_type
        };
    };

    const isDeadlinePassed = (deadline: string) => {
        return new Date(deadline) < new Date();
    };

    const getDaysUntilDeadline = (deadline: string) => {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Handle grade input change
    const handleGradeInput = useCallback((studentId: string, assessmentType: 'KD' | 'SD1' | 'SD2' | 'SD3', value: string) => {
        const key = `${studentId}-${assessmentType}`;
        setGradeInputs(prev => {
            const newInputs = new Map(prev);
            if (value.trim() === '') {
                newInputs.delete(key);
            } else {
                newInputs.set(key, { studentId, assessmentType, value: value.trim() });
            }
            return newInputs;
        });
    }, []);

    // Save all grade inputs
    const handleSaveGrades = useCallback(() => {
        if (gradeInputs.size === 0 || !onDataChange) return;
        
        setIsSaving(true);
        const today = new Date().toISOString().split('T')[0];
        const timestamp = new Date().toISOString();

        const updatedStudents = students.map(student => {
            const studentInputs = Array.from(gradeInputs.values()).filter(
                input => input.studentId === student.id
            );

            if (studentInputs.length === 0) return student;

            const newAssessments = [...(student.assessments || [])];

            studentInputs.forEach(input => {
                const score = parseFloat(input.value);
                if (isNaN(score)) return;

                if (input.assessmentType === 'KD') {
                    // Find existing KD2 assessment or create new one
                    const existingIndex = newAssessments.findIndex(a => a.assessment_id === 'kd2');
                    const kdAssessment = {
                        date: today,
                        column: 'KD2',
                        type: 'summative' as const,
                        task_name: 'KD2: Cambridge Unit 2',
                        score: score.toString(),
                        comment: '',
                        added: existingIndex === -1 ? timestamp : newAssessments[existingIndex].added,
                        updated: timestamp,
                        assessment_id: 'kd2',
                        assessment_title: 'KD2',
                        evaluation_details: {
                            percentage_score: score,
                            myp_score: null,
                            cambridge_score: null
                        }
                    };

                    if (existingIndex !== -1) {
                        newAssessments[existingIndex] = kdAssessment;
                    } else {
                        newAssessments.push(kdAssessment);
                    }
                } else {
                    // SD1, SD2, SD3 tests
                    const testMap = {
                        'SD1': {
                            id: 'sd1',
                            title: 'SD1: Irrational Numbers',
                            column: 'SD1'
                        },
                        'SD2': {
                            id: 'sd2',
                            title: 'SD2: Standard Form',
                            column: 'SD2'
                        },
                        'SD3': {
                            id: 'sd3',
                            title: 'SD3: Indices',
                            column: 'SD3'
                        }
                    };

                    const testInfo = testMap[input.assessmentType];
                    const existingIndex = newAssessments.findIndex(a => a.assessment_id === testInfo.id);

                    const testAssessment = {
                        date: today,
                        column: testInfo.column,
                        type: 'test' as const,
                        task_name: testInfo.title,
                        score: score.toString(),
                        comment: '',
                        added: existingIndex === -1 ? timestamp : newAssessments[existingIndex].added,
                        updated: timestamp,
                        assessment_id: testInfo.id,
                        assessment_title: testInfo.title,
                        evaluation_details: {
                            percentage_score: score,
                            myp_score: null,
                            cambridge_score: null,
                            cambridge_score_1: null,
                            cambridge_score_2: null
                        }
                    };

                    if (existingIndex !== -1) {
                        newAssessments[existingIndex] = testAssessment;
                    } else {
                        newAssessments.push(testAssessment);
                    }
                }
            });

            return {
                ...student,
                assessments: newAssessments
            };
        });

        onDataChange(updatedStudents);
        setGradeInputs(new Map());
        setIsSaving(false);
    }, [gradeInputs, students, onDataChange]);

    // Discard all grade inputs
    const handleDiscardGrades = useCallback(() => {
        setGradeInputs(new Map());
    }, []);

    const hasUnsavedGrades = gradeInputs.size > 0;

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Objectives & Missions</h2>
                        <p className="text-gray-600">Track and manage missing data collection tasks</p>
                    </div>
                    {!hasUnsavedGrades && (
                        <button
                            onClick={() => setShowMissionConstructor(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Mission
                        </button>
                    )}
                    {hasUnsavedGrades && (
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">
                                {gradeInputs.size} grade{gradeInputs.size !== 1 ? 's' : ''} pending
                            </span>
                            <button
                                onClick={handleDiscardGrades}
                                disabled={isSaving}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleSaveGrades}
                                disabled={isSaving}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold"
                            >
                                {isSaving ? 'Saving...' : 'Save All Grades'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {activeMissions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No active missions at this time</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {activeMissions.map((mission) => {
                        const progress = getMissionProgress(mission);
                        const daysLeft = getDaysUntilDeadline(mission.deadline);
                        const isPassed = isDeadlinePassed(mission.deadline);
                        const isUrgent = daysLeft <= 3 && !isPassed;

                        return (
                            <div
                                key={mission.mission_id}
                                className={`bg-white rounded-lg shadow-md border-2 overflow-hidden transition-all hover:shadow-lg ${
                                    isPassed
                                        ? 'border-red-300'
                                        : isUrgent
                                        ? 'border-orange-300'
                                        : 'border-blue-300'
                                }`}
                            >
                                {/* Mission Header */}
                                <div
                                    className={`px-6 py-4 ${
                                        isPassed
                                            ? 'bg-red-50'
                                            : isUrgent
                                            ? 'bg-orange-50'
                                            : 'bg-blue-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {mission.title}
                                            </h3>
                                            <p className="text-gray-700 text-sm">{mission.description}</p>
                                        </div>
                                        <div
                                            className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${
                                                isPassed
                                                    ? 'bg-red-200 text-red-800'
                                                    : isUrgent
                                                    ? 'bg-orange-200 text-orange-800'
                                                    : 'bg-blue-200 text-blue-800'
                                            }`}
                                        >
                                            {progress.totalCount}
                                        </div>
                                    </div>
                                </div>

                                {/* Mission Details */}
                                <div className="px-6 py-4">
                                    {/* Deadline Info */}
                                    <div className="mb-4 flex items-center space-x-2">
                                        <span className="text-2xl">📅</span>
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium">Deadline</p>
                                            <p
                                                className={`text-base font-semibold ${
                                                    isPassed
                                                        ? 'text-red-600'
                                                        : isUrgent
                                                        ? 'text-orange-600'
                                                        : 'text-gray-900'
                                                }`}
                                            >
                                                {new Date(mission.deadline).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                                {!isPassed && (
                                                    <span className="ml-2 text-sm text-gray-500">
                                                        ({daysLeft} {daysLeft === 1 ? 'day' : 'days'} left)
                                                    </span>
                                                )}
                                                {isPassed && (
                                                    <span className="ml-2 text-sm text-red-500">(Overdue)</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Summary */}
                                    {progress.totalCount === 0 ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center space-x-2">
                                            <span className="text-2xl">✅</span>
                                            <p className="text-green-800 font-medium">
                                                All students have completed this assessment!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                                    Students Needing {mission.assessment_display_name || 'Assessment'}
                                                </h4>
                                                <span className="text-sm text-gray-500">
                                                    {progress.totalCount} student{progress.totalCount !== 1 ? 's' : ''}
                                                </span>
                                            </div>

                                            {/* Students grouped by class */}
                                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                                {Object.entries(progress.studentsByClass)
                                                    .sort(([classA], [classB]) => classA.localeCompare(classB))
                                                    .map(([className, classStudents]) => (
                                                        <div
                                                            key={className}
                                                            className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h5 className="font-semibold text-gray-900 text-sm">
                                                                    {className}
                                                                </h5>
                                                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                                                    {classStudents.length}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {classStudents.map((item) => {
                                                                    const statusColors = {
                                                                        'pending': 'bg-gray-100 border-gray-300',
                                                                        'in_progress': 'bg-blue-50 border-blue-300',
                                                                        'completed': 'bg-green-50 border-green-300',
                                                                        'cancelled': 'bg-red-50 border-red-300'
                                                                    };
                                                                    
                                                                    return (
                                                                        <div
                                                                            key={item.student.id}
                                                                            className={`px-3 py-2 rounded-md border ${statusColors[item.studentProgress.status] || 'bg-white border-gray-300'}`}
                                                                        >
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <span className="text-sm font-medium text-gray-900">
                                                                                    {item.student.first_name} {item.student.last_name}
                                                                                    {item.studentProgress.status === 'in_progress' && (
                                                                                        <span className="ml-2 text-xs text-blue-600 font-semibold">
                                                                                            (In Progress)
                                                                                        </span>
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                            
                                                                            {/* Grade Input Fields */}
                                                                            <div className="flex items-center space-x-2 mt-2">
                                                                                {mission.check_type === 'column' && mission.assessment_column === 'KD2' && (
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <label className="text-xs font-semibold text-gray-700">
                                                                                            KD2:
                                                                                        </label>
                                                                                        <input
                                                                                            type="number"
                                                                                            min="0"
                                                                                            max="10"
                                                                                            step="0.1"
                                                                                            placeholder="0-10"
                                                                                            value={gradeInputs.get(`${item.student.id}-KD`)?.value || ''}
                                                                                            onChange={(e) => handleGradeInput(item.student.id!, 'KD', e.target.value)}
                                                                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                                
                                                                                {mission.check_type === 'assessment-ids' && item.missingTests.map((testName) => (
                                                                                    <div key={testName} className="flex items-center space-x-2">
                                                                                        <label className="text-xs font-semibold text-gray-700">
                                                                                            {testName}:
                                                                                        </label>
                                                                                        <input
                                                                                            type="number"
                                                                                            min="0"
                                                                                            max="10"
                                                                                            step="0.1"
                                                                                            placeholder="0-10"
                                                                                            value={gradeInputs.get(`${item.student.id}-${testName}`)?.value || ''}
                                                                                            onChange={(e) => handleGradeInput(
                                                                                                item.student.id!, 
                                                                                                testName as 'SD1' | 'SD2' | 'SD3', 
                                                                                                e.target.value
                                                                                            )}
                                                                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                        />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            
                                                                            {item.studentProgress.notes && (
                                                                                <p className="text-xs text-gray-600 mt-2">
                                                                                    {item.studentProgress.notes}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Mission Constructor Modal */}
            {showMissionConstructor && (
                <MissionConstructor
                    onCreateMission={handleCreateMission}
                    onClose={() => setShowMissionConstructor(false)}
                />
            )}
        </div>
    );
};

export default ObjectivesSection;




