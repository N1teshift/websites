import React, { useMemo } from 'react';
import { StudentData } from '../../types/ProgressReportTypes';
import { getStudentFullName } from '../../utils/progressReportUtils';

interface ExerciseProgress {
    lesson: string;
    date: string;
    exerciseNumber: number | null;
    difficultyPath: 'A' | 'B' | 'C' | null;
}

interface StudentJourney {
    student: StudentData;
    progress: ExerciseProgress[];
    unparseableData?: Array<{ column: string; date: string; score: string }>;
}

interface LearningJourneyTimelineProps {
    students: StudentData[];
    selectedClass: string;
}

// Parse score string like "23B", "45", "67C" into exercise number and difficulty
// Also handles letter-only entries like "A", "B", "C" (participation without exercise number)
const parseExerciseScore = (score: string): { exerciseNumber: number | null; difficultyPath: 'A' | 'B' | 'C' | null; isValid: boolean } => {
    if (!score || score === '0' || score === '0?' || score.trim() === '') {
        return { exerciseNumber: null, difficultyPath: null, isValid: true };
    }

    // Remove whitespace
    const cleanScore = score.trim();
    
    // Check for letter-only entry (participation without exercise number)
    if (/^[ABC]$/.test(cleanScore)) {
        return { 
            exerciseNumber: null, 
            difficultyPath: cleanScore as 'A' | 'B' | 'C',
            isValid: true // This is a valid entry type (participated but no exercise tracked)
        };
    }
    
    // Extract number and letter (e.g., "23B", "45", "67C")
    const match = cleanScore.match(/^(\d+)([ABC]?)$/);
    
    if (match) {
        const exerciseNumber = parseInt(match[1], 10);
        const difficultyPath = match[2] ? (match[2] as 'A' | 'B' | 'C') : null;
        return { exerciseNumber, difficultyPath, isValid: true };
    }
    
    // If we get here, it's an unrecognized format
    return { exerciseNumber: null, difficultyPath: null, isValid: false };
};

// Extract EXT1-12 data from October 20 - November 7
const extractLearningJourneys = (students: StudentData[], selectedClass: string): StudentJourney[] => {
    const extColumns = [
        { column: 'EXT1', date: '2025-10-20', lesson: 'Lesson 1' },
        { column: 'EXT2', date: '2025-10-21', lesson: 'Lesson 2' },
        { column: 'EXT3', date: '2025-10-22', lesson: 'Lesson 3' },
        { column: 'EXT4', date: '2025-10-23', lesson: 'Lesson 4' },
        { column: 'EXT5', date: '2025-10-24', lesson: 'Lesson 5' },
        { column: 'EXT6', date: '2025-10-27', lesson: 'Lesson 6' },
        { column: 'EXT7', date: '2025-10-28', lesson: 'Lesson 7' },
        { column: 'EXT8', date: '2025-10-29', lesson: 'Lesson 8' },
        { column: 'EXT9', date: '2025-10-30', lesson: 'Lesson 9' },
        { column: 'EXT10', date: '2025-11-05', lesson: 'Lesson 10' },
        { column: 'EXT11', date: '2025-11-06', lesson: 'Lesson 11' },
        { column: 'EXT12', date: '2025-11-07', lesson: 'Lesson 12' },
    ];

    const filteredStudents = selectedClass === 'all' 
        ? students 
        : students.filter(s => s.class_name === selectedClass);

    return filteredStudents.map(student => {
        const unparseableData: Array<{ column: string; date: string; score: string }> = [];
        
        const progress: ExerciseProgress[] = extColumns.map(({ column, date, lesson }) => {
            const assessment = student.assessments?.find(
                a => a.column === column && a.date === date
            );

            if (assessment) {
                const { exerciseNumber, difficultyPath, isValid } = parseExerciseScore(assessment.score);
                
                // Check if there was data but it couldn't be parsed (and it's not a valid format)
                if (!isValid) {
                    unparseableData.push({ column, date, score: assessment.score });
                }
                
                return { lesson, date, exerciseNumber, difficultyPath };
            }

            return { lesson, date, exerciseNumber: null, difficultyPath: null };
        });

        return { 
            student, 
            progress, 
            unparseableData: unparseableData.length > 0 ? unparseableData : undefined 
        };
    });
};

// Topic sections configuration
const topicSections = [
    { topic: '2.8', startEx: 1, endEx: 17, color: '#fef3c7' },      // yellow-100
    { topic: '2.9', startEx: 18, endEx: 32, color: '#dbeafe' },     // blue-100
    { topic: '2.10', startEx: 33, endEx: 46, color: '#fce7f3' },    // pink-100
    { topic: '2.11', startEx: 47, endEx: 62, color: '#d1fae5' },    // green-100
    { topic: '2.12', startEx: 63, endEx: 78, color: '#e0e7ff' },    // indigo-100
    { topic: '2.13', startEx: 79, endEx: 94, color: '#fce4ec' },    // rose-100
    { topic: '2.14', startEx: 95, endEx: 107, color: '#f0fdf4' },   // emerald-100
    { topic: '2.15', startEx: 108, endEx: 123, color: '#fef9c3' },  // amber-100
];

const LearningJourneyTimeline: React.FC<LearningJourneyTimelineProps> = ({ students, selectedClass }) => {
    const journeys = useMemo(() => 
        extractLearningJourneys(students, selectedClass),
        [students, selectedClass]
    );

    // Calculate the max exercise number for scaling
    const maxExercise = useMemo(() => {
        let max = 123; // Default maximum
        journeys.forEach(journey => {
            journey.progress.forEach(p => {
                if (p.exerciseNumber && p.exerciseNumber > max) {
                    max = p.exerciseNumber;
                }
            });
        });
        return Math.max(max, 123); // Ensure at least 123
    }, [journeys]);

    // Get difficulty color
    const getDifficultyColor = (difficulty: 'A' | 'B' | 'C' | null): string => {
        if (!difficulty) return '#94a3b8'; // gray for no path
        switch (difficulty) {
            case 'A': return '#22c55e'; // green for easy
            case 'B': return '#3b82f6'; // blue for normal
            case 'C': return '#ef4444'; // red for challenging
            default: return '#94a3b8';
        }
    };

    const getDifficultyLabel = (difficulty: 'A' | 'B' | 'C' | null): string => {
        if (!difficulty) return 'No path';
        switch (difficulty) {
            case 'A': return 'Easy';
            case 'B': return 'Normal';
            case 'C': return 'Challenging';
            default: return 'Unknown';
        }
    };

    // Convert exercise number to x position (percentage)
    const exerciseToXPosition = (exerciseNum: number | null): number | null => {
        if (exerciseNum === null) return null;
        return (exerciseNum / maxExercise) * 100;
    };

    // Separate students with and without data
    const journeysWithData = journeys.filter(j => j.progress.some(p => p.exerciseNumber !== null));
    const journeysWithoutData = journeys.filter(j => !j.progress.some(p => p.exerciseNumber !== null));
    
    // Collect students with unparseable data
    const journeysWithUnparseableData = journeys.filter(j => j.unparseableData && j.unparseableData.length > 0);

    if (journeys.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No students available for the selected class.
            </div>
        );
    }

    const svgHeight = journeys.length * 50 + 120; // 50px per student + padding
    const timelineY = 40; // Y position for timeline
    const studentLaneStartY = 110; // Start Y for student lanes (increased to avoid overlap with topic labels)

    return (
        <div className="space-y-4">
            {/* Data Quality Warning */}
            {journeysWithUnparseableData.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Data Quality Warning: {journeysWithUnparseableData.length} student(s) with unparseable EXT data
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p className="mb-2">The following students have EXT data that could not be parsed (expected format: number + optional A/B/C):</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {journeysWithUnparseableData.map(journey => (
                                        <li key={journey.student.id}>
                                            <strong>{getStudentFullName(journey.student)}</strong> - 
                                            {journey.unparseableData?.map((data, idx) => (
                                                <span key={idx} className="ml-1">
                                                    {data.column}: &quot;{data.score}&quot;
                                                    {idx < (journey.unparseableData?.length || 0) - 1 ? ', ' : ''}
                                                </span>
                                            ))}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="space-y-3">
                <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">Difficulty Paths:</div>
                    <div className="flex items-center gap-6 text-sm text-black">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <span>Easy (A)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                            <span>Normal (B)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                            <span>Challenging (C)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                            <span>No path specified</span>
                        </div>
                    </div>
                </div>
                
                <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">Topics:</div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-black">
                        {topicSections.map((section) => (
                            <div key={section.topic} className="flex items-center gap-1.5">
                                <div 
                                    className="w-4 h-4 rounded" 
                                    style={{ backgroundColor: section.color }}
                                ></div>
                                <span>
                                    <strong>{section.topic}</strong> (Ex {section.startEx}-{section.endEx})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timeline Visualization */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
                <svg width="100%" height={svgHeight} className="min-w-[800px]">
                    {/* Topic sections background */}
                    {topicSections.map((section) => {
                        const startX = 10 + (section.startEx / maxExercise) * 80;
                        const endX = 10 + (section.endEx / maxExercise) * 80;
                        const width = endX - startX;
                        
                        return (
                            <g key={`section-${section.topic}`}>
                                {/* Background rectangle for topic section */}
                                <rect
                                    x={`${startX}%`}
                                    y={studentLaneStartY}
                                    width={`${width}%`}
                                    height={journeys.length * 50}
                                    fill={section.color}
                                    opacity="0.3"
                                />
                                {/* Topic label - positioned above the background */}
                                <text
                                    x={`${startX + width / 2}%`}
                                    y={timelineY + 25}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fontWeight="600"
                                    fill="#374151"
                                >
                                    Topic {section.topic}
                                </text>
                            </g>
                        );
                    })}
                    
                    {/* Main timeline axis */}
                    <line 
                        x1="10%" 
                        y1={timelineY} 
                        x2="90%" 
                        y2={timelineY} 
                        stroke="#d1d5db" 
                        strokeWidth="2"
                    />
                    
                    {/* Exercise markers on timeline - use topic boundaries */}
                    {topicSections.map((section) => {
                        const startX = 10 + (section.startEx / maxExercise) * 80;
                        return (
                            <g key={`marker-${section.startEx}`}>
                                <line 
                                    x1={`${startX}%`} 
                                    y1={timelineY - 5} 
                                    x2={`${startX}%`} 
                                    y2={timelineY + 5} 
                                    stroke="#9ca3af" 
                                    strokeWidth="2"
                                />
                                <text 
                                    x={`${startX}%`} 
                                    y={timelineY - 12} 
                                    textAnchor="middle" 
                                    fontSize="12" 
                                    fill="#6b7280"
                                >
                                    {section.startEx}
                                </text>
                            </g>
                        );
                    })}
                    {/* Final marker at 123 */}
                    <g key="marker-123">
                        <line 
                            x1="90%" 
                            y1={timelineY - 5} 
                            x2="90%" 
                            y2={timelineY + 5} 
                            stroke="#9ca3af" 
                            strokeWidth="2"
                        />
                        <text 
                            x="90%" 
                            y={timelineY - 12} 
                            textAnchor="middle" 
                            fontSize="12" 
                            fill="#6b7280"
                        >
                            123
                        </text>
                    </g>
                    
                    <text 
                        x="50%" 
                        y={timelineY - 25} 
                        textAnchor="middle" 
                        fontSize="14" 
                        fontWeight="bold" 
                        fill="#374151"
                    >
                        Exercise Progress (1-123) by Topic
                    </text>

                    {/* Student lanes */}
                    {journeys.map((journey, index) => {
                        const laneY = studentLaneStartY + index * 50;
                        const studentName = getStudentFullName(journey.student);
                        
                        // Filter valid progress points
                        const validPoints = journey.progress
                            .map((p, i) => ({ ...p, lessonIndex: i }))
                            .filter(p => p.exerciseNumber !== null);
                        
                        const hasNoData = validPoints.length === 0;

                        return (
                            <g key={journey.student.id}>
                                {/* Student name label */}
                                <text 
                                    x="2%" 
                                    y={laneY + 5} 
                                    fontSize="11" 
                                    fill={hasNoData ? "#9ca3af" : "#374151"}
                                    fontWeight="500"
                                >
                                    {studentName}
                                </text>
                                
                                {/* "No data" indicator for students without EXT data */}
                                {hasNoData && (
                                    <text 
                                        x="12%" 
                                        y={laneY + 5} 
                                        fontSize="10" 
                                        fill="#9ca3af"
                                        fontStyle="italic"
                                    >
                                        (No EXT data)
                                    </text>
                                )}
                                
                                {/* Student lane line */}
                                <line 
                                    x1="10%" 
                                    y1={laneY} 
                                    x2="90%" 
                                    y2={laneY} 
                                    stroke={hasNoData ? "#f3f4f6" : "#e5e7eb"}
                                    strokeWidth="1"
                                    strokeDasharray="3,3"
                                />

                                {/* Connect points with lines */}
                                {validPoints.map((point, i) => {
                                    if (i === validPoints.length - 1) return null;
                                    const nextPoint = validPoints[i + 1];
                                    const x1 = 10 + (exerciseToXPosition(point.exerciseNumber) ?? 0) * 0.8;
                                    const x2 = 10 + (exerciseToXPosition(nextPoint.exerciseNumber) ?? 0) * 0.8;
                                    
                                    return (
                                        <line
                                            key={`line-${journey.student.id}-${i}`}
                                            x1={`${x1}%`}
                                            y1={laneY}
                                            x2={`${x2}%`}
                                            y2={laneY}
                                            stroke="#cbd5e1"
                                            strokeWidth="2"
                                        />
                                    );
                                })}

                                {/* Plot points for each lesson */}
                                {validPoints.map((point) => {
                                    const xPos = 10 + (exerciseToXPosition(point.exerciseNumber) ?? 0) * 0.8;
                                    const color = getDifficultyColor(point.difficultyPath);
                                    
                                    return (
                                        <g key={`${journey.student.id}-${point.lesson}`}>
                                            <circle
                                                cx={`${xPos}%`}
                                                cy={laneY}
                                                r="6"
                                                fill={color}
                                                stroke="white"
                                                strokeWidth="2"
                                            >
                                                <title>
                                                    {studentName} - {point.lesson} ({point.date})
                                                    {'\n'}Exercise: {point.exerciseNumber}
                                                    {'\n'}Path: {getDifficultyLabel(point.difficultyPath)}
                                                </title>
                                            </circle>
                                            {/* Exercise number label near dot */}
                                            <text
                                                x={`${xPos}%`}
                                                y={laneY - 12}
                                                textAnchor="middle"
                                                fontSize="9"
                                                fill="#6b7280"
                                                fontWeight="600"
                                            >
                                                {point.exerciseNumber}
                                            </text>
                                        </g>
                                    );
                                })}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="font-semibold text-blue-900">Total Students</div>
                    <div className="text-2xl font-bold text-blue-600">{journeys.length}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="font-semibold text-green-900">With EXT Data</div>
                    <div className="text-2xl font-bold text-green-600">{journeysWithData.length}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="font-semibold text-gray-900">Without Data</div>
                    <div className="text-2xl font-bold text-gray-600">{journeysWithoutData.length}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="font-semibold text-purple-900">Tracking Period</div>
                    <div className="text-lg font-bold text-purple-600">Oct 20 - Nov 7, 2025</div>
                </div>
            </div>
        </div>
    );
};

export default LearningJourneyTimeline;




